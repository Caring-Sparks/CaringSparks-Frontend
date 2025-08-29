"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useAdminInfluencers,
  useAdminStats,
  useAdminStore,
  useInitializeAdminData,
} from "@/stores/adminStore";
import {
  BiRefresh,
  BiSearch,
  BiUserCheck,
  BiUserX,
  BiCalendar,
  BiX,
} from "react-icons/bi";
import Image from "next/image";
import InfluencerDetails from "./InfluencerDetails";

// Types for processed influencer data
interface SocialMedia {
  impressions?: number;
  followers?: number;
  url?: string;
  proofUrl?: string;
}

interface ProcessedInfluencer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  location?: string;
  niches?: string[];
  audienceLocation?: string;
  malePercentage?: number;
  femalePercentage?: number;
  audienceProofUrl?: string;
  instagram?: SocialMedia;
  twitter?: SocialMedia;
  tiktok?: SocialMedia;
  youtube?: SocialMedia;
  facebook?: SocialMedia;
  linkedin?: SocialMedia;
  discord?: SocialMedia;
  threads?: SocialMedia;
  snapchat?: SocialMedia;
  followerFee?: number;
  impressionFee?: number;
  locationFee?: number;
  nicheFee?: number;
  earningsPerPost?: number;
  earningsPerPostNaira?: number;
  maxMonthlyEarnings?: number;
  maxMonthlyEarningsNaira?: number;
  followersCount?: number;
  status: string;
  emailSent?: boolean;
  createdAt: string;
  updatedAt?: string;
  category: string;
  joinDate: string;
  avatar?: string;
  [key: string]: any;
}

type StatusFilter = "all" | "pending" | "approved" | "rejected";
type DateFilter = "all" | "today" | "week" | "month" | "custom";

interface StatusCounts {
  approved: number;
  pending: number;
  rejected: number;
}

const InfluencersManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [customDateFrom, setCustomDateFrom] = useState<string>("");
  const [customDateTo, setCustomDateTo] = useState<string>("");
  // Remove the local hasInitiallyLoaded state since we're now using the store's hasInitialized
  const [selectedInfluencer, setSelectedInfluencer] =
    useState<ProcessedInfluencer | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);

  // Get data from Zustand store
  const { influencers, updateInfluencer, removeInfluencer } =
    useAdminInfluencers();
  const { loading, refreshing, error, totalInfluencers, hasInitialized } =
    useAdminStats();
  const { fetchData } = useInitializeAdminData();
  const updateInfluencerStatus = useAdminStore(
    (state) => state.updateInfluencerStatus
  );

  // Initialize data on component mount
  useEffect(() => {
    if (!hasInitialized && !loading) {
      fetchData();
    }
  }, [fetchData, hasInitialized, loading]);

  // Extract influencer data from the store format
  const processedInfluencers = useMemo<ProcessedInfluencer[]>(() => {
    return influencers.map((influencer) => ({
      id: influencer._id,
      name: (influencer as any)?.name || "Unknown",
      email: (influencer as any)?.email || "No email",
      phone: (influencer as any)?.phone || "",
      whatsapp: (influencer as any)?.whatsapp || "",
      location: (influencer as any)?.location || "",
      niches: (influencer as any)?.niches || [],
      audienceLocation: (influencer as any)?.audienceLocation || "",
      malePercentage:
        parseFloat((influencer as any)?.malePercentage || "0") || 0,
      femalePercentage:
        parseFloat((influencer as any)?.femalePercentage || "0") || 0,
      audienceProofUrl: (influencer as any)?.audienceProofUrl || "",
      threads: (influencer as any)?.threads || {},
      snapchat: (influencer as any)?.snapchat || {},
      facebook: (influencer as any)?.facebook || {},
      instagram: (influencer as any)?.instagram || {},
      twitter: (influencer as any)?.twitter || {},
      tiktok: (influencer as any)?.tiktok || {},
      youtube: (influencer as any)?.youtube || {},
      linkedin: (influencer as any)?.linkedin || {},
      discord: (influencer as any)?.discord || {},
      followerFee: (influencer as any)?.followerFee || 0,
      impressionFee: (influencer as any)?.impressionFee || 0,
      locationFee: (influencer as any)?.locationFee || 0,
      nicheFee: (influencer as any)?.nicheFee || 0,
      earningsPerPost: (influencer as any)?.earningsPerPost || 0,
      earningsPerPostNaira: (influencer as any)?.earningsPerPostNaira || 0,
      maxMonthlyEarnings: (influencer as any)?.maxMonthlyEarnings || 0,
      maxMonthlyEarningsNaira:
        (influencer as any)?.maxMonthlyEarningsNaira || 0,
      followersCount: (influencer as any)?.followersCount || 0,
      status: (influencer as any)?.status || "pending",
      emailSent: (influencer as any)?.emailSent || false,
      createdAt: (influencer as any)?.createdAt || new Date().toISOString(),
      updatedAt: (influencer as any)?.updatedAt || "",
      category:
        (influencer as any)?.niches?.length > 0
          ? (influencer as any)?.niches.filter(Boolean).join(", ")
          : "Uncategorized",
      joinDate: (influencer as any)?.createdAt || new Date().toISOString(),
      avatar:
        (influencer as any)?.avatar || (influencer as any)?.profilePicture,
      ...(influencer as any),
    }));
  }, [influencers]);

  // Filtered influencers based on search, status, and date
  const filteredInfluencers = useMemo<ProcessedInfluencer[]>(() => {
    // Date filtering logic
    const filterByDate = (date: string): boolean => {
      if (dateFilter === "all") return true;

      const influencerDate = new Date(date);
      const today = new Date();

      switch (dateFilter) {
        case "today":
          return influencerDate.toDateString() === today.toDateString();
        case "week":
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          return influencerDate >= weekAgo;
        case "month":
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          return influencerDate >= monthAgo;
        case "custom":
          if (!customDateFrom || !customDateTo) return true;
          const fromDate = new Date(customDateFrom);
          const toDate = new Date(customDateTo);
          return influencerDate >= fromDate && influencerDate <= toDate;
        default:
          return true;
      }
    };

    return processedInfluencers.filter((influencer) => {
      const matchesSearch =
        influencer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        influencer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        influencer.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || influencer.status === statusFilter;

      const matchesDate = filterByDate(influencer.joinDate);

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [
    processedInfluencers,
    searchTerm,
    statusFilter,
    customDateFrom,
    customDateTo,
    dateFilter,
  ]);

  // Handle row click to show details
  const handleRowClick = (influencer: ProcessedInfluencer): void => {
    setSelectedInfluencer(influencer);
    setShowDetailsModal(true);
  };

  // Handle close modal
  const handleCloseModal = (): void => {
    setShowDetailsModal(false);
    setSelectedInfluencer(null);
  };

  const handleStatusApproved = async (selectedInf: any, newStatus: string) => {
    await updateInfluencerStatus(selectedInf, newStatus);
    fetchData();
  };

  const handleStatusReject = async (selectedInf: any, newStatus: string) => {
    await updateInfluencerStatus(selectedInf, newStatus);
    fetchData();
  };

  // Handle refresh
  const handleRefresh = (): void => {
    fetchData();
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      approved: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
    };

    const statusKey = status?.toLowerCase() || "pending";
    const statusStyle = styles[statusKey] || styles.pending;

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium border ${statusStyle}`}
      >
        {status?.charAt(0).toUpperCase() + status?.slice(1) || "Pending"}
      </span>
    );
  };

  const getInitials = (name: string): string => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "U"
    );
  };

  // Calculate status counts
  const statusCounts = useMemo<StatusCounts>(() => {
    const approved = processedInfluencers.filter(
      (i) => i.status === "approved"
    ).length;
    const pending = processedInfluencers.filter(
      (i) => i.status === "pending"
    ).length;
    const rejected = processedInfluencers.filter(
      (i) => i.status === "rejected"
    ).length;

    return { approved, pending, rejected };
  }, [processedInfluencers]);

  // Show loading only if we haven't initialized AND we're loading
  if (loading && !hasInitialized) {
    return (
      <div className="flex justify-center flex-col items-center h-screen">
        <div className="loaderr"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-red-800 text-sm">
              <strong>Error:</strong> {error}
            </div>
            <button
              onClick={handleRefresh}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Influencers Management
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <BiRefresh
              size={16}
              className={`mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <div className="relative">
            <BiSearch
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search influencers..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setStatusFilter(e.target.value as StatusFilter)
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={dateFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setDateFilter(e.target.value as DateFilter)
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
      </div>

      {/* Custom date range inputs */}
      {dateFilter === "custom" && (
        <div className="flex gap-4 items-center bg-white p-4 rounded-lg border border-gray-200">
          <BiCalendar className="text-gray-400" size={18} />
          <input
            type="date"
            value={customDateFrom}
            onChange={(e) => setCustomDateFrom(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={customDateTo}
            onChange={(e) => setCustomDateTo(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">
            {totalInfluencers}
          </div>
          <div className="text-sm text-gray-500">Total Influencers</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {statusCounts.approved}
          </div>
          <div className="text-sm text-gray-500">Approved</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">
            {statusCounts.pending}
          </div>
          <div className="text-sm text-gray-500">Pending</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-red-600">
            {statusCounts.rejected}
          </div>
          <div className="text-sm text-gray-500">Rejected</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Influencer
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Join Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInfluencers.length > 0 ? (
                filteredInfluencers.map((influencer) => (
                  <tr
                    key={influencer.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleRowClick(influencer)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {influencer.avatar ? (
                          <Image
                            src={influencer.avatar}
                            alt={influencer.name}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                            {getInitials(influencer.name)}
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {influencer.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {influencer.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 max-w-[110px] truncate block">
                        {influencer.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(influencer.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(influencer.joinDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div
                        className="flex space-x-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded-lg transition-colors"
                          title="Approve"
                          onClick={() =>
                            handleStatusApproved(influencer.id, "approved")
                          }
                        >
                          <BiUserCheck size={16} />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Reject"
                          onClick={() =>
                            handleStatusReject(influencer.id, "rejected")
                          }
                        >
                          <BiUserX size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {searchTerm ||
                    statusFilter !== "all" ||
                    dateFilter !== "all"
                      ? "No influencers found matching your criteria."
                      : "No influencers available."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Conditionally rendered */}
      {showDetailsModal && (
        <InfluencerDetails
          selectedInfluencer={selectedInfluencer}
          showDetailsModal={showDetailsModal}
          handleCloseModal={handleCloseModal}
        />
      )}
    </div>
  );
};

export default InfluencersManagement;
