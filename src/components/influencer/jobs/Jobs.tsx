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

interface AssignedCampaign {
  _id: string;
  role: "Brand" | "Business" | "Person" | "Movie" | "Music" | "Other";
  platforms: string[];
  brandName: string;
  email: string;
  brandPhone: string;
  influencersMin: number;
  influencersMax: number;
  followersRange?: "" | "1k-3k" | "3k-10k" | "20k-50k" | "50k & above";
  location: string;
  additionalLocations: string[];
  postFrequency: string;
  postDuration: string;
  avgInfluencers: number;
  postCount: number;
  costPerInfluencerPerPost: number;
  totalBaseCost: number;
  platformFee: number;
  totalCost: number;
  hasPaid: boolean;
  isValidated: boolean;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  paymentReference: string;
  paymentDate: string;

  assignedInfluencers: {
    _id: string;
    influencerId: {
      _id: string;
      name: string;
      id: string;
    };
    acceptanceStatus: "pending" | "accepted" | "declined";
    assignedAt: string;
    respondedAt?: string;
    completedAt?: string;
    isCompleted: boolean;
    submittedJobs: {
      description: string;
      imageUrl: string;
      submittedAt: string;
    }[];
  }[];
}

interface DeliverableSubmission {
  platform: string;
  url: string;
  description: string;
  metrics?: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
  };
}

interface DueDateInfo {
  date: string;
  isOverdue: boolean;
  daysRemaining: number;
}

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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showCampaignDetails, setShowCampaignDetails] =
    useState<boolean>(false);
  const [selectedCampaign, setSelectedCampaign] = useState<
    AssignedCampaign | any
  >(null);
  const [showDeliverableModal, setShowDeliverableModal] =
    useState<boolean>(false);
  const [showResponseModal, setShowResponseModal] = useState<boolean>(false);
  const [showApplicationModal, setShowApplicationModal] =
    useState<boolean>(false);
  const [showSubmittedJobsModal, setShowSubmittedJobsModal] =
    useState<boolean>(false);
  const [deliverables, setDeliverables] = useState<DeliverableSubmission[]>([]);
  const [responseMessage, setResponseMessage] = useState("");
  const [applicationMessage, setApplicationMessage] = useState("");
  const [proposedRate, setProposedRate] = useState<number | undefined>();
  const [isEditingDeliverables, setIsEditingDeliverables] =
    useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [campaignMaterials, setCampaignMaterials] = useState<any[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState<boolean>(false);

  const { showToast } = useToast();

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

  const isOverdue = (campaign: AssignedCampaign) => {
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

  const formatDueDate = (campaign: AssignedCampaign): DueDateInfo => {
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

  const getInfluencerStatus = (campaign: AssignedCampaign) => {
    return campaign.assignedInfluencers.find(
      (assigned) => assigned.influencerId._id === user?._id
    );
  };

  const parseSubmittedJobs = (
    submittedJobs: any[]
  ): DeliverableSubmission[] => {
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

  const handleViewCampaign = async (campaign: AssignedCampaign) => {
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

  const handleViewSubmittedJobs = (campaign: AssignedCampaign) => {
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
    getCurrentCampaigns,
    getInfluencerStatus
  ]);

  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCampaigns = filteredCampaigns.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm, platformFilter, roleFilter, activeTab]);

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

  const getStatusColor = (campaign: AssignedCampaign) => {
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

  const getStatusText = (campaign: AssignedCampaign) => {
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
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200/10 rounded w-1/4"></div>
            <div className="h-12 bg-slate-200/10 rounded"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-slate-200/10 rounded"></div>
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
      <AnimatePresence>
        {showCampaignDetails && selectedCampaign && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-2xl flex items-center justify-center p-4 z-50"
            onClick={closeCampaignDetailsModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-200/20 rounded-xl backdrop-blur-2xl border border-slate-200/10 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-400 mb-2">
                      {selectedCampaign.brandName}
                    </h2>
                  </div>
                  <button
                    onClick={closeCampaignDetailsModal}
                    className="text-gray-400 hover:text-gray-600 text-xl"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-semibold text-gray-500 mb-2">
                      Campaign Details
                    </h3>
                    <div className="space-y-2 text-sm text-gray-400">
                      <div>
                        <span className="font-medium">Role:</span>{" "}
                        {selectedCampaign.role}
                      </div>
                      <div>
                        <span className="font-medium">Platforms:</span>{" "}
                        {selectedCampaign.platforms.join(", ")}
                      </div>
                      <div>
                        <span className="font-medium">Location:</span>{" "}
                        {selectedCampaign.location}
                      </div>
                      <div>
                        <span className="font-medium">Followers Range:</span>{" "}
                        {selectedCampaign.followersRange || "Any"}
                      </div>
                      <div>
                        <span className="font-medium">Duration:</span>{" "}
                        {selectedCampaign.postDuration || "N/A"}
                      </div>
                      <div>
                        <span className="font-medium">Frequency:</span>{" "}
                        {selectedCampaign.postFrequency || "N/A"}
                      </div>
                      <div>
                        <span className="font-medium">Contact:</span>{" "}
                        {selectedCampaign.email}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="space-y-2 text-sm">
                      {(() => {
                        const status = getInfluencerStatus(selectedCampaign);
                        const dueDateInfo = formatDueDate(selectedCampaign);
                        return (
                          <>
                            {status?.respondedAt && (
                              <div>
                                <span className="font-medium">Responded:</span>{" "}
                                {formatDate(status.respondedAt)}
                              </div>
                            )}
                            {status?.acceptanceStatus === "accepted" && (
                              <div>
                                <span className="font-medium">Due Date:</span>
                                <span
                                  className={
                                    dueDateInfo.isOverdue
                                      ? "text-red-600 font-semibold"
                                      : ""
                                  }
                                >
                                  {dueDateInfo.date}
                                </span>
                                {!status.isCompleted && (
                                  <span
                                    className={`ml-2 text-xs ${
                                      dueDateInfo.isOverdue
                                        ? "text-red-600"
                                        : dueDateInfo.daysRemaining <= 2
                                        ? "text-orange-600"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    (
                                    {dueDateInfo.isOverdue
                                      ? `${Math.abs(
                                          dueDateInfo.daysRemaining
                                        )} days overdue`
                                      : `${dueDateInfo.daysRemaining} days left`}
                                    )
                                  </span>
                                )}
                              </div>
                            )}
                            {status?.completedAt && (
                              <div>
                                <span className="font-medium">Completed:</span>{" "}
                                {formatDate(status.completedAt)}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-500 mb-2">
                    Campaign Materials
                  </h3>
                  {materialsLoading ? (
                    <div className="bg-slate-200/20 p-4 rounded-lg">
                      <div className="animate-pulse flex space-x-4">
                        <div className="rounded bg-slate-200/10 h-20 w-20"></div>
                        <div className="flex-1 space-y-2 py-1">
                          <div className="h-4 bg-slate-200/10 rounded w-3/4"></div>
                          <div className="h-4 bg-slate-200/10 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ) : campaignMaterials.length > 0 ? (
                    <div className="bg-slate-200/20 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {campaignMaterials.map((material, index) => (
                          <div
                            key={index}
                            className="bg-slate-200/20 rounded-lg p-3 shadow-sm"
                          >
                            <div className="aspect-square mb-3 overflow-hidden rounded-lg bg-slate-200/10">
                              <Image
                                src={material.imageUrl || "/placeholder.svg"}
                                width={200}
                                height={200}
                                alt={`Campaign material ${index + 1}`}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                              />
                            </div>
                            {material.postDescription && (
                              <div className="text-sm text-gray-500">
                                <p className="font-medium mb-1">Description:</p>
                                <p className="line-clamp-3">
                                  {material.postDescription}
                                </p>
                              </div>
                            )}
                            {material.uploadedAt && (
                              <div className="text-xs text-gray-500 mt-2">
                                Uploaded:{" "}
                                {new Date(
                                  material.uploadedAt
                                ).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 text-sm text-gray-600">
                        <p className="font-medium">Campaign Brief:</p>
                        <p>
                          Use these materials as reference for your content
                          creation. Ensure your posts align with the
                          brand&apos;s visual style and messaging.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-200/20 p-4 rounded-lg">
                      <p className="text-gray-100">
                        Campaign materials have not been uploaded yet. The brand
                        will provide materials soon.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200/20">
                  {activeTab === "assigned" && (
                    <>
                      {getInfluencerStatus(selectedCampaign)
                        ?.acceptanceStatus === "pending" && (
                        <>
                          <button
                            onClick={() => setShowResponseModal(true)}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
                          >
                            Accept Campaign
                          </button>
                          <button
                            onClick={() => {
                              setResponseMessage("");
                              handleCampaignResponse("declined");
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium"
                          >
                            Reject Campaign
                          </button>
                        </>
                      )}

                      {getInfluencerStatus(selectedCampaign)
                        ?.acceptanceStatus === "accepted" &&
                        !getInfluencerStatus(selectedCampaign)?.isCompleted && (
                          <button
                            onClick={() => setShowDeliverableModal(true)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg font-medium"
                          >
                            Submit Deliverables
                          </button>
                        )}

                      {getInfluencerStatus(selectedCampaign)?.isCompleted && (
                        <button
                          onClick={() =>
                            handleViewSubmittedJobs(selectedCampaign)
                          }
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
                        >
                          View Submitted Work
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showSubmittedJobsModal && selectedCampaign && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-2xl flex items-center justify-center p-4 z-50"
            onClick={() => setShowSubmittedJobsModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-200/20 border border-slate-200/10 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-400">
                    {isEditingDeliverables
                      ? "Edit Submitted Work"
                      : "Submitted Work"}
                  </h3>
                  <div className="flex items-center gap-2">
                    {!isEditingDeliverables && (
                      <button
                        onClick={handleEditSubmittedJobs}
                        className="bg-yellow-50 hover:bg-yellow-100 text-yellow-600 px-4 py-2 rounded-lg font-medium"
                      >
                        <FaEdit className="inline mr-2" /> Edit
                      </button>
                    )}
                    <button
                      onClick={() => setShowSubmittedJobsModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {isEditingDeliverables ? (
                  <>
                    <div className="space-y-4 mb-6">
                      {deliverables.map((deliverable, index) => (
                        <div
                          key={index}
                          className="p-4 border border-slate-200/10 rounded-lg"
                        >
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium text-gray-400">
                              Deliverable {index + 1}
                            </h4>
                            <button
                              onClick={() => removeDeliverable(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <FaTrash />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-400 mb-2">
                                Platform
                              </label>
                              <select
                                value={deliverable.platform}
                                onChange={(e) =>
                                  updateDeliverable(
                                    index,
                                    "platform",
                                    e.target.value
                                  )
                                }
                                className="frm"
                              >
                                <option value="">Select platform</option>
                                {selectedCampaign?.platforms.map(
                                  (platform: any) => (
                                    <option key={platform} value={platform}>
                                      {platform}
                                    </option>
                                  )
                                )}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-400 mb-2">
                                Post URL
                              </label>
                              <input
                                type="url"
                                value={deliverable.url}
                                onChange={(e) =>
                                  updateDeliverable(
                                    index,
                                    "url",
                                    e.target.value
                                  )
                                }
                                placeholder="https://..."
                                className="frm"
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-400 mb-2">
                                Description
                              </label>
                              <textarea
                                value={deliverable.description}
                                onChange={(e) =>
                                  updateDeliverable(
                                    index,
                                    "description",
                                    e.target.value
                                  )
                                }
                                placeholder="Describe your deliverable..."
                                className="frm"
                                rows={3}
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-400 mb-2">
                                Performance Metrics (Optional)
                              </label>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                <input
                                  type="number"
                                  placeholder="Views"
                                  value={deliverable.metrics?.views || ""}
                                  onChange={(e) =>
                                    updateDeliverable(
                                      index,
                                      "metrics.views",
                                      Number(e.target.value) || 0
                                    )
                                  }
                                  className="frm"
                                />
                                <input
                                  type="number"
                                  placeholder="Likes"
                                  value={deliverable.metrics?.likes || ""}
                                  onChange={(e) =>
                                    updateDeliverable(
                                      index,
                                      "metrics.likes",
                                      Number(e.target.value) || 0
                                    )
                                  }
                                  className="frm"
                                />
                                <input
                                  type="number"
                                  placeholder="Comments"
                                  value={deliverable.metrics?.comments || ""}
                                  onChange={(e) =>
                                    updateDeliverable(
                                      index,
                                      "metrics.comments",
                                      Number(e.target.value) || 0
                                    )
                                  }
                                  className="frm"
                                />
                                <input
                                  type="number"
                                  placeholder="Shares"
                                  value={deliverable.metrics?.shares || ""}
                                  onChange={(e) =>
                                    updateDeliverable(
                                      index,
                                      "metrics.shares",
                                      Number(e.target.value) || 0
                                    )
                                  }
                                  className="frm"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={addDeliverable}
                        className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-yellow-400 transition flex items-center justify-center gap-2"
                      >
                        <FaPlus /> Add Another Deliverable
                      </button>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => setIsEditingDeliverables(false)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEditedDeliverables}
                        disabled={isSubmitting || deliverables.length === 0}
                        className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                      >
                        {isSubmitting ? "Updating..." : "Save Changes"}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
                      {deliverables.map((deliverable, index) => (
                        <div
                          key={index}
                          className="p-4 bg-slate-200/20 rounded-lg"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-medium text-gray-400">
                              {deliverable.platform} - Deliverable {index + 1}
                            </h4>
                            <a
                              href={deliverable.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="txt text-sm"
                            >
                              View Post →
                            </a>
                          </div>

                          <p className="text-gray-400 text-sm mb-3">
                            {deliverable.description}
                          </p>

                          {deliverable.metrics &&
                            Object.keys(deliverable.metrics).length > 0 && (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                {deliverable.metrics.views && (
                                  <div className="bg-slate-200/20 border border-slate-200/10 text-white p-2 rounded">
                                    <span className="font-medium">Views:</span>{" "}
                                    {deliverable.metrics.views.toLocaleString()}
                                  </div>
                                )}
                                {deliverable.metrics.likes && (
                                  <div className="bg-slate-200/20 border border-slate-200/10 text-white p-2 rounded">
                                    <span className="font-medium">Likes:</span>{" "}
                                    {deliverable.metrics.likes.toLocaleString()}
                                  </div>
                                )}
                                {deliverable.metrics.comments && (
                                  <div className="bg-slate-200/20 border border-slate-200/10 text-white p-2 rounded">
                                    <span className="font-medium">
                                      Comments:
                                    </span>{" "}
                                    {deliverable.metrics.comments.toLocaleString()}
                                  </div>
                                )}
                                {deliverable.metrics.shares && (
                                  <div className="bg-slate-200/20 border border-slate-200/10 text-white p-2 rounded">
                                    <span className="font-medium">Shares:</span>{" "}
                                    {deliverable.metrics.shares.toLocaleString()}
                                  </div>
                                )}
                              </div>
                            )}
                        </div>
                      ))}
                    </div>

                    <div className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
                      Work submitted on{" "}
                      {formatDate(
                        getInfluencerStatus(selectedCampaign)?.completedAt
                      )}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {showResponseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-2xl flex items-center justify-center p-4 z-50"
            onClick={() => setShowResponseModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-200/20 border border-slate-200/10 rounded-xl shadow-2xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-400 mb-4">
                  Accept Campaign
                </h3>
                <h5>
                  The brand will be notified that you have accepted this task.
                </h5>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setShowResponseModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleCampaignResponse("accepted")}
                    disabled={isSubmitting}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    {isSubmitting ? "Processing..." : "Accept"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showDeliverableModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-2xl flex items-center justify-center p-4 z-50"
            onClick={() => setShowDeliverableModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-200/20 border border-slate-200/10 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-400">
                    Submit Campaign Deliverables
                  </h3>
                  <button
                    onClick={() => setShowDeliverableModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  {deliverables.map((deliverable, index) => (
                    <div
                      key={index}
                      className="p-4 border border-slate-200/10 rounded-lg"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium text-gray-400">
                          Deliverable {index + 1}
                        </h4>
                        <button
                          onClick={() => removeDeliverable(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            Platform
                          </label>
                          <select
                            value={deliverable.platform}
                            onChange={(e) =>
                              updateDeliverable(
                                index,
                                "platform",
                                e.target.value
                              )
                            }
                            className="frm"
                          >
                            <option value="">Select platform</option>
                            {selectedCampaign?.platforms.map(
                              (platform: any) => (
                                <option key={platform} value={platform}>
                                  {platform}
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            Post URL
                          </label>
                          <input
                            type="url"
                            value={deliverable.url}
                            onChange={(e) =>
                              updateDeliverable(index, "url", e.target.value)
                            }
                            placeholder="https://..."
                            className="frm"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            Description
                          </label>
                          <textarea
                            value={deliverable.description}
                            onChange={(e) =>
                              updateDeliverable(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            placeholder="Describe your deliverable..."
                            className="frm resize-none"
                            rows={3}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            Performance Metrics (Optional)
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <input
                              type="number"
                              placeholder="Views"
                              value={deliverable.metrics?.views || ""}
                              onChange={(e) =>
                                updateDeliverable(
                                  index,
                                  "metrics.views",
                                  Number(e.target.value) || 0
                                )
                              }
                              className="frm"
                            />
                            <input
                              type="number"
                              placeholder="Likes"
                              value={deliverable.metrics?.likes || ""}
                              onChange={(e) =>
                                updateDeliverable(
                                  index,
                                  "metrics.likes",
                                  Number(e.target.value) || 0
                                )
                              }
                              className="frm"
                            />
                            <input
                              type="number"
                              placeholder="Comments"
                              value={deliverable.metrics?.comments || ""}
                              onChange={(e) =>
                                updateDeliverable(
                                  index,
                                  "metrics.comments",
                                  Number(e.target.value) || 0
                                )
                              }
                              className="frm"
                            />
                            <input
                              type="number"
                              placeholder="Shares"
                              value={deliverable.metrics?.shares || ""}
                              onChange={(e) =>
                                updateDeliverable(
                                  index,
                                  "metrics.shares",
                                  Number(e.target.value) || 0
                                )
                              }
                              className="frm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={addDeliverable}
                    className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-yellow-400 hover:text-yellow-600 transition"
                  >
                    + Add Deliverable
                  </button>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowDeliverableModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitDeliverables}
                    disabled={isSubmitting || deliverables.length === 0}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Deliverables"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex justify-between items-center gap-6 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-500">
                  Assigned Campaigns
                </h1>
                <p className="text-gray-500 mt-1">
                  Manage your assigned campaigns and discover new opportunities.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-500">
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

            <div className="space-y-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by brand name, location, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="frm"
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
                          ? "bg-yellow-500 text-white"
                          : "bg-slate-200/20 text-gray-400 hover:bg-gray-50/10 border border-slate-200/10"
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
                  className="px-4 py-2 border border-slate-200/10 rounded-lg bg-slate-200/20 text-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
                  {
                    assignedCampaigns.filter(
                      (c: any) => getInfluencerStatus(c)?.isCompleted
                    ).length
                  }
                </div>
                <div className="text-gray-400">Completed</div>
              </div>
              <div className="bg-slate-200/20 border border-slate-200/10 p-6 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-gray-400">
                  {
                    assignedCampaigns.filter(
                      (c: any) =>
                        getInfluencerStatus(c)?.acceptanceStatus === "pending"
                    ).length
                  }
                </div>
                <div className="text-gray-400">Pending Response</div>
              </div>
              <div className="bg-slate-200/20 border border-slate-200/10 p-6 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-red-600">
                  {assignedCampaigns.filter((c: any) => isOverdue(c)).length}
                </div>
                <div className="text-gray-400">Overdue</div>
              </div>
            </div>

            {filteredCampaigns.length > 0 && (
              <div className="text-sm text-gray-600 mb-4">
                Showing {startIndex + 1} -{" "}
                {Math.min(endIndex, filteredCampaigns.length)} of{" "}
                {filteredCampaigns.length} campaigns
              </div>
            )}
          </div>

          <div className="space-y-4 mb-8">
            {paginatedCampaigns.length === 0 ? (
              <div className="bg-slate-200/10 border border-slate-200/10 p-12 rounded-lg shadow-sm text-center">
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
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg"
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
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {campaign.role}
                            </span>
                            {isOverdue(campaign) && (
                              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded font-medium">
                                OVERDUE
                              </span>
                            )}
                          </div>

                          <p className="text-gray-400 mb-4">
                            {campaign.platforms.join(", ")} •{" "}
                            {campaign.location}
                            {campaign.additionalLocations &&
                              campaign.additionalLocations.length > 0 &&
                              ` + ${campaign.additionalLocations.length} more`}
                          </p>

                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-400">
                                Followers Range:
                              </span>
                              <div className="text-gray-400">
                                {campaign.followersRange || "Any"}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium text-gray-400">
                                Duration:
                              </span>
                              <div className="text-gray-400">
                                {campaign.postDuration || "N/A"}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium text-gray-400">
                                Due Date:
                              </span>
                              <div
                                className={
                                  dueDateInfo.isOverdue
                                    ? "text-red-600 font-semibold"
                                    : "text-gray-400"
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
                              <span className="font-medium text-gray-400">
                                Assigned:
                              </span>
                              <div className="text-gray-400">
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
                            ? "bg-yellow-600 text-white"
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

export default Jobs;
