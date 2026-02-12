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
import { FaDownload } from "react-icons/fa6";
import { FaComment, FaPaperPlane, FaUserTie, FaStar } from "react-icons/fa";

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
    isCompleted: string;
    submittedJobs: {
      description: string;
      imageUrl: string;
      submittedAt: string;
    }[];
  }[];
}
interface ReviewComment {
  _id: string;
  authorType: "brand" | "influencer";
  authorId: string;
  authorName: string;
  comment: string;
  createdAt: string;
  updatedAt?: string;
}

interface SubmittedJobWithReviews extends DeliverableSubmission {
  _id: string;
  description: string;
  submittedAt: string;
  reviews: ReviewComment[];
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
  const [showResponseModal2, setShowResponseModal2] = useState<boolean>(false);
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
  const [isStashing, setIsStashing] = useState(false);
  const [showStashedModal, setShowStashedModal] = useState(false);
  const [stashedDeliverables, setStashedDeliverables] = useState<any[]>([]);
  const [selectedStashId, setSelectedStashId] = useState<string | null>(null);
  const [stashName, setStashName] = useState<string>("");
  const [reviewComments, setReviewComments] = useState<{
    [key: string]: string;
  }>({});
  const [submittingReview, setSubmittingReview] = useState<{
    [key: string]: boolean;
  }>({});
  const [jobsWithReviews, setJobsWithReviews] = useState<
    SubmittedJobWithReviews[]
  >([]);

  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      try {
        const userStr = localStorage.getItem("user");

        if (userStr) {
          const user = JSON.parse(userStr);

          const token = user?.data?.token || user?.token || null;

          return token;
        }
      } catch (err) {
        console.error("Error parsing user token:", err);
      }
    }
    return null;
  };

  // fetchStashedDeliverables function
  const fetchStashedDeliverables = async (campaignId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/deliverables/${campaignId}/stashed-deliverables`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to fetch stashed deliverables",
        );
      }

      setStashedDeliverables(result.data.stashes || []);
    } catch (error) {
      console.error("Fetch stashed error:", error);
    }
  };

  // handleStashDeliverables function:
  const handleStashDeliverables = async () => {
    if (!selectedCampaign?._id || deliverables.length === 0) {
      showToast({
        type: "error",
        title: "No Deliverables",
        message: "Please add at least one deliverable before stashing.",
        duration: 4000,
      });
      return;
    }

    const hasInvalidDeliverable = deliverables.some(
      (d) => !d.platform || !d.url || !d.description,
    );

    if (hasInvalidDeliverable) {
      showToast({
        type: "error",
        title: "Incomplete Deliverables",
        message:
          "Please fill in platform, URL, and description for all deliverables.",
        duration: 4000,
      });
      return;
    }

    setIsStashing(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/deliverables/${selectedCampaign._id}/stash-deliverables`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            deliverables: deliverables,
            stashName: stashName || undefined,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to stash deliverables");
      }

      showToast({
        type: "success",
        title: "Deliverables Stashed!",
        message:
          "Your deliverables have been saved as draft. You can submit them later.",
        duration: 6000,
      });

      setShowDeliverableModal(false);
      setDeliverables([
        {
          platform: "",
          url: "",
          description: "",
          metrics: { views: 0, likes: 0, comments: 0, shares: 0 },
        },
      ]);
      setStashName("");

      await fetchStashedDeliverables(selectedCampaign._id);
    } catch (error: any) {
      console.error("Stash error:", error);
      showToast({
        type: "error",
        title: "Stash Failed",
        message:
          error.message || "Failed to stash deliverables. Please try again.",
        duration: 6000,
      });
    } finally {
      setIsStashing(false);
    }
  };

  // handleLoadStashed function
  const handleLoadStashed = (stashId: string) => {
    const stash = stashedDeliverables.find((s) => s.stashId === stashId);
    if (stash && stash.deliverables.length > 0) {
      setDeliverables(stash.deliverables);
      setSelectedStashId(stashId);
      setShowStashedModal(false);
      showToast({
        type: "success",
        title: "Stash Loaded",
        message: `"${stash.stashName}" has been loaded.`,
        duration: 4000,
      });
    }
  };

  // Update handleDeleteStashed function
  const handleDeleteStashed = async (stashId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/deliverables/${selectedCampaign._id}/stash/${stashId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete stash");
      }

      showToast({
        type: "success",
        title: "Stash Deleted",
        message: "The stash has been deleted.",
        duration: 4000,
      });

      await fetchStashedDeliverables(selectedCampaign._id);
    } catch (error: any) {
      console.error("Delete stash error:", error);
      showToast({
        type: "error",
        title: "Delete Failed",
        message: error.message || "Failed to delete stash.",
        duration: 4000,
      });
    }
  };

  // delete all stashes
  const handleDeleteAllStashes = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/deliverables/${selectedCampaign._id}/stashed-deliverables`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete all stashes");
      }

      setStashedDeliverables([]);
      setShowStashedModal(false);

      showToast({
        type: "success",
        title: "All Stashes Deleted",
        message: "All your stashed deliverables have been deleted.",
        duration: 4000,
      });
    } catch (error: any) {
      console.error("Delete all stashes error:", error);
      showToast({
        type: "error",
        title: "Delete Failed",
        message: error.message || "Failed to delete all stashes.",
        duration: 4000,
      });
    }
  };

  const token = getAuthToken();
  const { showToast } = useToast();

  useEffect(() => {
    if (selectedCampaign?._id) {
      fetchStashedDeliverables(selectedCampaign._id);
    }
  }, [selectedCampaign?._id, fetchStashedDeliverables]);

  useEffect(() => {
    if (showSubmittedJobsModal && selectedCampaign && !isEditingDeliverables) {
      const influencerStatus = getInfluencerStatus(selectedCampaign);
      if (influencerStatus) {
        const jobsWithReviewsData: SubmittedJobWithReviews[] =
          influencerStatus.submittedJobs.map((job: any) => {
            const parsedJob = parseSubmittedJobs([job])[0];
            return {
              ...parsedJob,
              _id: job._id || `job-${Date.now()}`,
              description: job.description,
              submittedAt: job.submittedAt,
              reviews: job.reviews || [],
            };
          });
        setJobsWithReviews(jobsWithReviewsData);
      }
    }
  }, []);

  const calculateDueDate = (
    assignedAt: string,
    postFrequency: string,
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
      influencerStatus.isCompleted === "in-progress" ||
      influencerStatus.acceptanceStatus !== "accepted"
    ) {
      return false;
    }

    const dueDate = calculateDueDate(
      influencerStatus.assignedAt,
      campaign.postFrequency || "1 time per week for 1 week",
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
      campaign.postFrequency || "1 time per week for 1 week",
    );
    const isOverdueStatus =
      influencerStatus.isCompleted === "in-progress" && new Date() > dueDate;

    return {
      date: dueDate.toLocaleDateString(),
      isOverdue: isOverdueStatus,
      daysRemaining:
        influencerStatus.isCompleted === "in-progress"
          ? 0
          : Math.ceil(
              (dueDate.getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24),
            ),
    };
  };

  const getInfluencerStatus = (campaign: any) => {
    return campaign.assignedInfluencers.find(
      (assigned: any) => assigned.influencerId._id === user?._id,
    );
  };

  const parseSubmittedJobs = (
    submittedJobs: any[],
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
        line.startsWith("Metrics:"),
      );
      const urlLine = lines.find((line: string) =>
        line.startsWith("Post URL:"),
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
        },
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

  const handleEditSubmittedJobs = () => {
    // Load current submitted jobs into deliverables for editing
    const influencerStatus = getInfluencerStatus(selectedCampaign);
    if (influencerStatus && influencerStatus.submittedJobs) {
      const parsedJobs = parseSubmittedJobs(influencerStatus.submittedJobs);
      setDeliverables(parsedJobs);
    }
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
        responseMessage,
      );

      showToast({
        type: "success",
        title:
          response === "accepted" ? "Campaign Accepted!" : "Campaign Declined",
        message: `You have successfully ${response} the campaign.`,
        duration: 6000,
      });

      setShowResponseModal(false);
      setShowResponseModal2(false);
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
        message:
          "Your campaign deliverables will now undergo review. View your submitted jobs to request payment",
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
          (c: any) => getInfluencerStatus(c)?.isCompleted === "Completed",
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
            matchesFilter = influencerStatus.isCompleted === "Completed";
            break;
        }
      }

      const matchesSearch =
        campaign.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPlatform =
        platformFilter === "all" ||
        campaign.platforms.some(
          (p: any) => p.toLowerCase() === platformFilter.toLowerCase(),
        );

      const matchesRole = roleFilter === "all" || campaign.role === roleFilter;

      return matchesFilter && matchesSearch && matchesPlatform && matchesRole;
    });
  }, []);

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

    if (status.isCompleted === "Completed")
      return "bg-green-100 text-green-800";
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

    if (status.isCompleted === "Completed") return "Completed";
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

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      window.open(url, "_blank");
    }
  };

  const getFileExtension = (url: string): string => {
    const match = url.match(/\.([^./?#]+)(?:[?#]|$)/);
    return match ? match[1] : "jpg";
  };

  const generateFilename = (
    index: number,
    url: string,
    contentType?: string,
  ): string => {
    const extension = getFileExtension(url);
    const typeSlug = contentType
      ? contentType.toLowerCase().replace(/\s+/g, "-")
      : "material";
    return `campaign-${typeSlug}-${index + 1}.${extension}`;
  };

  const handleAddReview = async (
    campaignId: string,
    influencerId: string,
    jobId: string,
    comment: string,
  ) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reviews/${campaignId}/jobs/${jobId}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            comment,
            influencerId,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to add review");
      }

      if (result.success) {
        const newReview = result.data.review;

        return newReview;
      }
    } catch (error: any) {
      console.error("Error adding review:", error);
      showToast({
        type: "error",
        title: "Failed to Post Comment",
        message:
          error.message ||
          "There was an error posting your comment. Please try again.",
        duration: 6000,
      });
      throw error;
    }
  };

  const handleSubmitReview = async (jobId: string) => {
    const comment = reviewComments[jobId]?.trim();
    if (!comment || !selectedCampaign?._id || !user?._id) return;

    setSubmittingReview({ ...submittingReview, [jobId]: true });

    try {
      const optimisticReview: ReviewComment = {
        _id: `temp-${Date.now()}`,
        authorType: "influencer",
        authorId: user._id,
        authorName: user.name,
        comment: comment,
        createdAt: new Date().toISOString(),
      };

      setJobsWithReviews((prevJobs) =>
        prevJobs.map((job) =>
          job._id === jobId
            ? {
                ...job,
                reviews: [...(job.reviews || []), optimisticReview],
              }
            : job,
        ),
      );

      setReviewComments({ ...reviewComments, [jobId]: "" });

      const result = await handleAddReview(
        selectedCampaign._id,
        user._id,
        jobId,
        comment,
      );

      if (result) {
        setJobsWithReviews((prevJobs) =>
          prevJobs.map((job) =>
            job._id === jobId
              ? {
                  ...job,
                  reviews: [
                    ...(job.reviews || []).filter(
                      (r) => r._id !== optimisticReview._id,
                    ),
                    result,
                  ],
                }
              : job,
          ),
        );

        showToast({
          type: "success",
          title: "Comment Posted!",
          message: "Your comment has been added successfully.",
          duration: 4000,
        });

        fetchAssignedCampaigns();

        setShowSubmittedJobsModal(false);
      }
    } catch (error) {
      console.error("Failed to submit review:", error);

      setJobsWithReviews((prevJobs) =>
        prevJobs.map((job) =>
          job._id === jobId
            ? {
                ...job,
                reviews: (job.reviews || []).filter(
                  (r) => !r._id.startsWith("temp-"),
                ),
              }
            : job,
        ),
      );

      setReviewComments({ ...reviewComments, [jobId]: comment });
    } finally {
      setSubmittingReview({ ...submittingReview, [jobId]: false });
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewSubmittedJobsWithReviews = (campaign: AssignedCampaign) => {
    const influencerStatus = getInfluencerStatus(campaign);
    if (
      !influencerStatus ||
      !influencerStatus.submittedJobs ||
      influencerStatus.submittedJobs.length === 0
    ) {
      showToast({
        type: "error",
        title: "No Submissions",
        message: "You haven't submitted any work for this campaign yet.",
        duration: 4000,
      });
      return;
    }

    setSelectedCampaign(campaign);

    // Map submitted jobs to include reviews
    const jobsWithReviewsData: SubmittedJobWithReviews[] =
      influencerStatus.submittedJobs.map((job: any) => {
        const parsedJob = parseSubmittedJobs([job])[0];
        return {
          ...parsedJob,
          _id: job._id || `job-${Date.now()}`,
          description: job.description,
          submittedAt: job.submittedAt,
          reviews: job.reviews || [],
        };
      });

    setJobsWithReviews(jobsWithReviewsData);
    setIsEditingDeliverables(false);
    setShowSubmittedJobsModal(true);
  };

  const parseJobDescription = (description: string) => {
    const lines = description.split("\n").filter((line) => line.trim());

    let platform = "";
    let actualDescription = "";
    let postUrl = "";
    let metrics = {};

    lines.forEach((line) => {
      if (line.startsWith("Platform:")) {
        platform = line.replace("Platform:", "").trim();
      } else if (line.startsWith("Description:")) {
        actualDescription = line.replace("Description:", "").trim();
      } else if (line.startsWith("Post URL:")) {
        postUrl = line.replace("Post URL:", "").trim();
      } else if (line.startsWith("Metrics:")) {
        try {
          metrics = JSON.parse(line.replace("Metrics:", "").trim());
        } catch (e) {
          metrics = {};
        }
      }
    });

    return {
      platform,
      description: actualDescription,
      postUrl,
      metrics,
    };
  };

  const handleMarkAsComplete = async () => {
    if (!selectedCampaign?._id) return;

    const influencerStatus = getInfluencerStatus(selectedCampaign);
    if (!influencerStatus) return;

    const requiredPosts = selectedCampaign.postCount || 1;
    const submittedPosts = influencerStatus.submittedJobs?.length || 0;

    if (submittedPosts < requiredPosts) {
      showToast({
        type: "error",
        title: "Cannot Mark as Complete",
        message: `You have submitted ${submittedPosts} out of ${requiredPosts} required posts. Please submit all deliverables first.`,
        duration: 6000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/deliverables/${selectedCampaign._id}/mark-complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to mark campaign as complete",
        );
      }

      showToast({
        type: "success",
        title: "Campaign Completed! 🎉",
        message:
          result.message ||
          "The campaign has been marked as complete. The brand has been notified.",
        duration: 8000,
      });

      await fetchAssignedCampaigns();
      setShowSubmittedJobsModal(false);
      closeCampaignDetailsModal();
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Failed to Mark Complete",
        message:
          error.message ||
          "Failed to mark campaign as complete. Please try again.",
        duration: 6000,
      });
    } finally {
      setIsSubmitting(false);
    }
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
              className="bg-black no-scrollbar rounded-xl backdrop-blur-2xl border border-slate-200/10 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {selectedCampaign.brandName}
                    </h2>
                  </div>
                  <button
                    onClick={closeCampaignDetailsModal}
                    className="text-white hover:text-white text-xl"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-semibold text-white mb-2">
                      Campaign Details
                    </h3>
                    <div className="space-y-2 text-sm text-white">
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
                                {status.isCompleted === "in-progress" && (
                                  <span
                                    className={`ml-2 text-xs ${
                                      dueDateInfo.isOverdue
                                        ? "text-red-600"
                                        : dueDateInfo.daysRemaining <= 2
                                          ? "text-orange-600"
                                          : "text-white"
                                    }`}
                                  >
                                    (
                                    {dueDateInfo.isOverdue
                                      ? `${Math.abs(
                                          dueDateInfo.daysRemaining,
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
                  <h3 className="font-semibold text-white mb-2">
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
                    <div className="bg-slate-200/20 border border-gray-200/10 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {campaignMaterials.map((material, index) => {
                          const isVideo =
                            material.fileType === "video" ||
                            material.mediaType === "video" ||
                            material.imageUrl?.match(/\.(mp4|mov|avi|webm)$/i);

                          return (
                            <div
                              key={index}
                              className="bg-slate-200/10 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow relative group"
                            >
                              <div className="aspect-square mb-3 overflow-hidden rounded-lg relative">
                                {isVideo ? (
                                  <video
                                    src={material.imageUrl}
                                    className="w-full h-full object-cover"
                                    controls
                                  />
                                ) : (
                                  <Image
                                    src={
                                      material.imageUrl || "/placeholder.svg"
                                    }
                                    width={200}
                                    height={200}
                                    alt={`Campaign material ${index + 1}`}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                                  />
                                )}

                                {/* Download Button Overlay */}
                                <button
                                  onClick={() =>
                                    handleDownload(
                                      material.imageUrl,
                                      generateFilename(
                                        index,
                                        material.imageUrl,
                                        material.contentType,
                                      ),
                                    )
                                  }
                                  className="absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                  title="Download material"
                                >
                                  <FaDownload className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Description */}
                              {material.postDescription && (
                                <>
                                  <div className="text-sm text-white mb-2">
                                    <p className="font-medium mb-1">
                                      Description:
                                    </p>
                                    <p className="line-clamp-3">
                                      {material.postDescription}
                                    </p>
                                  </div>
                                  <div className="text-sm text-white mb-2">
                                    <p className="font-medium mb-1">Focus:</p>
                                    <p className="line-clamp-3">
                                      {material.contentType}
                                    </p>
                                  </div>
                                </>
                              )}

                              {/* Upload Date */}
                              {material.uploadedAt && (
                                <div className="text-xs text-white/60">
                                  Uploaded:{" "}
                                  {new Date(
                                    material.uploadedAt,
                                  ).toLocaleDateString()}
                                </div>
                              )}

                              {/* Download Button */}
                              <button
                                onClick={() =>
                                  handleDownload(
                                    material.imageUrl,
                                    generateFilename(
                                      index,
                                      material.imageUrl,
                                      material.contentType,
                                    ),
                                  )
                                }
                                className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium rounded-lg transition-colors"
                              >
                                <FaDownload className="w-3 h-3" />
                                Download {isVideo ? "Video" : "Image"}
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Campaign Brief */}
                      <div className="mt-4 text-sm text-white">
                        <p className="font-medium mb-2">Campaign Brief:</p>
                        <p className="text-white/80">
                          Use these materials as reference for your content
                          creation. Ensure your posts align with the
                          brand&apos;s visual style and messaging. Download the
                          materials you need by clicking the download button on
                          each item.
                        </p>
                      </div>

                      {/* Download All Button */}
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => {
                            campaignMaterials.forEach((material, index) => {
                              setTimeout(() => {
                                handleDownload(
                                  material.imageUrl,
                                  generateFilename(
                                    index,
                                    material.imageUrl,
                                    material.contentType,
                                  ),
                                );
                              }, index * 500);
                            });
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-200/10 hover:bg-slate-200/20 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          <FaDownload className="w-4 h-4" />
                          Download All Materials
                        </button>
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
                            onClick={() => setShowResponseModal2(true)}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium"
                          >
                            Reject Campaign
                          </button>
                        </>
                      )}

                      {getInfluencerStatus(selectedCampaign)
                        ?.acceptanceStatus === "accepted" &&
                        getInfluencerStatus(selectedCampaign)?.isCompleted !==
                          "Completed" && (
                          <button
                            onClick={() => setShowDeliverableModal(true)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg font-medium"
                          >
                            Submit Deliverables
                          </button>
                        )}

                      {getInfluencerStatus(selectedCampaign)?.submittedJobs
                        ?.length > 0 && (
                        <button
                          onClick={() =>
                            handleViewSubmittedJobsWithReviews(selectedCampaign)
                          }
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
                        >
                          View Submitted Work (
                          {getInfluencerStatus(selectedCampaign)?.submittedJobs
                            ?.length || 0}
                          )
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
              className="bg-black border border-slate-200/10 no-scrollbar rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-white">
                    {isEditingDeliverables
                      ? "Edit Submitted Work"
                      : "Submitted Work & Discussion"}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setShowSubmittedJobsModal(false);
                        setJobsWithReviews([]);
                        setReviewComments({});
                      }}
                      className="text-white hover:text-white"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="mb-4 grid grid-cols-2 gap-3">
                  {!isEditingDeliverables && (
                    <button
                      onClick={handleEditSubmittedJobs}
                      className="bg-yellow-50 hover:bg-yellow-100 text-yellow-600 px-4 py-2 rounded-lg font-medium"
                    >
                      <FaEdit className="inline mr-2" /> Edit
                    </button>
                  )}
                  {!isEditingDeliverables && (
                    <div className="">
                      {(() => {
                        const influencerStatus =
                          getInfluencerStatus(selectedCampaign);
                        const requiredPosts = selectedCampaign.postCount || 1;
                        const submittedPosts =
                          influencerStatus?.submittedJobs?.length || 0;
                        const isComplete =
                          influencerStatus?.isCompleted === "Completed";
                        const allPostsSubmitted =
                          submittedPosts >= requiredPosts;

                        return (
                          <div className="space-y-4">
                            {/* Status Message */}
                            {allPostsSubmitted && (
                              <div className="flex flex-col gap-3">
                                <button
                                  onClick={handleMarkAsComplete}
                                  disabled={isComplete}
                                  className="w-full bg-green-600 hover:bg-green-700 text-white disabled:cursor-not-allowed px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                  {isSubmitting ? (
                                    <>
                                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                      Processing...
                                    </>
                                  ) : (
                                    <>
                                      <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                      </svg>
                                      Request Payment
                                    </>
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {isEditingDeliverables ? (
                  <>
                    {/* deliverables UI */}
                    <div className="space-y-4 mb-6">
                      {deliverables.map((deliverable, index) => (
                        <div
                          key={index}
                          className="p-4 border border-slate-200/10 rounded-lg"
                        >
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium text-white">
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
                              <label className="block text-sm font-medium text-white mb-2">
                                Platform
                              </label>
                              <select
                                value={deliverable.platform}
                                onChange={(e) =>
                                  updateDeliverable(
                                    index,
                                    "platform",
                                    e.target.value,
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
                                  ),
                                )}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-white mb-2">
                                Post URL
                              </label>
                              <input
                                type="url"
                                value={deliverable.url}
                                onChange={(e) =>
                                  updateDeliverable(
                                    index,
                                    "url",
                                    e.target.value,
                                  )
                                }
                                placeholder="https://..."
                                className="frm"
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-white mb-2">
                                Description
                              </label>
                              <textarea
                                value={deliverable.description}
                                onChange={(e) =>
                                  updateDeliverable(
                                    index,
                                    "description",
                                    e.target.value,
                                  )
                                }
                                placeholder="Describe your deliverable..."
                                className="frm"
                                rows={3}
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-white mb-2">
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
                                      Number(e.target.value) || 0,
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
                                      Number(e.target.value) || 0,
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
                                      Number(e.target.value) || 0,
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
                                      Number(e.target.value) || 0,
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
                        className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-white hover:border-yellow-400 transition flex items-center justify-center gap-2"
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
                    {/* View Mode with Reviews */}
                    <div className="space-y-6 mb-6">
                      {jobsWithReviews.map((job, index) => (
                        <div
                          key={job._id}
                          className="bg-slate-200/10 border border-slate-200/10 rounded-xl shadow-sm"
                        >
                          {/* Job Header */}
                          <div className="px-6 py-4 border-b border-gray-100/10 bg-gradient-to-r from-yellow-50/5 to-yellow-50/5">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                                  {index + 1}
                                </div>
                                <h5 className="text-lg font-semibold text-white">
                                  {job.platform} - Deliverable {index + 1}
                                </h5>
                              </div>
                              <a
                                href={job.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-yellow-600 hover:text-yellow-700 text-sm font-medium"
                              >
                                View Post →
                              </a>
                            </div>
                          </div>

                          {/* Job Content */}
                          <div className="p-6">
                            {(() => {
                              const parsedData = parseJobDescription(
                                job.description,
                              );

                              return (
                                <>
                                  {/* Platform Badge */}
                                  {parsedData.platform && (
                                    <div className="mb-4">
                                      <h6 className="text-sm font-semibold text-white/80 mb-2">
                                        Platform
                                      </h6>
                                      <span className="inline-flex items-center px-3 py-1 bg-yellow-600 text-white rounded-full text-sm font-medium">
                                        {parsedData.platform}
                                      </span>
                                    </div>
                                  )}

                                  {/* Description */}
                                  {parsedData.description && (
                                    <div className="mb-4">
                                      <h6 className="text-sm font-semibold text-white/80 mb-2">
                                        Description
                                      </h6>
                                      <p className="text-white text-sm leading-relaxed">
                                        {parsedData.description}
                                      </p>
                                    </div>
                                  )}

                                  {/* Post URL */}
                                  {parsedData.postUrl && (
                                    <div className="mb-4">
                                      <h6 className="text-sm font-semibold text-white/80 mb-2">
                                        Post Link
                                      </h6>
                                      <a
                                        href={parsedData.postUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-yellow-600 hover:text-yellow-700 text-sm underline break-all"
                                      >
                                        {parsedData.postUrl}
                                      </a>
                                    </div>
                                  )}
                                </>
                              );
                            })()}

                            {/* Performance Metrics */}
                            {job.metrics &&
                              Object.keys(job.metrics).length > 0 && (
                                <div className="mb-4">
                                  <h6 className="text-sm font-semibold text-white/80 mb-2">
                                    Performance Metrics
                                  </h6>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                    {job.metrics.views !== undefined && (
                                      <div className="bg-slate-200/20 border border-slate-200/10 text-white p-2 rounded">
                                        <span className="font-medium">
                                          Views:
                                        </span>{" "}
                                        {job.metrics.views.toLocaleString()}
                                      </div>
                                    )}
                                    {job.metrics.likes !== undefined && (
                                      <div className="bg-slate-200/20 border border-slate-200/10 text-white p-2 rounded">
                                        <span className="font-medium">
                                          Likes:
                                        </span>{" "}
                                        {job.metrics.likes.toLocaleString()}
                                      </div>
                                    )}
                                    {job.metrics.comments !== undefined && (
                                      <div className="bg-slate-200/20 border border-slate-200/10 text-white p-2 rounded">
                                        <span className="font-medium">
                                          Comments:
                                        </span>{" "}
                                        {job.metrics.comments.toLocaleString()}
                                      </div>
                                    )}
                                    {job.metrics.shares !== undefined && (
                                      <div className="bg-slate-200/20 border border-slate-200/10 text-white p-2 rounded">
                                        <span className="font-medium">
                                          Shares:
                                        </span>{" "}
                                        {job.metrics.shares.toLocaleString()}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                            {/* Reviews/Discussion Section */}
                            <div className="mt-6 bg-slate-200/10 border border-slate-200/10 rounded-lg p-4">
                              <h5 className="text-white font-bold mb-4 flex items-center gap-2">
                                <FaComment className="text-yellow-600" />
                                Discussion Thread
                                {job.reviews && job.reviews.length > 0 && (
                                  <span className="text-xs bg-yellow-600 text-white px-2 py-0.5 rounded-full">
                                    {job.reviews.length}
                                  </span>
                                )}
                              </h5>

                              {/* Existing Reviews */}
                              {job.reviews && job.reviews.length > 0 ? (
                                <div className="space-y-3 mb-4">
                                  {job.reviews.map((review) => (
                                    <div
                                      key={review._id}
                                      className={`p-3 rounded-lg ${
                                        review.authorType === "brand"
                                          ? "bg-blue-50/10 border-l-4 border-blue-500"
                                          : "bg-purple-50/10 border-l-4 border-purple-500"
                                      } ${
                                        review._id.startsWith("temp-")
                                          ? "opacity-70"
                                          : ""
                                      }`}
                                    >
                                      <div className="flex items-start gap-3">
                                        <div
                                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${
                                            review.authorType === "brand"
                                              ? "bg-blue-600"
                                              : "bg-purple-600"
                                          }`}
                                        >
                                          {review.authorType === "brand" ? (
                                            <FaUserTie />
                                          ) : (
                                            <FaStar />
                                          )}
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex flex-col items-start gap-2 mb-1 flex-wrap">
                                            <span className="font-semibold truncate max-w-30 md:max-w-full text-white text-sm">
                                              {review.authorName}
                                            </span>
                                            <span
                                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                review.authorType === "brand"
                                                  ? "bg-blue-100 text-blue-800"
                                                  : "bg-purple-100 text-purple-800"
                                              }`}
                                            >
                                              {review.authorType === "brand"
                                                ? "Brand"
                                                : "Influencer"}
                                            </span>
                                            {review._id.startsWith("temp-") && (
                                              <span className="text-xs text-gray-400 italic">
                                                Sending...
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-white text-sm leading-relaxed">
                                            {review.comment}
                                          </p>
                                          <span className="text-xs text-gray-400">
                                            {formatDateTime(review.createdAt)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-4 text-gray-400 text-sm mb-4">
                                  No comments yet. Start the discussion!
                                </div>
                              )}

                              {/* Add Review Form */}
                              <div className="border-t border-slate-200/10 pt-4">
                                <div className="flex gap-3">
                                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 bg-purple-600">
                                    <FaStar />
                                  </div>
                                  <div className="flex-1">
                                    <textarea
                                      value={reviewComments[job._id] || ""}
                                      onChange={(e) =>
                                        setReviewComments({
                                          ...reviewComments,
                                          [job._id]: e.target.value,
                                        })
                                      }
                                      placeholder="Share updates, ask questions, or respond to the brand..."
                                      className="w-full px-4 py-3 bg-slate-200/20 border border-slate-200/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent resize-none"
                                      rows={3}
                                      disabled={submittingReview[job._id]}
                                    />
                                    <div className="flex justify-end mt-2">
                                      <button
                                        onClick={() =>
                                          handleSubmitReview(job._id)
                                        }
                                        disabled={
                                          !reviewComments[job._id]?.trim() ||
                                          submittingReview[job._id]
                                        }
                                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                      >
                                        {submittingReview[job._id] ? (
                                          <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Posting...
                                          </>
                                        ) : (
                                          <>
                                            <FaPaperPlane />
                                            Post Comment
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Job Footer */}
                          <div className="px-6 py-3 bg-slate-200/20 border-t border-slate-200/10 rounded-b-xl">
                            <div className="flex items-center justify-between text-xs text-gray-400">
                              <span>
                                Submitted: {formatDate(job.submittedAt)}
                              </span>
                              <span className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                Completed
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="text-sm text-black bg-green-50 p-3 rounded-lg">
                      Work submitted on{" "}
                      {formatDate(
                        getInfluencerStatus(selectedCampaign)?.completedAt,
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
                <h3 className="text-lg font-semibold text-white mb-4">
                  Accept Campaign
                </h3>
                <h5 className="text-white">
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
        {showResponseModal2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-2xl flex items-center justify-center p-4 z-50"
            onClick={() => setShowResponseModal2(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-200/20 border border-slate-200/10 rounded-xl shadow-2xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Reject Campaign
                </h3>
                <h5 className="text-white">
                  The brand will be notified that you have declined this task.
                </h5>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setShowResponseModal2(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleCampaignResponse("declined")}
                    disabled={isSubmitting}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    {isSubmitting ? "Processing..." : "Reject"}
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
                  <h3 className="text-lg font-semibold text-white">
                    Submit Campaign Deliverables
                  </h3>
                  <div className="flex items-center gap-3">
                    {stashedDeliverables.length > 0 && (
                      <button
                        onClick={() => setShowStashedModal(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm transition"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                        </svg>
                        {stashedDeliverables.length} Saved Draft
                        {stashedDeliverables.length !== 1 ? "s" : ""}
                      </button>
                    )}
                    <button
                      onClick={() => setShowDeliverableModal(false)}
                      className="text-white hover:text-white text-2xl"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  {deliverables.map((deliverable, index) => (
                    <div
                      key={index}
                      className="p-4 border border-slate-200/10 rounded-lg"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium text-white">
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
                          <label className="block text-sm font-medium text-white mb-2">
                            Platform
                          </label>
                          <select
                            value={deliverable.platform}
                            onChange={(e) =>
                              updateDeliverable(
                                index,
                                "platform",
                                e.target.value,
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
                              ),
                            )}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
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
                          <label className="block text-sm font-medium text-white mb-2">
                            Description
                          </label>
                          <textarea
                            value={deliverable.description}
                            onChange={(e) =>
                              updateDeliverable(
                                index,
                                "description",
                                e.target.value,
                              )
                            }
                            placeholder="Describe your deliverable..."
                            className="frm resize-none"
                            rows={3}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-white mb-2">
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
                                  Number(e.target.value) || 0,
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
                                  Number(e.target.value) || 0,
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
                                  Number(e.target.value) || 0,
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
                                  Number(e.target.value) || 0,
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
                    className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-white hover:border-yellow-400 hover:text-yellow-600 transition"
                  >
                    + Add Deliverable
                  </button>
                </div>

                <div className="grid lg:grid-cols-3 grid-cols-1 gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowDeliverableModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>

                  {/* STASH BUTTON - NEW */}
                  <button
                    onClick={handleStashDeliverables}
                    disabled={isStashing || deliverables.length === 0}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isStashing ? (
                      "Stashing..."
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                        </svg>
                        Save as Draft
                      </>
                    )}
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
        {/* STASHED DELIVERABLES MODAL */}
        {showStashedModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-2xl flex items-center justify-center p-4 z-50"
            onClick={() => setShowStashedModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-200/20 border border-slate-200/10 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-200/10">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Saved Drafts ({stashedDeliverables.length})
                    </h3>
                    <p className="text-sm text-white/60 mt-1">
                      Load or delete your saved draft deliverables
                    </p>
                  </div>
                  <button
                    onClick={() => setShowStashedModal(false)}
                    className="text-white hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {stashedDeliverables.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-white/60 mb-2">No saved drafts</div>
                    <p className="text-sm text-white/40">
                      Your saved drafts will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stashedDeliverables.map((stash) => (
                      <div
                        key={stash.stashId}
                        className="bg-slate-200/10 border border-slate-200/10 rounded-lg p-4 hover:bg-slate-200/20 transition"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-white mb-1">
                              {stash.stashName}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-white/60">
                              <span className="flex items-center gap-1">
                                <svg
                                  className="w-4 h-4"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                  <path
                                    fillRule="evenodd"
                                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {stash.deliverables.length} deliverable
                                {stash.deliverables.length !== 1 ? "s" : ""}
                              </span>
                              <span className="flex items-center gap-1">
                                <svg
                                  className="w-4 h-4"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {new Date(stash.stashedAt).toLocaleDateString()}{" "}
                                {new Date(stash.stashedAt).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Preview deliverables */}
                        <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                          {stash.deliverables
                            .slice(0, 3)
                            .map((deliverable: any, idx: number) => (
                              <div
                                key={idx}
                                className="bg-slate-200/10 rounded p-2 text-sm"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-yellow-400 font-medium">
                                    {deliverable.platform}
                                  </span>
                                  {idx === 0 &&
                                    stash.deliverables.length > 3 && (
                                      <span className="text-xs text-white/40">
                                        +{stash.deliverables.length - 3} more
                                      </span>
                                    )}
                                </div>
                                <p className="text-white/80 line-clamp-1">
                                  {deliverable.description}
                                </p>
                              </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleLoadStashed(stash.stashId)}
                            className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                              />
                            </svg>
                            Load & Edit
                          </button>
                          <button
                            onClick={() => handleDeleteStashed(stash.stashId)}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded-lg text-sm font-medium transition"
                            title="Delete this stash"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-200/10 flex gap-3">
                <button
                  onClick={() => setShowStashedModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
                >
                  Close
                </button>
                {stashedDeliverables.length > 0 && (
                  <button
                    onClick={handleDeleteAllStashes}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete All
                  </button>
                )}
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
                <h1 className="text-3xl font-bold text-white">
                  Assigned Campaigns
                </h1>
                <p className="text-white mt-1">
                  Manage your assigned campaigns and discover new opportunities.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-white">Total Earnings</div>
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
                          : "bg-slate-200/20 text-white hover:bg-gray-50/10 border border-slate-200/10"
                      }`}
                    >
                      {status.charAt(0).toUpperCase() +
                        status.slice(1).replace("_", " ")}
                    </button>
                  ),
                )}
              </div>

              <div className="flex flex-wrap gap-4">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2 border border-slate-200/10 rounded-lg bg-slate-200/20 text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
                  className="px-4 py-2 border border-slate-200/10 rounded-lg bg-slate-200/20 text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
                <div className="text-2xl font-bold text-white">
                  {filteredCampaigns.length}
                </div>
                <div className="text-white">
                  {filter === "all" ? "Total" : "Filtered"} Campaigns
                </div>
              </div>
              <div className="bg-slate-200/20 border border-slate-200/10 p-6 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-white">
                  {
                    assignedCampaigns.filter(
                      (c: any) =>
                        getInfluencerStatus(c)?.isCompleted === "Completed",
                    ).length
                  }
                </div>
                <div className="text-white">Completed</div>
              </div>
              <div className="bg-slate-200/20 border border-slate-200/10 p-6 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-white">
                  {
                    assignedCampaigns.filter(
                      (c: any) =>
                        getInfluencerStatus(c)?.acceptanceStatus === "pending",
                    ).length
                  }
                </div>
                <div className="text-white">Pending Response</div>
              </div>
              <div className="bg-slate-200/20 border border-slate-200/10 p-6 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-red-600">
                  {assignedCampaigns.filter((c: any) => isOverdue(c)).length}
                </div>
                <div className="text-white">Overdue</div>
              </div>
            </div>

            {filteredCampaigns.length > 0 && (
              <div className="text-sm text-white mb-4">
                Showing {startIndex + 1} -{" "}
                {Math.min(endIndex, filteredCampaigns.length)} of{" "}
                {filteredCampaigns.length} campaigns
              </div>
            )}
          </div>

          <div className="space-y-4 mb-8">
            {paginatedCampaigns.length === 0 ? (
              <div className="bg-slate-200/10 border border-slate-200/10 p-12 rounded-lg shadow-sm text-center">
                <div className="text-white text-lg mb-2">
                  No campaigns found
                </div>
                <p className="text-white mb-6">
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
                            <h3 className="text-xl font-semibold text-white">
                              {campaign.brandName}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                campaign,
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

                          <p className="text-white mb-4">
                            {campaign.platforms.join(", ")} •{" "}
                            {campaign.location}
                            {campaign.additionalLocations &&
                              campaign.additionalLocations.length > 0 &&
                              ` + ${campaign.additionalLocations.length} more`}
                          </p>

                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-white">
                                Followers Range:
                              </span>
                              <div className="text-white">
                                {campaign.followersRange || "Any"}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium text-white">
                                Duration:
                              </span>
                              <div className="text-white">
                                {campaign.postDuration || "N/A"}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium text-white">
                                Due Date:
                              </span>
                              <div
                                className={
                                  dueDateInfo.isOverdue
                                    ? "text-red-600 font-semibold"
                                    : "text-white"
                                }
                              >
                                {dueDateInfo.date}
                                {status?.acceptanceStatus === "accepted" &&
                                  status.isCompleted === "pending" && (
                                    <span
                                      className={`block text-xs ${
                                        dueDateInfo.isOverdue
                                          ? "text-red-600"
                                          : dueDateInfo.daysRemaining <= 2
                                            ? "text-orange-600"
                                            : "text-white"
                                      }`}
                                    >
                                      {dueDateInfo.isOverdue
                                        ? `${Math.abs(
                                            dueDateInfo.daysRemaining,
                                          )} days overdue`
                                        : `${dueDateInfo.daysRemaining} days left`}
                                    </span>
                                  )}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium text-white">
                                Assigned:
                              </span>
                              <div className="text-white">
                                {formatDate(status?.assignedAt)}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 lg:ml-6 mt-4 lg:mt-0">
                          {(() => {
                            const status = getInfluencerStatus(campaign);

                            const hasDeclined =
                              status?.acceptanceStatus === "declined";

                            const baseClasses =
                              "px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-center flex items-center gap-2 justify-center";
                            const statusClasses = hasDeclined
                              ? "bg-gray-100 text-white cursor-not-allowed"
                              : "bg-indigo-50 hover:bg-indigo-100 text-indigo-600";

                            return (
                              <button
                                onClick={() => handleViewCampaign(campaign)}
                                disabled={hasDeclined}
                                className={`${baseClasses} ${statusClasses}`}
                              >
                                <FaEye /> View Job Details
                              </button>
                            );
                          })()}

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
                                      setShowResponseModal2(true);
                                    }}
                                    className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 justify-center"
                                  >
                                    <FaTimes /> Reject
                                  </button>
                                </>
                              )}

                              {status?.acceptanceStatus === "accepted" &&
                                status.isCompleted !== "Completed" && (
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

                              {status?.submittedJobs?.length > 0 && (
                                <button
                                  onClick={() =>
                                    handleViewSubmittedJobsWithReviews(campaign)
                                  }
                                  className="bg-green-50 hover:bg-green-100 text-green-600 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 justify-center"
                                >
                                  <FaEye /> View Submitted (
                                  {status.submittedJobs.length})
                                </button>
                              )}
                            </>
                          )}

                          {activeTab === "history" && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-white text-sm">
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
                <div className="text-sm text-white">
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
                    <FaChevronLeft className="w-4 h-4 text-white" />
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
                              ? "cursor-default text-white"
                              : "border border-gray-300 hover:bg-gray-50 text-white"
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
                    <FaChevronRight className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* Go to page input (optional) */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white">Go to:</span>
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
