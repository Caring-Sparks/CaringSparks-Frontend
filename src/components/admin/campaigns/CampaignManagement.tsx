"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBrandStore } from "@/stores/brandStore";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/utils/ToastNotification";
import axios from "axios";
import InfluencerDetailsModal from "@/components/brand/campaigns/InfluencerDetailsModal";

interface SubmittedJob {
  _id: string;
  description: string;
  submittedAt: string;
}

interface AssignedInfluencer {
  influencerId: string;
  isCompleted: boolean;
  submittedJobs: SubmittedJob[];
  acceptanceStatus: string;
  completedAt?: string;
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

const CampaignManagement: React.FC = () => {
  const router = useRouter();
  const {
    campaigns,
    user,
    campaignsLoading,
    campaignsError,
    fetchCampaigns,
    deleteCampaign,
    clearErrors,
  } = useBrandStore();

  const [filter, setFilter] = useState<
    "all" | "paid" | "unpaid" | "approved" | "rejected" | "pending"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [showApproveModal, setShowApproveModal] = useState<boolean>(false);
  const [deletingID, setDeletingID] = useState<string>("");
  const [actioningID, setActioningID] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [assignedInf, setAssignedInf] = useState<Record<string, any[]>>({});
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [isRejecting, setIsRejecting] = useState<boolean>(false);
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [showInfluencerModal, setShowInfluencerModal] =
    useState<boolean>(false);
  const [selectedInfluencer, setSelectedInfluencer] = useState<any>(null);
  const [selectedInfluencerJobs, setSelectedInfluencerJobs] = useState<
    SubmittedJob[]
  >([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { showToast } = useToast();

  useEffect(() => {
    const loadCampaigns = async () => {
      await fetchCampaigns();
    };

    loadCampaigns();
    return () => clearErrors();
  }, [fetchCampaigns, clearErrors]);

  useEffect(() => {
    if (campaigns.length > 0) {
      campaigns.forEach((c) => {
        if (c.assignedInfluencers?.length > 0) {
          c.assignedInfluencers.forEach((infId: any) => {
            fetchInfluencerById(c._id!, infId);
          });
        }
      });
    }
  }, [campaigns]);

  const handleApproveCampaign = async (campaignId: string) => {
    setIsApproving(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/campaigns/${campaignId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "approved",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to approve campaign");
      }

      const data = await response.json();

      await fetchCampaigns();

      showToast({
        type: "success",
        title: "Campaign Approved!",
        message:
          "The campaign has been successfully approved and is now active.",
        duration: 6000,
      });

      setShowApproveModal(false);
      setIsApproving(false);
    } catch (error) {
      console.error("Failed to approve campaign:", error);
      showToast({
        type: "error",
        title: "Approval Failed",
        message: "We couldn't approve the campaign. Please try again later.",
        duration: 6000,
      });
      setIsApproving(false);
    }
  };

  const handleRejectCampaign = async (campaignId: string) => {
    setIsRejecting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/campaigns/${campaignId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "rejected",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reject campaign");
      }

      const data = await response.json();

      await fetchCampaigns();

      showToast({
        type: "success",
        title: "Campaign Rejected",
        message:
          "The campaign has been rejected and the client has been notified.",
        duration: 6000,
      });

      setShowRejectModal(false);
      setIsRejecting(false);
    } catch (error) {
      console.error("Failed to reject campaign:", error);
      showToast({
        type: "error",
        title: "Rejection Failed",
        message: "We couldn't reject the campaign. Please try again later.",
        duration: 6000,
      });
      setIsRejecting(false);
    }
  };

  const fetchInfluencerById = async (
    campaignId: string,
    assignedInfluencer: AssignedInfluencer
  ) => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/influencers/${assignedInfluencer.influencerId}`
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

  const handleInfluencerClick = async (
    campaignId: string,
    assignedInfluencer: AssignedInfluencer
  ) => {
    try {
      const influencerData = assignedInf[campaignId]?.find(
        (inf) => inf._id === assignedInfluencer.influencerId
      );

      if (influencerData) {
        setSelectedInfluencer(influencerData);
        setSelectedInfluencerJobs(assignedInfluencer.submittedJobs || []);
        setShowInfluencerModal(true);
      }
    } catch (error) {
      console.error("Error opening influencer details:", error);
      showToast({
        type: "error",
        title: "Error",
        message: "Could not load influencer details",
        duration: 4000,
      });
    }
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

  const filteredCampaigns = campaigns.filter((campaign) => {
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

  // Pagination calculations
  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCampaigns = filteredCampaigns.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm, platformFilter, roleFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded-lg border border-gray-300 text-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        Previous
      </button>
    );

    // First page
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="px-4 py-2 rounded-lg border border-gray-300 text-white hover:bg-gray-50 transition"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="px-2 py-2 text-white">
            ...
          </span>
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 rounded-lg border transition ${
            currentPage === i
              ? "bg-yellow-500 text-white border-yellow-500"
              : "border-gray-300 text-white hover:bg-gray-50"
          }`}
        >
          {i}
        </button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="px-2 py-2 text-white">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-4 py-2 rounded-lg border border-gray-300 text-white hover:bg-gray-50 transition"
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 rounded-lg border border-gray-300 text-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        Next
      </button>
    );

    return (
      <div className="flex items-center justify-center gap-2 mt-8">{pages}</div>
    );
  };

  if (campaignsLoading) {
    return (
      <div className="min-h-screen bg-black p-6">
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
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 text-lg font-medium mb-2">
              Error Loading Campaigns
            </div>
            <p className="text-red-600 mb-4">{campaignsError}</p>
            <button
              onClick={() => fetchCampaigns()}
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
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            key="delete-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-2xl flex items-center justify-center p-8 z-50"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              key="delete-modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-200/20 backdrop-blur-2xl border-slate-200/10 rounded-xl shadow-2xl w-full max-w-sm p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-white mb-4">
                Delete Campaign
              </h2>
              <p className="text-sm text-white mb-6">
                Are you sure you want to delete this campaign? This action
                cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-white transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteCampaign(deletingID)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-lg text-white transition"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showApproveModal && (
          <motion.div
            key="approve-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-2xl flex items-center justify-center p-8 z-50"
            onClick={() => setShowApproveModal(false)}
          >
            <motion.div
              key="approve-modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-200/20 backdrop-blur-2xl border-slate-200/10 rounded-xl shadow-2xl w-full max-w-sm p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-white mb-4">
                Approve Campaign
              </h2>
              <p className="text-sm text-white mb-6">
                Are you sure you want to approve this campaign? The client will
                be notified and can proceed with influencer matching.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowApproveModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-black transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleApproveCampaign(actioningID)}
                  disabled={isApproving}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 rounded-lg text-white transition"
                >
                  {isApproving ? "Approving..." : "Approve"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showRejectModal && (
          <motion.div
            key="reject-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-2xl flex items-center justify-center p-8 z-50"
            onClick={() => setShowRejectModal(false)}
          >
            <motion.div
              key="reject-modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-200/20 border-slate-200/10 rounded-xl shadow-2xl w-full max-w-sm p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-white mb-4">
                Reject Campaign
              </h2>
              <p className="text-sm text-white mb-6">
                Are you sure you want to reject this campaign? The client will
                be notified and may need to revise their requirements.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-black transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRejectCampaign(actioningID)}
                  disabled={isRejecting}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-lg text-white transition"
                >
                  {isRejecting ? "Rejecting..." : "Reject"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <InfluencerDetailsModal
        influencer={selectedInfluencer}
        isOpen={showInfluencerModal}
        onClose={() => {
          setShowInfluencerModal(false);
          setSelectedInfluencer(null);
          setSelectedInfluencerJobs([]);
        }}
        submittedJobs={selectedInfluencerJobs}
      />

      <div className="min-h-screen bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex justify-between items-center gap-6 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white">Campaigns</h1>
                <p className="text-white mt-1">
                  View what&apos;s happening with campaigns.
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by brand name, location, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="frm"
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
                        : "bg-slate-200/20 text-white hover:bg-gray-50/10 cursor-pointer"
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
                  className="px-4 py-2 border border-gray-200/10 bg-slate-200/20 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
                  className="px-4 py-2 border border-gray-200/10 bg-slate-200/20 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-200/20 border-slate-200/10 p-6 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-white">
                  {campaigns.length}
                </div>
                <div className="text-white">Total Campaigns</div>
              </div>
              <div className="bg-slate-200/20 border-slate-200/10 p-6 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-white">
                  {campaigns.filter((c) => c.hasPaid).length}
                </div>
                <div className="text-white">Paid Campaigns</div>
              </div>
              <div className="bg-slate-200/20 border-slate-200/10 p-6 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-white">
                  {campaigns.filter((c) => c.status === "pending").length}
                </div>
                <div className="text-white">Pending Approval</div>
              </div>
              <div className="bg-slate-200/20 border-slate-200/10 p-6 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-white">
                  {campaigns.filter((c) => c.status === "approved").length}
                </div>
                <div className="text-white">Approved Campaigns</div>
              </div>
            </div>

            {/* Pagination Info */}
            {filteredCampaigns.length > 0 && (
              <div className="text-sm text-white mb-4">
                Showing {startIndex + 1}-
                {Math.min(endIndex, filteredCampaigns.length)} of{" "}
                {filteredCampaigns.length} campaigns
              </div>
            )}
          </div>

          <div className="space-y-4">
            {paginatedCampaigns.length === 0 ? (
              <div className="bg-slate-200/20 p-12 rounded-lg shadow-sm text-center">
                <div className="text-white text-lg mb-2">
                  No campaigns found
                </div>
                <p className="text-white mb-6">
                  {searchTerm || filter !== "all"
                    ? "Try adjusting your search or filters"
                    : "No campaigns available"}
                </p>
              </div>
            ) : (
              paginatedCampaigns.map((campaign: any) => (
                <div
                  key={campaign._id}
                  className="bg-slate-200/20 backdrop-blur-2xl rounded-lg border-slate-200/10"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <h3 className="text-xl font-semibold text-white">
                            {campaign.brandName}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                              campaign
                            )}`}
                          >
                            {getStatusText(campaign)}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                            {campaign.role}
                          </span>
                        </div>

                        <p className="text-white mb-4">
                          {campaign.platforms.join(", ")} • {campaign.location}
                          {campaign.additionalLocations &&
                            campaign.additionalLocations.length > 0 &&
                            ` + ${campaign.additionalLocations.length} more`}
                        </p>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-white">
                              Influencers:
                            </span>
                            <div className="text-white">
                              {campaign.influencersMin} -{" "}
                              {campaign.influencersMax}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-white">
                              Followers:
                            </span>
                            <div className="text-white">
                              {campaign.followersRange || "Any"}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-white">
                              Budget:
                            </span>
                            <div className="text-white">
                              {campaign.totalCost
                                ? formatCurrency(campaign.totalCost)
                                : "TBD"}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-white">
                              Created:
                            </span>
                            <div className="text-white">
                              {formatDate(campaign.createdAt)}
                            </div>
                          </div>
                        </div>

                        {(campaign.postFrequency || campaign.postDuration) && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                              {campaign.postFrequency && (
                                <div>
                                  <span className="font-medium text-white">
                                    Post Frequency:
                                  </span>
                                  <div className="text-white">
                                    {campaign.postFrequency}
                                  </div>
                                </div>
                              )}
                              {campaign.postDuration && (
                                <div>
                                  <span className="font-medium text-white">
                                    Duration:
                                  </span>
                                  <div className="text-white">
                                    {campaign.postDuration}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {campaign.assignedInfluencers?.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="font-medium text-white mb-3">
                              Assigned Influencers
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {assignedInf[campaign._id!]
                                ?.slice(0, 3)
                                .map((inf, idx) => {
                                  const assignedInfluencer =
                                    campaign.assignedInfluencers.find(
                                      (ai: any) => ai.influencerId === inf._id
                                    );
                                  const isCompleted =
                                    assignedInfluencer?.isCompleted || false;

                                  return (
                                    <div
                                      key={inf._id || idx}
                                      className="flex items-start gap-3 p-3 bg-slate-200/10 rounded-xl border border-gray-200/10 hover:shadow-md transition cursor-pointer relative"
                                      onClick={() =>
                                        assignedInfluencer &&
                                        handleInfluencerClick(
                                          campaign._id!,
                                          assignedInfluencer
                                        )
                                      }
                                    >
                                      {isCompleted && (
                                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                          <svg
                                            className="w-4 h-4 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M5 13l4 4L19 7"
                                            />
                                          </svg>
                                        </div>
                                      )}

                                      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold">
                                        {inf.name?.charAt(0).toUpperCase() ||
                                          "I"}
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="font-medium text-gray-300">
                                          {inf.name}
                                        </span>
                                        <span className="text-gray-300 text-sm">
                                          {inf.email}
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
                                  <div className="flex items-center justify-center p-3 bg-gray-100 rounded-xl border border-gray-200 text-white text-sm font-medium">
                                    +{assignedInf[campaign._id!].length - 3}{" "}
                                    more
                                  </div>
                                )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 lg:ml-6 mt-4 lg:mt-0">
                        {campaign.hasPaid && (
                          <button
                            onClick={() =>
                              router.push(
                                `/admin/assign-influencers?campaignId=${campaign._id}`
                              )
                            }
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-center"
                          >
                            Assign Influencers
                          </button>
                        )}

                        {campaign.status === "pending" && (
                          <>
                            <button
                              onClick={() => {
                                setActioningID(campaign._id ?? "");
                                setShowApproveModal(true);
                              }}
                              disabled={isApproving}
                              className="bg-green-50 hover:bg-green-100 text-green-600 px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setActioningID(campaign._id ?? "");
                                setShowRejectModal(true);
                              }}
                              disabled={isRejecting}
                              className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {campaign.status === "rejected" && (
                          <button
                            onClick={() => {
                              setActioningID(campaign._id ?? "");
                              setShowApproveModal(true);
                            }}
                            disabled={isApproving}
                            className="bg-green-50 hover:bg-green-100 text-green-600 px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                          >
                            Re-approve
                          </button>
                        )}

                        {campaign.status === "approved" && (
                          <button
                            onClick={() => {
                              setActioningID(campaign._id ?? "");
                              setShowRejectModal(true);
                            }}
                            disabled={isRejecting}
                            className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                          >
                            Revoke Approval
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {renderPagination()}
        </div>
      </div>
    </>
  );
};

export default CampaignManagement;
