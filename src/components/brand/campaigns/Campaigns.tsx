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
  isValidated?: boolean;
  createdAt?: string;
  updatedAt?: string;
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
    clearErrors,
  } = useBrandStore();

  const [filter, setFilter] = useState<
    "all" | "paid" | "unpaid" | "approved" | "rejected"
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
  const { showToast } = useToast();

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

  // Filter campaigns based on current filters
  const filteredCampaigns = campaigns.filter((campaign) => {
    // Status filter
    let matchesFilter = true;
    if (filter === "paid") matchesFilter = campaign.hasPaid === true;
    else if (filter === "unpaid") matchesFilter = campaign.hasPaid !== true;
    else if (filter === "approved")
      matchesFilter = campaign.isValidated === true;
    else if (filter === "rejected")
      matchesFilter = campaign.isValidated === null;

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
    if (campaign.hasPaid && campaign.isValidated) {
      return "bg-green-100 text-green-800";
    } else if (campaign.hasPaid && !campaign.isValidated) {
      return "bg-blue-100 text-blue-800";
    } else if (!campaign.hasPaid && campaign.isValidated) {
      return "bg-yellow-100 text-yellow-800";
    } else {
      return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (campaign: Campaign) => {
    if (campaign.hasPaid && campaign.isValidated) return "Active";
    if (campaign.hasPaid && !campaign.isValidated)
      return "Paid - Pending Approval";
    if (!campaign.hasPaid && campaign.isValidated) return "Approved - Unpaid";
    return "Pending";
  };

  const getPlatformIcon = (platforms: string[]) => {
    if (platforms.includes("Instagram")) return "📷";
    if (platforms.includes("Facebook")) return "📘";
    if (platforms.includes("TikTok")) return "🎵";
    if (platforms.includes("YouTube")) return "📺";
    if (platforms.includes("X")) return "🐦";
    if (platforms.includes("LinkedIn")) return "💼";
    return "📱";
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
      console.error("Failed to delete campaign:", error);
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
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
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
                {["all", "paid", "unpaid", "approved", "rejected"].map(
                  (status) => (
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
                  )
                )}
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
                  {formatCurrency(
                    campaigns
                      .filter((c) => c.hasPaid)
                      .reduce((sum, c) => sum + (c.totalCost || 0), 0)
                  )}
                </div>
                <div className="text-gray-600">Total Spent</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-gray-900">
                  {campaigns.filter((c) => c.isValidated).length}
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
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">
                            {getPlatformIcon(campaign.platforms)}
                          </span>
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
                      </div>

                      <div className="flex flex-col gap-2 lg:ml-6 mt-4 lg:mt-0">
                        <button
                          onClick={() => {
                            setEditingCampaign(campaign);
                            setEditCampaign(true);
                          }}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-center"
                        >
                          Edit Campaign
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
                        <button className="bg-green-50 hover:bg-green-100 text-green-600 px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                          Make Payment
                        </button>
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
