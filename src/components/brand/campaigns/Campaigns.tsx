"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useBrandStore } from "@/stores/brandStore";
import { FaPlus } from "react-icons/fa";
import NewCampaign from "./NewCampaign";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/utils/ToastNotification";
import EditCampaign from "./EditCampaign";
import InfluencerDetailsModal from "./InfluencerDetailsModal";
import AllInfluencersModal from "./AllInfluencers";
import axios from "axios";

// Flutterwave types
interface FlutterwaveConfig {
  public_key: string;
  tx_ref: string;
  amount: number;
  currency: string;
  payment_options: string;
  customer: {
    email: string;
    phone_number: string;
    name: string;
  };
  customizations: {
    title: string;
    description: string;
    logo: string;
  };
  callback: (response: any) => void;
  onclose: () => void;
}

declare global {
  interface Window {
    FlutterwaveCheckout: (config: FlutterwaveConfig) => void;
  }
}

// Platform data interface matching your schema
interface PlatformData {
  followers: string;
  url: string;
  impressions: string;
  proofUrl?: string;
}

// Influencer interface matching your schema
interface Influencer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  location: string;
  niches: string[];
  audienceLocation?: string;
  malePercentage?: string;
  femalePercentage?: string;
  audienceProofUrl?: string;

  // Platform data
  instagram?: PlatformData;
  twitter?: PlatformData;
  tiktok?: PlatformData;
  youtube?: PlatformData;
  facebook?: PlatformData;
  linkedin?: PlatformData;
  discord?: PlatformData;
  threads?: PlatformData;
  snapchat?: PlatformData;

  // Calculated earnings
  followerFee?: number;
  impressionFee?: number;
  locationFee?: number;
  nicheFee?: number;
  earningsPerPost?: number;
  earningsPerPostNaira?: number;
  maxMonthlyEarnings?: number;
  maxMonthlyEarningsNaira?: number;
  followersCount?: number;

  // Legacy fields
  amountPerPost?: string;
  amountPerMonth?: string;

  // Metadata
  status: "pending" | "approved" | "rejected";
  emailSent: boolean;
  isValidated: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Updated Campaign interface to match the brand store
interface Campaign {
  _id?: string;
  role: "Brand" | "Business" | "Person" | "Movie" | "Music" | "Other";
  platforms: string[];
  brandName: string;
  email: string;
  brandPhone: string;
  influencersMin: number;
  influencersMax: number;
  followersRange?:
    | ""
    | "1k-3k"
    | "3k-10k"
    | "10k-20k"
    | "20k-50k"
    | "50k & above";
  location: string;
  additionalLocations?: string[];
  postFrequency?: string;
  postDuration?: string;
  avgInfluencers?: number;
  postCount?: number;
  costPerInfluencerPerPost?: number;
  totalBaseCost?: number;
  platformFee?: number;
  totalCost?: number;
  hasPaid?: boolean;
  status: "pending" | "approved" | "rejected";
  createdAt?: string;
  updatedAt?: string;
  assignedInfluencers: string[];
}

const Campaigns: React.FC = () => {
  const router = useRouter();
  const {
    campaigns,
    user,
    campaignsLoading,
    campaignsError,
    fetchCampaigns,
    fetchCampaignsByEmail,
    deleteCampaign,
    updateCampaign,
    clearErrors,
  } = useBrandStore();

  const [filter, setFilter] = useState<
    "all" | "paid" | "unpaid" | "approved" | "rejected" | "pending"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [newCampaign, setNewCampaign] = useState<boolean>(false);
  const [editCampaign, setEditCampaign] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deletingID, setDeletingID] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [assignedInf, setAssignedInf] = useState<Record<string, Influencer[]>>(
    {}
  );
  const [payingCampaign, setPayingCampaign] = useState<string>("");
  const [isProcessingPayment, setIsProcessingPayment] =
    useState<boolean>(false);

  // Modal states
  const [showInfluencerDetails, setShowInfluencerDetails] =
    useState<boolean>(false);
  const [showAllInfluencers, setShowAllInfluencers] = useState<boolean>(false);
  const [selectedInfluencer, setSelectedInfluencer] =
    useState<Influencer | null>(null);
  const [selectedCampaignInfluencers, setSelectedCampaignInfluencers] =
    useState<{
      influencers: Influencer[];
      campaignName: string;
    } | null>(null);

  const { showToast } = useToast();

  // Load Flutterwave script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.flutterwave.com/v3.js";
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup script if needed
      const existingScript = document.querySelector(
        'script[src="https://checkout.flutterwave.com/v3.js"]'
      );
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  // Fetch campaigns on component mount
  useEffect(() => {
    const loadCampaigns = async () => {
      if (user?.email) {
        await fetchCampaignsByEmail(user.email);
      } else {
        await fetchCampaigns();
      }
    };

    loadCampaigns();
    return () => clearErrors();
  }, [user?.email, fetchCampaigns, fetchCampaignsByEmail, clearErrors]);

  useEffect(() => {
    if (campaigns.length > 0) {
      campaigns.forEach((c) => {
        if (c.assignedInfluencers?.length > 0) {
          c.assignedInfluencers.forEach((infId) => {
            fetchInfluencerById(c._id!, infId);
          });
        }
      });
    }
  }, [campaigns]);

  const fetchInfluencerById = async (campaignId: string, id: string) => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/influencers/${id}`
      );

      if (res.status === 200) {
        const influencer = res.data?.data?.influencer;
        setAssignedInf((prev) => {
          const existing = prev[campaignId] || [];
          const alreadyAdded = existing.some(
            (inf) => inf._id === influencer._id
          );

          if (alreadyAdded) return prev; // Correctly skips if already found

          return {
            ...prev,
            [campaignId]: [...existing, influencer],
          };
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Handle individual influencer click
  const handleInfluencerClick = (influencer: Influencer) => {
    setSelectedInfluencer(influencer);
    setShowInfluencerDetails(true);
  };

  // Handle "show all influencers" click
  const handleShowAllInfluencers = (campaign: Campaign) => {
    const campaignInfluencers = assignedInf[campaign._id!] || [];
    setSelectedCampaignInfluencers({
      influencers: campaignInfluencers,
      campaignName: campaign.brandName,
    });
    setShowAllInfluencers(true);
  };

  // Handle influencer click from all influencers modal
  const handleInfluencerClickFromModal = (influencer: Influencer) => {
    setShowAllInfluencers(false);
    setSelectedInfluencer(influencer);
    setShowInfluencerDetails(true);
  };

  // Close modals
  const closeInfluencerDetailsModal = () => {
    setShowInfluencerDetails(false);
    setSelectedInfluencer(null);
  };

  const closeAllInfluencersModal = () => {
    setShowAllInfluencers(false);
    setSelectedCampaignInfluencers(null);
  };

  // Flutterwave payment handler
  const handlePayment = (campaign: Campaign) => {
    if (!campaign.totalCost || campaign.totalCost <= 0) {
      showToast({
        type: "error",
        title: "Payment Error",
        message: "Invalid campaign cost. Please contact support.",
        duration: 6000,
      });
      return;
    }

    if (!user) {
      showToast({
        type: "error",
        title: "Authentication Error",
        message: "Please log in to make payment.",
        duration: 6000,
      });
      return;
    }

    setPayingCampaign(campaign._id || "");
    setIsProcessingPayment(true);

    const config: FlutterwaveConfig = {
      public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || "", // Add your Flutterwave public key to env
      tx_ref: `campaign_${campaign._id}_${Date.now()}`, // Unique transaction reference
      amount: campaign.totalCost,
      currency: "NGN",
      payment_options: "card,mobilemoney,ussd,banktransfer",
      customer: {
        email: user.email || campaign.email,
        phone_number: campaign.brandPhone || "",
        name: campaign.brandName,
      },
      customizations: {
        title: "Campaign Payment",
        description: `Payment for ${campaign.brandName} campaign`,
        logo: "/logo.png",
      },
      callback: (response: any) => {
        handlePaymentCallback(response, campaign);
      },
      onclose: () => {
        setIsProcessingPayment(false);
        setPayingCampaign("");
        showToast({
          type: "info",
          title: "Payment Cancelled",
          message: "Payment was cancelled. You can try again anytime.",
          duration: 4000,
        });
      },
    };

    if (window.FlutterwaveCheckout) {
      window.FlutterwaveCheckout(config);
    } else {
      setIsProcessingPayment(false);
      setPayingCampaign("");
      showToast({
        type: "error",
        title: "Payment Error",
        message: "Payment system is not available. Please try again later.",
        duration: 6000,
      });
    }
  };

  // Handle payment callback
  const handlePaymentCallback = async (response: any, campaign: Campaign) => {
    try {
      if (response.status === "successful") {
        // Verify payment on your backend (recommended)
        const verificationResult = await verifyPayment(response.transaction_id);

        if (verificationResult.success) {
          const updatedCampaign: any = {
            ...campaign,
            hasPaid: true,
            paymentReference: response.transaction_id,
            paymentDate: new Date().toISOString(),
          };

          await updateCampaign(campaign._id!, updatedCampaign);

          showToast({
            type: "success",
            title: "Payment Successful!",
            message: "Your campaign payment has been processed successfully.",
            duration: 8000,
          });

          // Refresh campaigns list
          if (user?.email) {
            await fetchCampaignsByEmail(user.email);
          } else {
            await fetchCampaigns();
          }
        } else {
          throw new Error("Payment verification failed");
        }
      } else {
        throw new Error("Payment was not successful");
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Payment Error",
        message:
          "There was an issue processing your payment. Please contact support if you were charged.",
        duration: 10000,
      });
    } finally {
      setIsProcessingPayment(false);
      setPayingCampaign("");
    }
  };

  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          return user?.data?.token || user?.token || null;
        }
      } catch (err) {
        console.error("Error parsing user token:", err);
      }
    }
    return null;
  };
  const token = getAuthToken();

  // Verify payment on backend (you'll need to implement this endpoint)
  const verifyPayment = async (transactionId: string) => {
    try {
      const response = await fetch("/api/verify-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Assuming you have user token
        },
        body: JSON.stringify({ transactionId }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return { success: false };
    }
  };

  // Filter campaigns based on current filters
  const filteredCampaigns = campaigns.filter((campaign) => {
    // Status filter
    let matchesFilter = true;
    if (filter === "paid") matchesFilter = campaign.hasPaid === true;
    else if (filter === "unpaid") matchesFilter = campaign.hasPaid !== true;
    else if (filter === "approved")
      matchesFilter = campaign.status === "approved";
    else if (filter === "rejected")
      matchesFilter = campaign.status === "rejected";
    else if (filter === "pending")
      matchesFilter = campaign.status === "pending";

    // Search filter
    const matchesSearch =
      campaign.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.email.toLowerCase().includes(searchTerm.toLowerCase());

    // Platform filter
    const matchesPlatform =
      platformFilter === "all" ||
      campaign.platforms.some(
        (p) => p.toLowerCase() === platformFilter.toLowerCase()
      );

    // Role filter
    const matchesRole = roleFilter === "all" || campaign.role === roleFilter;

    return matchesFilter && matchesSearch && matchesPlatform && matchesRole;
  });

  const getStatusColor = (campaign: Campaign) => {
    switch (campaign.status) {
      case "approved":
        if (campaign.hasPaid) {
          return "bg-green-100 text-green-800"; // Active (Approved & Paid)
        } else {
          return "bg-blue-100 text-blue-800"; // Approved but Unpaid
        }
      case "rejected":
        return "bg-red-100 text-red-800"; // Rejected
      case "pending":
      default:
        if (campaign.hasPaid) {
          return "bg-yellow-100 text-yellow-800"; // Paid but Pending Approval
        } else {
          return "bg-gray-100 text-gray-800"; // Pending & Unpaid
        }
    }
  };

  const getStatusText = (campaign: Campaign) => {
    switch (campaign.status) {
      case "approved":
        if (campaign.hasPaid) {
          return "Active"; // Approved & Paid
        } else {
          return "Approved - Payment Required"; // Approved but not paid
        }
      case "rejected":
        return "Rejected";
      case "pending":
      default:
        if (campaign.hasPaid) {
          return "Paid - Pending Approval"; // Paid but waiting for approval
        } else {
          return "Pending"; // Not paid and not approved
        }
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await deleteCampaign(id);
      showToast({
        type: "success",
        title: "Success!",
        message: "Your campaign has been deleted!",
        duration: 6000,
      });
      setIsDeleting(false);
      setShowDeleteModal(false);
    } catch (error) {
      showToast({
        type: "error",
        title: "Sorry!",
        message:
          "We were not able to delete your campaign, please try again later.",
        duration: 6000,
      });
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (campaignsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (campaignsError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 text-lg font-medium mb-2">
              Error Loading Campaigns
            </div>
            <p className="text-red-600 mb-4">{campaignsError}</p>
            <button
              onClick={() =>
                user?.email
                  ? fetchCampaignsByEmail(user.email)
                  : fetchCampaigns()
              }
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Modals */}
      <InfluencerDetailsModal
        influencer={selectedInfluencer}
        isOpen={showInfluencerDetails}
        onClose={closeInfluencerDetailsModal}
      />

      <AllInfluencersModal
        influencers={selectedCampaignInfluencers?.influencers || []}
        campaignName={selectedCampaignInfluencers?.campaignName || ""}
        isOpen={showAllInfluencers}
        onClose={closeAllInfluencersModal}
        onInfluencerClick={handleInfluencerClickFromModal}
      />

      {newCampaign && <NewCampaign onBack={() => setNewCampaign(false)} />}
      {editCampaign && editingCampaign && (
        <EditCampaign
          onBack={() => {
            setEditCampaign(false);
            setEditingCampaign(null);
          }}
          campaignData={editingCampaign}
        />
      )}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            key="logout-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center p-8 z-50"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              key="logout-modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Confirm Action
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete this campaign?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteCampaign(deletingID)}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center gap-6 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
                <p className="text-gray-600 mt-1">
                  View what&apos;s happening with your campaigns.
                </p>
              </div>
              <button
                onClick={() => setNewCampaign(true)}
                className="bg-indigo-600 flex items-center gap-3 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-sm"
              >
                <FaPlus /> New
              </button>
            </div>

            {/* Filters and Search */}
            <div className="space-y-4 mb-6">
              {/* Search */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by brand name, location, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Filter buttons */}
              <div className="flex flex-wrap gap-2">
                {/* Status filters */}
                {[
                  "all",
                  "paid",
                  "unpaid",
                  "pending",
                  "approved",
                  "rejected",
                ].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status as typeof filter)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      filter === status
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>

              {/* Additional filters */}
              <div className="flex flex-wrap gap-4">
                {/* Role filter */}
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Roles</option>
                  <option value="Brand">Brand</option>
                  <option value="Business">Business</option>
                  <option value="Person">Person</option>
                  <option value="Movie">Movie</option>
                  <option value="Music">Music</option>
                  <option value="Other">Other</option>
                </select>

                {/* Platform filter */}
                <select
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Platforms</option>
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="tiktok">TikTok</option>
                  <option value="youtube">YouTube</option>
                  <option value="x">X</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="threads">Threads</option>
                  <option value="discord">Discord</option>
                  <option value="snapchat">Snapchat</option>
                </select>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-gray-900">
                  {campaigns.length}
                </div>
                <div className="text-gray-600">Total Campaigns</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-gray-900">
                  {campaigns.filter((c) => c.hasPaid).length}
                </div>
                <div className="text-gray-600">Paid Campaigns</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-gray-900">
                  {campaigns.filter((c) => c.status === "pending").length}
                </div>
                <div className="text-gray-600">Pending Approval</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-gray-900">
                  {campaigns.filter((c) => c.status === "approved").length}
                </div>
                <div className="text-gray-600">Approved Campaigns</div>
              </div>
            </div>
          </div>

          {/* Campaigns List */}
          <div className="space-y-4">
            {filteredCampaigns.length === 0 ? (
              <div className="bg-white p-12 rounded-lg shadow-sm text-center">
                <div className="text-gray-400 text-lg mb-2">
                  No campaigns found
                </div>
                <p className="text-gray-600 mb-6">
                  {searchTerm || filter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Create your first campaign to get started"}
                </p>
              </div>
            ) : (
              filteredCampaigns.map((campaign) => (
                <div
                  key={campaign._id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {campaign.brandName}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                              campaign
                            )}`}
                          >
                            {getStatusText(campaign)}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {campaign.role}
                          </span>
                        </div>

                        <p className="text-gray-600 mb-4">
                          {campaign.platforms.join(", ")} • {campaign.location}
                          {campaign.additionalLocations &&
                            campaign.additionalLocations.length > 0 &&
                            ` + ${campaign.additionalLocations.length} more`}
                        </p>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">
                              Influencers:
                            </span>
                            <div className="text-gray-900">
                              {campaign.influencersMin} -{" "}
                              {campaign.influencersMax}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Followers:
                            </span>
                            <div className="text-gray-900">
                              {campaign.followersRange || "Any"}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Budget:
                            </span>
                            <div className="text-gray-900">
                              {campaign.totalCost
                                ? formatCurrency(campaign.totalCost)
                                : "TBD"}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Created:
                            </span>
                            <div className="text-gray-900">
                              {formatDate(campaign.createdAt)}
                            </div>
                          </div>
                        </div>

                        {(campaign.postFrequency || campaign.postDuration) && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                              {campaign.postFrequency && (
                                <div>
                                  <span className="font-medium text-gray-700">
                                    Post Frequency:
                                  </span>
                                  <div className="text-gray-900">
                                    {campaign.postFrequency}
                                  </div>
                                </div>
                              )}
                              {campaign.postDuration && (
                                <div>
                                  <span className="font-medium text-gray-700">
                                    Duration:
                                  </span>
                                  <div className="text-gray-900">
                                    {campaign.postDuration}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {campaign.assignedInfluencers?.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="font-medium text-gray-700 mb-3">
                              Assigned Influencers (
                              {campaign.assignedInfluencers.length})
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {assignedInf[campaign._id!]
                                ?.slice(0, 3) // show only first 3
                                .map((inf, idx) => (
                                  <div
                                    key={inf._id || idx}
                                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md hover:bg-gray-100 transition cursor-pointer"
                                    onClick={() => handleInfluencerClick(inf)}
                                  >
                                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold">
                                      {inf.name?.charAt(0).toUpperCase() || "I"}
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="font-medium text-gray-900">
                                        {inf.name}
                                      </span>
                                      <span className="text-gray-600 text-sm">
                                        {inf.email}
                                      </span>
                                      <span className="text-gray-500 text-xs">
                                        📍 {inf.location}
                                      </span>
                                    </div>
                                  </div>
                                ))}

                              {/* Show "+N more" if influencers exceed 3 */}
                              {assignedInf[campaign._id!] &&
                                assignedInf[campaign._id!].length > 3 && (
                                  <div
                                    className="flex items-center justify-center p-3 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 text-blue-600 text-sm font-medium cursor-pointer transition"
                                    onClick={() =>
                                      handleShowAllInfluencers(campaign)
                                    }
                                  >
                                    +{assignedInf[campaign._id!].length - 3}{" "}
                                    more influencers
                                  </div>
                                )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 lg:ml-6 mt-4 lg:mt-0">
                        <button
                          onClick={() => {
                            setEditingCampaign(campaign);
                            setEditCampaign(true);
                          }}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-center"
                        >
                          View/Edit Campaign
                        </button>
                        <button
                          onClick={() => {
                            setShowDeleteModal(true);
                            setDeletingID(campaign._id ?? "");
                          }}
                          className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                        >
                          Delete
                        </button>
                        {!campaign.hasPaid && (
                          <button
                            onClick={() => handlePayment(campaign)}
                            disabled={
                              isProcessingPayment &&
                              payingCampaign === campaign._id
                            }
                            className="bg-green-50 hover:bg-green-100 text-green-600 px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isProcessingPayment &&
                            payingCampaign === campaign._id
                              ? "Processing..."
                              : "Make Payment"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Campaigns;
