"use client";

import type React from "react";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useBrandStore } from "@/stores/brandStore";
import {
  FaPlus,
  FaUpload,
  FaTimes,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import NewCampaign from "./NewCampaign";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/utils/ToastNotification";
import EditCampaign from "./EditCampaign";
import InfluencerDetailsModal from "./InfluencerDetailsModal";
import AllInfluencersModal from "./AllInfluencers";
import axios from "axios";
import Image from "next/image";

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

interface PlatformData {
  followers: string;
  url: string;
  impressions: string;
  proofUrl?: string;
}

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

interface SubmittedJob {
  _id: string;
  id: string;
  description: string;
  submittedAt: string;
}

interface AssignedInfluencer {
  influencerId: string;
  acceptanceStatus: string;
  assignedAt: string;
  completedAt?: string;
  isCompleted: boolean;
  respondedAt?: string;
  submittedJobs: SubmittedJob[];
  _id: string;
}

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
  assignedInfluencers: AssignedInfluencer[];
}

interface CampaignMaterial {
  id: string;
  file: File | null;
  description: string;
  preview?: string;
}

interface UploadedMaterial {
  _id: string;
  imageUrl: string;
  postDescription: string;
  uploadedAt: string;
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
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

  const [selectedInfluencerJobs, setSelectedInfluencerJobs] = useState<{
    influencer: Influencer;
    jobs: SubmittedJob[];
    campaignName: string;
  } | null>(null);

  const [showMaterialsModal, setShowMaterialsModal] = useState<boolean>(false);
  const [selectedCampaignForMaterials, setSelectedCampaignForMaterials] =
    useState<Campaign | null>(null);
  const [campaignMaterials, setCampaignMaterials] = useState<
    CampaignMaterial[]
  >([{ id: "1", file: null, description: "" }]);
  const [isUploadingMaterials, setIsUploadingMaterials] =
    useState<boolean>(false);

  const [showViewMaterialsModal, setShowViewMaterialsModal] =
    useState<boolean>(false);
  const [selectedCampaignForViewing, setSelectedCampaignForViewing] =
    useState<Campaign | null>(null);
  const [uploadedMaterials, setUploadedMaterials] = useState<
    UploadedMaterial[]
  >([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState<boolean>(false);
  const [isDeletingMaterial, setIsDeletingMaterial] = useState<boolean>(false);

  const { showToast } = useToast();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.flutterwave.com/v3.js";
    script.async = true;
    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector(
        'script[src="https://checkout.flutterwave.com/v3.js"]'
      );
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

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
          c.assignedInfluencers.forEach((assignedInf: any) => {
            fetchInfluencerById(c._id!, assignedInf);
          });
        }
      });
    }
  }, [campaigns]);

  const fetchInfluencerById = async (
    campaignId: string,
    assignedInf: AssignedInfluencer
  ) => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/influencers/${assignedInf.influencerId}`
      );

      if (res.status === 200) {
        const influencer = res.data?.data?.influencer;
        setAssignedInf((prev) => {
          const existing = prev[campaignId] || [];
          const alreadyAdded = existing.some(
            (inf) => inf._id === influencer._id
          );

          if (alreadyAdded) return prev;

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
  const handleInfluencerClick = (
    influencer: Influencer,
    campaign: Campaign
  ) => {
    const assignedInfluencerData = campaign.assignedInfluencers?.find(
      (assigned) => assigned.influencerId === influencer._id
    );

    setSelectedInfluencer(influencer);
    setSelectedInfluencerJobs({
      influencer,
      jobs: assignedInfluencerData?.submittedJobs || [],
      campaignName: campaign.brandName,
    });
    setShowInfluencerDetails(true);
  };

  // Close modals
  const closeInfluencerDetailsModal = () => {
    setShowInfluencerDetails(false);
    setSelectedInfluencer(null);
    setSelectedInfluencerJobs(null);
  };

  const closeAllInfluencersModal = () => {
    setShowAllInfluencers(false);
    setSelectedCampaignInfluencers(null);
  };

  const handleOpenMaterialsModal = (campaign: Campaign) => {
    setSelectedCampaignForMaterials(campaign);
    setShowMaterialsModal(true);
    setCampaignMaterials([{ id: "1", file: null, description: "" }]);
  };

  const closeMaterialsModal = () => {
    setShowMaterialsModal(false);
    setSelectedCampaignForMaterials(null);
    setCampaignMaterials([{ id: "1", file: null, description: "" }]);
  };

  const addNewMaterial = () => {
    const newId = Date.now().toString();
    setCampaignMaterials((prev) => [
      ...prev,
      { id: newId, file: null, description: "" },
    ]);
  };

  const removeMaterial = (id: string) => {
    if (campaignMaterials.length > 1) {
      setCampaignMaterials((prev) =>
        prev.filter((material) => material.id !== id)
      );
    }
  };

  const handleFileChange = (id: string, file: File | null) => {
    setCampaignMaterials((prev) =>
      prev.map((material) => {
        if (material.id === id) {
          let preview = undefined;
          if (file && file.type.startsWith("image/")) {
            preview = URL.createObjectURL(file);
          }
          return { ...material, file, preview };
        }
        return material;
      })
    );
  };

  const handleDescriptionChange = (id: string, description: string) => {
    setCampaignMaterials((prev) =>
      prev.map((material) =>
        material.id === id ? { ...material, description } : material
      )
    );
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

  const handleUploadMaterials = async () => {
    if (!selectedCampaignForMaterials) return;

    const validMaterials = campaignMaterials.filter(
      (material) => material.file && material.description.trim()
    );

    if (validMaterials.length === 0) {
      showToast({
        type: "error",
        title: "No Materials",
        message:
          "Please add at least one material with both file and description.",
        duration: 4000,
      });
      return;
    }

    setIsUploadingMaterials(true);

    try {
      const formData = new FormData();

      formData.append("campaignId", selectedCampaignForMaterials._id || "");

      validMaterials.forEach((material, index) => {
        if (material.file) {
          formData.append("images", material.file);
          formData.append(
            `materials[${index}][description]`,
            material.description
          );
        }
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/brands/upload-materials`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Upload failed");
      }

      showToast({
        type: "success",
        title: "Materials Uploaded!",
        message: `Successfully uploaded ${validMaterials.length} campaign materials.`,
        duration: 6000,
      });

      closeMaterialsModal();

      if (user?.email) {
        await fetchCampaignsByEmail(user.email);
      } else {
        await fetchCampaigns();
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      showToast({
        type: "error",
        title: "Upload Failed",
        message:
          error.message ||
          "Failed to upload campaign materials. Please try again.",
        duration: 6000,
      });
    } finally {
      setIsUploadingMaterials(false);
    }
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
      public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || "",
      tx_ref: `campaign_${campaign._id}_${Date.now()}`,
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

  // Verify payment on backend
  const verifyPayment = async (transactionId: string) => {
    try {
      const response = await fetch("/api/verify-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ transactionId }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return { success: false };
    }
  };

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      let matchesFilter = true;
      if (filter === "paid") matchesFilter = campaign.hasPaid === true;
      else if (filter === "unpaid") matchesFilter = campaign.hasPaid !== true;
      else if (filter === "approved")
        matchesFilter = campaign.status === "approved";
      else if (filter === "rejected")
        matchesFilter = campaign.status === "rejected";
      else if (filter === "pending")
        matchesFilter = campaign.status === "pending";

      const matchesSearch =
        campaign.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPlatform =
        platformFilter === "all" ||
        campaign.platforms.some(
          (p) => p.toLowerCase() === platformFilter.toLowerCase()
        );

      const matchesRole = roleFilter === "all" || campaign.role === roleFilter;

      return matchesFilter && matchesSearch && matchesPlatform && matchesRole;
    });
  }, [campaigns, filter, searchTerm, platformFilter, roleFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCampaigns = filteredCampaigns.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm, platformFilter, roleFilter]);

  // Pagination handlers
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const getStatusColor = (campaign: Campaign) => {
    switch (campaign.status) {
      case "approved":
        if (campaign.hasPaid) {
          return "bg-green-100 text-green-800";
        } else {
          return "bg-blue-100 text-blue-800";
        }
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
      default:
        if (campaign.hasPaid) {
          return "bg-yellow-100 text-yellow-800";
        } else {
          return "bg-gray-100 text-gray-800";
        }
    }
  };

  const getStatusText = (campaign: Campaign) => {
    switch (campaign.status) {
      case "approved":
        if (campaign.hasPaid) {
          return "Active";
        } else {
          return "Approved - Payment Required";
        }
      case "rejected":
        return "Rejected";
      case "pending":
      default:
        if (campaign.hasPaid) {
          return "Paid - Pending Approval";
        } else {
          return "Pending";
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

  const handleViewMaterials = async (campaign: Campaign) => {
    setSelectedCampaignForViewing(campaign);
    setShowViewMaterialsModal(true);
    setIsLoadingMaterials(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/brands/${campaign._id}/materials`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch materials");
      }

      setUploadedMaterials(result.data.materials || []);
    } catch (error: any) {
      console.error("Error fetching materials:", error);
      showToast({
        type: "error",
        title: "Error",
        message: error.message || "Failed to load campaign materials",
        duration: 4000,
      });
    } finally {
      setIsLoadingMaterials(false);
    }
  };

  const closeViewMaterialsModal = () => {
    setShowViewMaterialsModal(false);
    setSelectedCampaignForViewing(null);
    setUploadedMaterials([]);
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!selectedCampaignForViewing) return;
    setIsDeletingMaterial(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/brands/${selectedCampaignForViewing._id}/materials/${materialId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete material");
      }

      setUploadedMaterials((prev) =>
        prev.filter((material) => material._id !== materialId)
      );
      setIsDeletingMaterial(false);

      showToast({
        type: "success",
        title: "Material Deleted",
        message: "Campaign material has been deleted successfully",
        duration: 4000,
      });
    } catch (error: any) {
      setIsDeletingMaterial(false);

      console.error("Error deleting material:", error);
      showToast({
        type: "error",
        title: "Delete Failed",
        message: error.message || "Failed to delete campaign material",
        duration: 4000,
      });
    }
  };

  const isInfluencerCompleted = (
    campaign: Campaign,
    influencerId: string
  ): boolean => {
    const assigned = campaign.assignedInfluencers?.find(
      (assigned) => assigned.influencerId === influencerId
    );
    return assigned?.isCompleted ?? false;
  };

  const handleShowAllInfluencers = (campaign: Campaign) => {
    const influencersForCampaign = assignedInf[campaign._id!] || [];
    setSelectedCampaignInfluencers({
      influencers: influencersForCampaign,
      campaignName: campaign.brandName,
    });
    setShowAllInfluencers(true);
  };

  const handleInfluencerClickFromModal = (
    influencer: Influencer,
    campaign: Campaign
  ) => {
    const assignedInfluencerData = campaign.assignedInfluencers?.find(
      (assigned) => assigned.influencerId === influencer._id
    );

    setSelectedInfluencer(influencer);
    setSelectedInfluencerJobs({
      influencer,
      jobs: assignedInfluencerData?.submittedJobs || [],
      campaignName: campaign.brandName,
    });
    setShowInfluencerDetails(true);
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
              className="bg-red-600 hover:bg-red-400 text-white px-4 py-2 rounded-lg"
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
        submittedJobs={selectedInfluencerJobs?.jobs || []}
      />

      <AllInfluencersModal
        influencers={selectedCampaignInfluencers?.influencers || []}
        campaignName={selectedCampaignInfluencers?.campaignName || ""}
        isOpen={showAllInfluencers}
        onClose={closeAllInfluencersModal}
        onInfluencerClick={handleInfluencerClickFromModal}
      />

      {/* View Materials Modal */}
      <AnimatePresence>
        {showViewMaterialsModal && (
          <motion.div
            key="view-materials-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-2xl flex items-center justify-center p-4 z-50"
            onClick={closeViewMaterialsModal}
          >
            <motion.div
              key="view-materials-modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-black rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-200/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-400">
                      Campaign Materials
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Materials for &quot;
                      {selectedCampaignForViewing?.brandName}&quot;
                    </p>
                  </div>
                  <button
                    onClick={closeViewMaterialsModal}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FaTimes className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {isLoadingMaterials ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
                    <span className="ml-3 text-gray-600">
                      Loading materials...
                    </span>
                  </div>
                ) : uploadedMaterials.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-lg mb-2">
                      No materials uploaded yet
                    </div>
                    <p className="text-gray-600">
                      Upload some campaign materials to see them here.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {uploadedMaterials.map((material) => (
                      <div
                        key={material._id}
                        className="bg-slate-200/20 border border-slate-200/10 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="aspect-square relative">
                          <Image
                            src={material.imageUrl || "/placeholder.svg"}
                            width={200}
                            height={200}
                            alt="Campaign material"
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => handleDeleteMaterial(material._id)}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors"
                            title="Delete material"
                          >
                            {isDeletingMaterial ? <FaSpinner /> : <FaTimes />}
                          </button>
                        </div>
                        <div className="p-4">
                          <p className="text-gray-400 text-sm leading-relaxed mb-2">
                            {material.postDescription}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-200/10 bg-slate-200/20">
                <div className="flex justify-end">
                  <button
                    onClick={closeViewMaterialsModal}
                    className="px-4 py-2 bg-slate-200/10 hover:bg-gray-50/10 rounded-lg text-gray-400 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Materials Modal */}
      <AnimatePresence>
        {showMaterialsModal && (
          <motion.div
            key="materials-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-2xl flex items-center justify-center p-4 z-50"
            onClick={closeMaterialsModal}
          >
            <motion.div
              key="materials-modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-black border border-slate-200/10 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-400">
                      Add Campaign Materials
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Upload materials for &quot;
                      {selectedCampaignForMaterials?.brandName}&quot;
                    </p>
                  </div>
                  <button
                    onClick={closeMaterialsModal}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FaTimes className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="space-y-6">
                  {campaignMaterials.map((material, index) => (
                    <div
                      key={material.id}
                      className="border border-slate-200/10 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-400">
                          Material {index + 1}
                        </h3>
                        {campaignMaterials.length > 1 && (
                          <button
                            onClick={() => removeMaterial(material.id)}
                            className="text-red-500 hover:text-red-400 p-1"
                          >
                            <FaTimes className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            Upload Image
                          </label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-yellow-400 transition-colors">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleFileChange(
                                  material.id,
                                  e.target.files?.[0] || null
                                )
                              }
                              className="hidden"
                              id={`file-${material.id}`}
                            />
                            <label
                              htmlFor={`file-${material.id}`}
                              className="cursor-pointer"
                            >
                              {material.preview ? (
                                <div className="space-y-2">
                                  <Image
                                    src={material.preview || "/placeholder.svg"}
                                    width={200}
                                    height={200}
                                    alt="Preview"
                                    className="w-full h-32 object-cover rounded-lg"
                                  />
                                  <p className="text-sm text-gray-600">
                                    Click to change image
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <FaUpload className="w-8 h-8 text-gray-400 mx-auto" />
                                  <p className="text-sm text-gray-600">
                                    Click to upload image
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    PNG, JPG, GIF up to 10MB
                                  </p>
                                </div>
                              )}
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            Description
                          </label>
                          <textarea
                            value={material.description}
                            onChange={(e) =>
                              handleDescriptionChange(
                                material.id,
                                e.target.value
                              )
                            }
                            placeholder="Describe this campaign material..."
                            rows={6}
                            className="w-full px-3 py-2 border text-gray-400 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={addNewMaterial}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-yellow-400 hover:bg-yellow-50 transition-colors"
                  >
                    <FaPlus className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                    <span className="text-sm text-gray-600">
                      Add Another Material
                    </span>
                  </button>
                </div>
              </div>

              <div className="p-6 border-t border-slate-200/10 bg-slate-200/20">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={closeMaterialsModal}
                    className="px-4 py-2 bg-slate-200/20 hover:bg-gray-50/10 rounded-lg text-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUploadMaterials}
                    disabled={isUploadingMaterials}
                    className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploadingMaterials ? "Uploading..." : "Upload Materials"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
            className="fixed inset-0 bg-black/40 backdrop-blur-2xl flex items-center justify-center p-8 z-50"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              key="logout-modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-200/20 border border-slate-200/10 rounded-xl shadow-2xl w-full max-w-sm p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-gray-400 mb-4">
                Confirm Action
              </h2>
              <p className="text-sm text-gray-400 mb-6">
                Are you sure you want to delete this campaign?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-50/10 hover:bg-gray-50/5 rounded-lg text-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteCampaign(deletingID)}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-400 rounded-lg text-white transition"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center gap-6 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-500">Campaigns</h1>
                <p className="text-gray-500 mt-1">
                  View what&apos;s happening with your campaigns.
                </p>
              </div>
              <button
                onClick={() => setNewCampaign(true)}
                className="bg-yellow-500 flex items-center gap-3 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-sm"
              >
                <FaPlus /> New
              </button>
            </div>

            {/* Filters and Search */}
            <div className="space-y-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by brand name, location, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200/10 bg-slate-200/20 text-gray-400 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-wrap gap-2">
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
                        ? "bg-yellow-500 text-white"
                        : "bg-slate-200/20 text-gray-400 hover:bg-gray-50/10 border border-slate-200/10"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2 border border-slate-200/10 rounded-lg bg-slate-200/20 text-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="all">All Roles</option>
                  <option value="Brand">Brand</option>
                  <option value="Business">Business</option>
                  <option value="Person">Person</option>
                  <option value="Movie">Movie</option>
                  <option value="Music">Music</option>
                  <option value="Other">Other</option>
                </select>

                <select
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                  className="px-4 py-2 border border-slate-200/10 rounded-lg bg-slate-200/20 text-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
              <div className="bg-slate-200/20 border border-slate-200/10 p-6 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-gray-400">
                  {filteredCampaigns.length}
                </div>
                <div className="text-gray-400">
                  {filter === "all" ? "Total" : "Filtered"} Campaigns
                </div>
              </div>
              <div className="bg-slate-200/20 border border-slate-200/10 p-6 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-gray-400">
                  {campaigns.filter((c) => c.hasPaid).length}
                </div>
                <div className="text-gray-400">Paid Campaigns</div>
              </div>
              <div className="bg-slate-200/20 border border-slate-200/10 p-6 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-gray-400">
                  {campaigns.filter((c) => c.status === "pending").length}
                </div>
                <div className="text-gray-400">Pending Approval</div>
              </div>
              <div className="bg-slate-200/20 border border-slate-200/10 p-6 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-gray-400">
                  {campaigns.filter((c) => c.status === "approved").length}
                </div>
                <div className="text-gray-400">Approved Campaigns</div>
              </div>
            </div>

            {/* Pagination Info */}
            {filteredCampaigns.length > 0 && (
              <div className="text-sm text-gray-400 mb-4">
                Showing {startIndex + 1} -{" "}
                {Math.min(endIndex, filteredCampaigns.length)} of{" "}
                {filteredCampaigns.length} campaigns
              </div>
            )}
          </div>

          {/* Campaigns List */}
          <div className="space-y-4 mb-8">
            {paginatedCampaigns.length === 0 ? (
              <div className="bg-slate-200/10 border border-slate-200/10 p-12 rounded-lg shadow-sm text-center">
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
              paginatedCampaigns.map((campaign: any) => (
                <div
                  key={campaign._id}
                  className="bg-slate-200/20 border border-slate-200/10 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <h3 className="text-xl font-semibold text-gray-400">
                            {campaign.brandName}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                              campaign
                            )}`}
                          >
                            {getStatusText(campaign)}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-900 text-xs rounded">
                            {campaign.role}
                          </span>
                        </div>

                        <p className="text-gray-400 mb-4">
                          {campaign.platforms.join(", ")} • {campaign.location}
                          {campaign.additionalLocations &&
                            campaign.additionalLocations.length > 0 &&
                            ` + ${campaign.additionalLocations.length} more`}
                        </p>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-400">
                              Influencers:
                            </span>
                            <div className="text-gray-400">
                              {campaign.influencersMin} -{" "}
                              {campaign.influencersMax}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-400">
                              Followers:
                            </span>
                            <div className="text-gray-400">
                              {campaign.followersRange || "Any"}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-400">
                              Budget:
                            </span>
                            <div className="text-gray-400">
                              {campaign.totalCost
                                ? formatCurrency(campaign.totalCost)
                                : "TBD"}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-400">
                              Created:
                            </span>
                            <div className="text-gray-400">
                              {formatDate(campaign.createdAt)}
                            </div>
                          </div>
                        </div>

                        {(campaign.postFrequency || campaign.postDuration) && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                              {campaign.postFrequency && (
                                <div>
                                  <span className="font-medium text-gray-400">
                                    Post Frequency:
                                  </span>
                                  <div className="text-gray-400">
                                    {campaign.postFrequency}
                                  </div>
                                </div>
                              )}
                              {campaign.postDuration && (
                                <div>
                                  <span className="font-medium text-gray-400">
                                    Duration:
                                  </span>
                                  <div className="text-gray-400">
                                    {campaign.postDuration}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {campaign.assignedInfluencers?.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="font-medium text-gray-400 mb-3">
                              Assigned Influencers (
                              {campaign.assignedInfluencers.length})
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {assignedInf[campaign._id!]
                                ?.slice(0, 3)
                                .map((inf, idx) => {
                                  const isCompleted = isInfluencerCompleted(
                                    campaign,
                                    inf._id
                                  );

                                  return (
                                    <div
                                      key={inf._id || idx}
                                      className="flex items-start gap-3 p-3 bg-slate-200/10 rounded-xl border border-slate-200/10 hover:shadow-md hover:bg-gray-50/10 transition cursor-pointer relative"
                                      onClick={() =>
                                        handleInfluencerClick(inf, campaign)
                                      }
                                    >
                                      {isCompleted && (
                                        <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                                          <svg
                                            className="w-4 h-4"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                          >
                                            <path
                                              fillRule="evenodd"
                                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                        </div>
                                      )}

                                      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-yellow-100 text-yellow-600 font-semibold">
                                        {inf.name?.charAt(0).toUpperCase() ||
                                          "I"}
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="font-medium text-gray-400">
                                          {inf.name}
                                        </span>
                                        <span className="text-gray-400 text-sm">
                                          {inf.email}
                                        </span>
                                        <span className="text-gray-400 text-xs">
                                          📍 {inf.location}
                                        </span>
                                        {isCompleted && (
                                          <span className="text-green-600 text-xs font-medium mt-1">
                                            ✓ Completed
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}

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
                        {campaign.hasPaid && (
                          <>
                            <button
                              onClick={() => handleOpenMaterialsModal(campaign)}
                              className="bg-green-50 hover:bg-green-100 text-green-600 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                            >
                              Add Campaign Materials
                            </button>
                            <button
                              onClick={() => handleViewMaterials(campaign)}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                            >
                              View Materials
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {filteredCampaigns.length > itemsPerPage && (
            <div className="bg-slate-200/20 border border-slate-200/10 rounded-lg shadow-sm p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>

                <div className="flex items-center gap-2">
                  {/* Previous Button */}
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Previous page"
                  >
                    <FaChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) => (
                      <button
                        key={index}
                        onClick={() =>
                          typeof page === "number" && handlePageClick(page)
                        }
                        disabled={page === "..."}
                        className={`min-w-[40px] h-10 px-3 rounded-lg text-sm font-medium transition-colors ${
                          page === currentPage
                            ? "bg-yellow-500 text-white"
                            : page === "..."
                            ? "cursor-default text-gray-400"
                            : "border border-gray-300 hover:bg-gray-50 text-gray-400"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Next page"
                  >
                    <FaChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                {/* Go to page input (optional) */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Go to:</span>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => {
                      const page = parseInt(e.target.value);
                      if (page >= 1 && page <= totalPages) {
                        handlePageClick(page);
                      }
                    }}
                    className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Campaigns;
