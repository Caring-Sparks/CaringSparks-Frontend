"use client";

import type React from "react";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useInfluencerStore } from "@/stores/influencerStore";
import {
  FaEye,
  FaCheck,
  FaTimes,
  FaUpload,
  FaClock,
  FaEdit,
  FaTrash,
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/utils/ToastNotification";
import Image from "next/image";

// Keep all existing interfaces (AssignedCampaign, DeliverableSubmission, DueDateInfo)

const Jobs: React.FC = () => {
  const router = useRouter();
  const {
    assignedCampaigns,
    availableCampaigns,
    user,
    campaignsLoading,
    campaignsError,
    fetchAssignedCampaigns,
    fetchCampaignById,
    submitCampaignDeliverables,
    updateCampaignDeliverables,
    checkDeliverableStatus,
    respondToCampaignAssignment,
    applyToCampaign,
    clearErrors,
    clearCurrentCampaign,
  } = useInfluencerStore();

  const [activeTab, setActiveTab] = useState<
    "assigned" | "available" | "history"
  >("assigned");
  const [filter, setFilter] = useState<
    "all" | "pending" | "accepted" | "in_progress" | "completed" | "rejected"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Keep all existing modal states and form states
  const [showCampaignDetails, setShowCampaignDetails] =
    useState<boolean>(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [showDeliverableModal, setShowDeliverableModal] =
    useState<boolean>(false);
  const [showResponseModal, setShowResponseModal] = useState<boolean>(false);
  const [showApplicationModal, setShowApplicationModal] =
    useState<boolean>(false);
  const [showSubmittedJobsModal, setShowSubmittedJobsModal] =
    useState<boolean>(false);

  const [deliverables, setDeliverables] = useState<any[]>([]);
  const [responseMessage, setResponseMessage] = useState("");
  const [applicationMessage, setApplicationMessage] = useState("");
  const [proposedRate, setProposedRate] = useState<number | undefined>();
  const [isEditingDeliverables, setIsEditingDeliverables] =
    useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [campaignMaterials, setCampaignMaterials] = useState<any[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState<boolean>(false);

  const { showToast } = useToast();

  // Keep all existing helper functions (calculateDueDate, isOverdue, formatDueDate, getInfluencerStatus, etc.)

  const calculateDueDate = (
    assignedAt: string,
    postFrequency: string
  ): Date => {
    const dueDate = new Date(assignedAt);
    const frequencyMatch = postFrequency.match(/for (\d+) (day|week|month)s?/i);

    if (frequencyMatch) {
      const duration = parseInt(frequencyMatch[1]);
      const unit = frequencyMatch[2].toLowerCase();

      switch (unit) {
        case "day":
          dueDate.setDate(dueDate.getDate() + duration);
          break;
        case "week":
          dueDate.setDate(dueDate.getDate() + duration * 7);
          break;
        case "month":
          dueDate.setMonth(dueDate.getMonth() + duration);
          break;
      }
    } else {
      dueDate.setDate(dueDate.getDate() + 7);
    }

    return dueDate;
  };

  const getInfluencerStatus = (campaign: any) => {
    return campaign.assignedInfluencers.find(
      (assigned: any) => assigned.influencerId._id === user?._id
    );
  };

  const isOverdue = (campaign: any) => {
    const influencerStatus = getInfluencerStatus(campaign);
    if (
      !influencerStatus ||
      influencerStatus.isCompleted ||
      influencerStatus.acceptanceStatus !== "accepted"
    ) {
      return false;
    }

    const dueDate = calculateDueDate(
      influencerStatus.assignedAt,
      campaign.postFrequency || "1 time per week for 1 week"
    );
    return new Date() > dueDate;
  };

  const formatDueDate = (campaign: any): any => {
    const influencerStatus = getInfluencerStatus(campaign);
    if (!influencerStatus || influencerStatus.acceptanceStatus !== "accepted") {
      return {
        date: "N/A",
        isOverdue: false,
        daysRemaining: 0,
      };
    }

    const dueDate: any = calculateDueDate(
      influencerStatus.assignedAt,
      campaign.postFrequency || "1 time per week for 1 week"
    );
    const isOverdueStatus =
      !influencerStatus.isCompleted && new Date() > dueDate;

    return {
      date: dueDate.toLocaleDateString(),
      isOverdue: isOverdueStatus,
      daysRemaining: influencerStatus.isCompleted
        ? 0
        : Math.ceil(
            (dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          ),
    };
  };

  const parseSubmittedJobs = (submittedJobs: any[]): any[] => {
    return submittedJobs.map((job) => {
      const lines = job.description.split("\n");
      const platform =
        lines
          .find((line: string) => line.startsWith("Platform:"))
          ?.replace("Platform:", "")
          .trim() || "";
      const description =
        lines
          .find((line: string) => line.startsWith("Description:"))
          ?.replace("Description:", "")
          .trim() || "";
      const metricsLine = lines.find((line: string) =>
        line.startsWith("Metrics:")
      );
      const urlLine = lines.find((line: string) =>
        line.startsWith("Post URL:")
      );

      let metrics = {};
      if (metricsLine) {
        try {
          metrics = JSON.parse(metricsLine.replace("Metrics:", "").trim());
        } catch (e) {
          metrics = {};
        }
      }

      return {
        platform,
        url: urlLine ? urlLine.replace("Post URL:", "").trim() : job.imageUrl,
        description,
        metrics,
      };
    });
  };

  const fetchCampaignMaterials = async (campaignId: string) => {
    setMaterialsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/brands/${campaignId}/materials`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCampaignMaterials(data.data?.materials || []);
      } else {
        setCampaignMaterials([]);
      }
    } catch (error) {
      console.error("Error fetching campaign materials:", error);
      setCampaignMaterials([]);
    } finally {
      setMaterialsLoading(false);
    }
  };

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        await fetchAssignedCampaigns();
      } catch (error) {
        console.error("Error loading campaigns:", error);
      }
    };

    if (user) {
      loadCampaigns();
    }

    return () => clearErrors();
  }, [user, fetchAssignedCampaigns, clearErrors]);

  // Keep all existing handler functions (handleViewCampaign, closeCampaignDetailsModal, etc.)

  const handleViewCampaign = async (campaign: any) => {
    if (campaign._id) {
      const fullCampaign = await fetchCampaignById(campaign._id);
      if (fullCampaign) {
        setSelectedCampaign(fullCampaign);
      } else {
        setSelectedCampaign(campaign);
      }
      await fetchCampaignMaterials(campaign._id);
    } else {
      setSelectedCampaign(campaign);
    }
    setShowCampaignDetails(true);
  };

  const closeCampaignDetailsModal = () => {
    setShowCampaignDetails(false);
    setSelectedCampaign(null);
    setCampaignMaterials([]);
    clearCurrentCampaign();
  };

  const handleViewSubmittedJobs = (campaign: any) => {
    const influencerStatus = getInfluencerStatus(campaign);
    if (!influencerStatus || !influencerStatus.isCompleted) return;

    setSelectedCampaign(campaign);
    const parsedDeliverables = parseSubmittedJobs(
      influencerStatus.submittedJobs
    );
    setDeliverables(parsedDeliverables);
    setIsEditingDeliverables(false);
    setShowSubmittedJobsModal(true);
  };

  const handleEditSubmittedJobs = () => {
    setIsEditingDeliverables(true);
  };

  const handleSaveEditedDeliverables = async () => {
    if (!selectedCampaign?._id || deliverables.length === 0) return;

    const invalidDeliverables = deliverables.filter((deliverable) => {
      return (
        !deliverable.platform || !deliverable.url || !deliverable.description
      );
    });

    if (invalidDeliverables.length > 0) {
      showToast({
        type: "error",
        title: "Validation Error",
        message: "Please fill in all required fields for each deliverable.",
        duration: 6000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateCampaignDeliverables(selectedCampaign._id, deliverables);

      showToast({
        type: "success",
        title: "Deliverables Updated!",
        message: "Your campaign deliverables have been updated successfully.",
        duration: 6000,
      });

      setIsEditingDeliverables(false);
      await fetchAssignedCampaigns();
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Update Failed",
        message:
          error.message || "Failed to update deliverables. Please try again.",
        duration: 6000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCampaignResponse = async (response: any) => {
    if (!selectedCampaign?._id) return;

    setIsSubmitting(true);
    try {
      await respondToCampaignAssignment(
        selectedCampaign._id,
        response,
        responseMessage
      );

      showToast({
        type: "success",
        title:
          response === "accepted" ? "Campaign Accepted!" : "Campaign Declined",
        message: `You have successfully ${response} the campaign.`,
        duration: 6000,
      });

      setShowResponseModal(false);
      setResponseMessage("");
      closeCampaignDetailsModal();

      await fetchAssignedCampaigns();
    } catch (error) {
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to respond to campaign. Please try again.",
        duration: 6000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitDeliverables = async () => {
    if (!selectedCampaign?._id || deliverables.length === 0) return;

    const invalidDeliverables = deliverables.filter((deliverable) => {
      return (
        !deliverable.platform || !deliverable.url || !deliverable.description
      );
    });

    if (invalidDeliverables.length > 0) {
      showToast({
        type: "error",
        title: "Validation Error",
        message:
          "Please fill in all required fields (platform, URL, description) for each deliverable.",
        duration: 6000,
      });
      return;
    }

    const invalidUrls = deliverables.filter((deliverable) => {
      const urlPattern = /^https?:\/\/.+/i;
      return !urlPattern.test(deliverable.url);
    });

    if (invalidUrls.length > 0) {
      showToast({
        type: "error",
        title: "Invalid URLs",
        message:
          "Please provide valid URLs (starting with http:// or https://) for all deliverables.",
        duration: 6000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitCampaignDeliverables(selectedCampaign._id, deliverables);

      showToast({
        type: "success",
        title: "Deliverables Submitted!",
        message: "Your campaign deliverables have been submitted for review.",
        duration: 6000,
      });

      setShowDeliverableModal(false);
      setDeliverables([]);
      closeCampaignDetailsModal();

      await fetchAssignedCampaigns();
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Submission Failed",
        message:
          error.message || "Failed to submit deliverables. Please try again.",
        duration: 6000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addDeliverable = () => {
    setDeliverables([
      ...deliverables,
      {
        platform: "",
        url: "",
        description: "",
        metrics: {},
      },
    ]);
  };

  const removeDeliverable = (index: number) => {
    setDeliverables(deliverables.filter((_, i) => i !== index));
  };

  const updateDeliverable = (index: number, field: string, value: any) => {
    const updated = [...deliverables];
    if (field.startsWith("metrics.")) {
      const metricField = field.split(".")[1];
      updated[index].metrics = {
        ...updated[index].metrics,
        [metricField]: value,
      };
    } else {
      (updated[index] as any)[field] = value;
    }
    setDeliverables(updated);
  };

  const getCurrentCampaigns = () => {
    switch (activeTab) {
      case "assigned":
        return assignedCampaigns;
      case "available":
        return availableCampaigns;
      case "history":
        return assignedCampaigns.filter(
          (c: any) => getInfluencerStatus(c)?.isCompleted
        );
      default:
        return [];
    }
  };

  // Filter campaigns with useMemo
  const filteredCampaigns = useMemo(() => {
    return getCurrentCampaigns().filter((campaign) => {
      const influencerStatus = getInfluencerStatus(campaign);
      if (!influencerStatus) return false;

      let matchesFilter = true;
      if (filter !== "all") {
        switch (filter) {
          case "pending":
            matchesFilter = influencerStatus.acceptanceStatus === "pending";
            break;
          case "accepted":
            matchesFilter = influencerStatus.acceptanceStatus === "accepted";
            break;
          case "rejected":
            matchesFilter = influencerStatus.acceptanceStatus === "declined";
            break;
          case "completed":
            matchesFilter = influencerStatus.isCompleted;
            break;
        }
      }

      const matchesSearch =
        campaign.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPlatform =
        platformFilter === "all" ||
        campaign.platforms.some(
          (p: any) => p.toLowerCase() === platformFilter.toLowerCase()
        );

      const matchesRole = roleFilter === "all" || campaign.role === roleFilter;

      return matchesFilter && matchesSearch && matchesPlatform && matchesRole;
    });
  }, [
    assignedCampaigns,
    availableCampaigns,
    filter,
    searchTerm,
    platformFilter,
    roleFilter,
    activeTab,
  ]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCampaigns = filteredCampaigns.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm, platformFilter, roleFilter, activeTab]);

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

  const getStatusColor = (campaign: any) => {
    const status = getInfluencerStatus(campaign);
    if (!status) return "bg-gray-100 text-gray-800";

    if (status.isCompleted) return "bg-green-100 text-green-800";
    if (isOverdue(campaign)) return "bg-red-100 text-red-800";
    if (status.acceptanceStatus === "accepted")
      return "bg-blue-100 text-blue-800";
    if (status.acceptanceStatus === "declined")
      return "bg-red-100 text-red-800";
    if (status.acceptanceStatus === "pending")
      return "bg-yellow-100 text-yellow-800";

    return "bg-gray-100 text-gray-800";
  };

  const getStatusText = (campaign: any) => {
    const status = getInfluencerStatus(campaign);
    if (!status) return "N/A";

    if (status.isCompleted) return "Completed";
    if (isOverdue(campaign)) return "Overdue";
    if (status.acceptanceStatus === "accepted") return "In Progress";
    if (status.acceptanceStatus === "declined") return "Declined";
    if (status.acceptanceStatus === "pending") return "Pending Response";

    return "N/A";
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
              onClick={() => {
                fetchAssignedCampaigns();
              }}
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
      {/* Keep all existing modals - Campaign Details, Submitted Jobs, Response, Deliverable Submission */}
      {/* I'll skip rendering the modal code here for brevity, but they remain unchanged */}

      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center gap-6 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Assigned Campaigns
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage your assigned campaigns and discover new opportunities.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    Proposed Monthly Earnings
                  </div>
                  <div className="text-xl font-bold text-green-600">
                    {user?.maxMonthlyEarningsNaira
                      ? formatCurrency(user.maxMonthlyEarningsNaira)
                      : "TBD"}
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Search - Keep existing code */}
            <div className="space-y-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by brand name, location, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {["all", "accepted", "rejected", "completed", "pending"].map(
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
                      {status.charAt(0).toUpperCase() +
                        status.slice(1).replace("_", " ")}
                    </button>
                  )
                )}
              </div>

              <div className="flex flex-wrap gap-4">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
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
                  {filteredCampaigns.length}
                </div>
                <div className="text-gray-600">
                  {filter === "all" ? "Total" : "Filtered"} Campaigns
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-gray-900">
                  {
                    assignedCampaigns.filter(
                      (c: any) => getInfluencerStatus(c)?.isCompleted
                    ).length
                  }
                </div>
                <div className="text-gray-600">Completed</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-gray-900">
                  {
                    assignedCampaigns.filter(
                      (c: any) =>
                        getInfluencerStatus(c)?.acceptanceStatus === "pending"
                    ).length
                  }
                </div>
                <div className="text-gray-600">Pending Response</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-red-600">
                  {assignedCampaigns.filter((c: any) => isOverdue(c)).length}
                </div>
                <div className="text-gray-600">Overdue</div>
              </div>
            </div>

            {/* Pagination Info */}
            {filteredCampaigns.length > 0 && (
              <div className="text-sm text-gray-600 mb-4">
                Showing {startIndex + 1} -{" "}
                {Math.min(endIndex, filteredCampaigns.length)} of{" "}
                {filteredCampaigns.length} campaigns
              </div>
            )}
          </div>

          {/* Campaigns List */}
          <div className="space-y-4 mb-8">
            {paginatedCampaigns.length === 0 ? (
              <div className="bg-white p-12 rounded-lg shadow-sm text-center">
                <div className="text-gray-400 text-lg mb-2">
                  No campaigns found
                </div>
                <p className="text-gray-600 mb-6">
                  {searchTerm || filter !== "all"
                    ? "Try adjusting your search or filters"
                    : activeTab === "available"
                    ? "No new campaigns available at the moment"
                    : `No ${activeTab} campaigns found`}
                </p>
                {activeTab === "available" && (
                  <button
                    onClick={() => fetchAssignedCampaigns()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
                  >
                    Refresh
                  </button>
                )}
              </div>
            ) : (
              paginatedCampaigns.map((campaign) => {
                const dueDateInfo = formatDueDate(campaign);
                const status = getInfluencerStatus(campaign);

                return (
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
                            {isOverdue(campaign) && (
                              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded font-medium">
                                OVERDUE
                              </span>
                            )}
                          </div>

                          <p className="text-gray-600 mb-4">
                            {campaign.platforms.join(", ")} •{" "}
                            {campaign.location}
                            {campaign.additionalLocations &&
                              campaign.additionalLocations.length > 0 &&
                              ` + ${campaign.additionalLocations.length} more`}
                          </p>

                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">
                                Followers Range:
                              </span>
                              <div className="text-gray-900">
                                {campaign.followersRange || "Any"}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Duration:
                              </span>
                              <div className="text-gray-900">
                                {campaign.postDuration || "N/A"}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Due Date:
                              </span>
                              <div
                                className={
                                  dueDateInfo.isOverdue
                                    ? "text-red-600 font-semibold"
                                    : "text-gray-900"
                                }
                              >
                                {dueDateInfo.date}
                                {status?.acceptanceStatus === "accepted" &&
                                  !status.isCompleted && (
                                    <span
                                      className={`block text-xs ${
                                        dueDateInfo.isOverdue
                                          ? "text-red-600"
                                          : dueDateInfo.daysRemaining <= 2
                                          ? "text-orange-600"
                                          : "text-gray-600"
                                      }`}
                                    >
                                      {dueDateInfo.isOverdue
                                        ? `${Math.abs(
                                            dueDateInfo.daysRemaining
                                          )} days overdue`
                                        : `${dueDateInfo.daysRemaining} days left`}
                                    </span>
                                  )}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Assigned:
                              </span>
                              <div className="text-gray-900">
                                {formatDate(status?.assignedAt)}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 lg:ml-6 mt-4 lg:mt-0">
                          <button
                            onClick={() => handleViewCampaign(campaign)}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-center flex items-center gap-2 justify-center"
                          >
                            <FaEye /> View Job Details
                          </button>

                          {activeTab === "assigned" && (
                            <>
                              {status?.acceptanceStatus === "pending" && (
                                <>
                                  <button
                                    onClick={() => {
                                      setSelectedCampaign(campaign);
                                      setShowResponseModal(true);
                                    }}
                                    className="bg-green-50 hover:bg-green-100 text-green-600 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 justify-center"
                                  >
                                    <FaCheck /> Accept
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedCampaign(campaign);
                                      setResponseMessage("");
                                      handleCampaignResponse("declined");
                                    }}
                                    className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 justify-center"
                                  >
                                    <FaTimes /> Reject
                                  </button>
                                </>
                              )}

                              {status?.acceptanceStatus === "accepted" &&
                                !status.isCompleted && (
                                  <button
                                    onClick={() => {
                                      setSelectedCampaign(campaign);
                                      setDeliverables([]);
                                      setShowDeliverableModal(true);
                                    }}
                                    className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 justify-center"
                                  >
                                    <FaUpload /> Submit Work
                                  </button>
                                )}

                              {status?.isCompleted && (
                                <button
                                  onClick={() =>
                                    handleViewSubmittedJobs(campaign)
                                  }
                                  className="bg-green-50 hover:bg-green-100 text-green-600 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 justify-center"
                                >
                                  <FaEye /> View Submitted
                                </button>
                              )}
                            </>
                          )}

                          {activeTab === "history" && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-gray-600 text-sm">
                              <FaClock />
                              Completed {formatDate(status?.completedAt)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination Controls */}
          {filteredCampaigns.length > itemsPerPage && (
            <div className="bg-white rounded-lg shadow-sm p-4">
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
                            ? "bg-indigo-600 text-white"
                            : page === "..."
                            ? "cursor-default text-gray-400"
                            : "border border-gray-300 hover:bg-gray-50 text-gray-700"
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

                {/* Go to page input */}
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
                    className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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

export default Jobs;
