"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Define a type for the performance metrics of a campaign
interface CampaignPerformance {
  clicks: number;
  conversions: number;
  ctr: number;
  roi: number;
}

// Define the main type for a campaign
interface Campaign {
  id: number;
  name: string;
  brand: string;
  status: "active" | "completed" | "draft" | "paused";
  budget: number;
  spent: number;
  reach: number;
  engagement: number;
  influencers: number;
  startDate: string;
  endDate: string;
  platform: string[];
  category: string;
  performance: CampaignPerformance;
}

// Props for the CampaignCard component
interface CampaignCardProps {
  campaign: Campaign;
  onClick: () => void;
}

// Props for the CampaignModal component
interface CampaignModalProps {
  campaign: Campaign;
  onClose: () => void;
}

const CampaignManagement: React.FC = () => {
  // State to manage the selected campaign filter tab, with explicit typing
  const [selectedTab, setSelectedTab] = useState<
    "all" | "active" | "completed" | "paused" | "draft"
  >("all");

  // State for the currently selected campaign to display in the modal
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );

  // Dummy data typed as an array of Campaign objects
  const campaigns: Campaign[] = [
    {
      id: 1,
      name: "Summer Fashion Collection 2025",
      brand: "StyleHub",
      status: "active",
      budget: 25000,
      spent: 18500,
      reach: 2500000,
      engagement: 156000,
      influencers: 12,
      startDate: "2025-08-01",
      endDate: "2025-09-30",
      platform: ["Instagram", "TikTok"],
      category: "Fashion",
      performance: {
        clicks: 45600,
        conversions: 1280,
        ctr: 1.82,
        roi: 340,
      },
    },
    {
      id: 2,
      name: "Tech Gadget Launch",
      brand: "InnovateTech",
      status: "completed",
      budget: 50000,
      spent: 48200,
      reach: 4200000,
      engagement: 320000,
      influencers: 8,
      startDate: "2025-07-15",
      endDate: "2025-08-15",
      platform: ["YouTube", "Twitter"],
      category: "Technology",
      performance: {
        clicks: 89200,
        conversions: 2840,
        ctr: 2.12,
        roi: 425,
      },
    },
    {
      id: 3,
      name: "Wellness & Fitness Challenge",
      brand: "FitLife",
      status: "draft",
      budget: 15000,
      spent: 0,
      reach: 0,
      engagement: 0,
      influencers: 15,
      startDate: "2025-09-01",
      endDate: "2025-10-31",
      platform: ["Instagram", "YouTube"],
      category: "Health & Fitness",
      performance: {
        clicks: 0,
        conversions: 0,
        ctr: 0,
        roi: 0,
      },
    },
    {
      id: 4,
      name: "Beauty Product Reviews",
      brand: "GlowUp Cosmetics",
      status: "paused",
      budget: 30000,
      spent: 12800,
      reach: 1800000,
      engagement: 98000,
      influencers: 20,
      startDate: "2025-08-10",
      endDate: "2025-09-20",
      platform: ["Instagram", "TikTok", "YouTube"],
      category: "Beauty",
      performance: {
        clicks: 32400,
        conversions: 890,
        ctr: 1.8,
        roi: 275,
      },
    },
    {
      id: 5,
      name: "Food & Recipe Content",
      brand: "TasteMakers",
      status: "active",
      budget: 20000,
      spent: 8900,
      reach: 1200000,
      engagement: 145000,
      influencers: 10,
      startDate: "2025-08-20",
      endDate: "2025-10-15",
      platform: ["Instagram", "TikTok"],
      category: "Food & Beverage",
      performance: {
        clicks: 28900,
        conversions: 1150,
        ctr: 2.41,
        roi: 298,
      },
    },
  ];

  // Helper function to get status-based Tailwind classes
  const getStatusColor = (status: Campaign["status"]): string => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter campaigns based on the selected tab
  const filteredCampaigns: Campaign[] =
    selectedTab === "all"
      ? campaigns
      : campaigns.filter((campaign) => campaign.status === selectedTab);

  // Helper function for currency formatting
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Helper function for number formatting
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  // CampaignCard sub-component, now with typed props
  const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, onClick }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {campaign.name}
          </h3>
          <p className="text-sm text-gray-600">{campaign.brand}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
            campaign.status
          )}`}
        >
          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Budget</p>
          <p className="text-sm font-medium">
            {formatCurrency(campaign.budget)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Spent</p>
          <p className="text-sm font-medium">
            {formatCurrency(campaign.spent)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Reach</p>
          <p className="text-sm font-medium">{formatNumber(campaign.reach)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Influencers</p>
          <p className="text-sm font-medium">{campaign.influencers}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {campaign.platform.map((platform, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
          >
            {platform}
          </span>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500">
          {new Date(campaign.startDate).toLocaleDateString()} -{" "}
          {new Date(campaign.endDate).toLocaleDateString()}
        </div>
        <div className="text-xs font-medium text-green-600">
          ROI: {campaign.performance.roi}%
        </div>
      </div>
    </motion.div>
  );

  // CampaignModal sub-component, now with typed props
  const CampaignModal: React.FC<CampaignModalProps> = ({
    campaign,
    onClose,
  }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-200/20 backdrop-blur-md flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {campaign.name}
            </h2>
            <p className="text-gray-600">{campaign.brand}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-1">
              Total Reach
            </h4>
            <p className="text-2xl font-bold text-blue-900">
              {formatNumber(campaign.reach)}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-green-800 mb-1">
              Engagement
            </h4>
            <p className="text-2xl font-bold text-green-900">
              {formatNumber(campaign.engagement)}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-purple-800 mb-1">Clicks</h4>
            <p className="text-2xl font-bold text-purple-900">
              {formatNumber(campaign.performance.clicks)}
            </p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-orange-800 mb-1">
              Conversions
            </h4>
            <p className="text-2xl font-bold text-orange-900">
              {formatNumber(campaign.performance.conversions)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Campaign Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium">{campaign.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                    campaign.status
                  )}`}
                >
                  {campaign.status.charAt(0).toUpperCase() +
                    campaign.status.slice(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">
                  {new Date(campaign.startDate).toLocaleDateString()} -{" "}
                  {new Date(campaign.endDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Platforms:</span>
                <div className="flex gap-1">
                  {campaign.platform.map((platform, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">CTR:</span>
                <span className="font-medium">
                  {campaign.performance.ctr.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ROI:</span>
                <span className="font-medium text-green-600">
                  {campaign.performance.roi}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Budget Utilized:</span>
                <span className="font-medium">
                  {((campaign.spent / campaign.budget) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Engagement Rate:</span>
                <span className="font-medium">
                  {((campaign.engagement / campaign.reach) * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-8 pt-6 border-t">
          <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition">
            Edit Campaign
          </button>
          <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition">
            View Analytics
          </button>
          {campaign.status === "active" && (
            <button className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition">
              Pause Campaign
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Campaign Management
          </h1>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Campaigns</p>
              <p className="text-2xl font-bold text-gray-900">
                {campaigns.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
          <div className="flex items-center mt-3">
            <span className="text-green-600 text-sm font-medium">+12%</span>
            <span className="text-gray-500 text-sm ml-2">vs last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Spend</p>
              <p className="text-2xl font-bold text-gray-900">$186K</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
          </div>
          <div className="flex items-center mt-3">
            <span className="text-green-600 text-sm font-medium">+8%</span>
            <span className="text-gray-500 text-sm ml-2">vs last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Reach</p>
              <p className="text-2xl font-bold text-gray-900">12.4M</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
          </div>
          <div className="flex items-center mt-3">
            <span className="text-green-600 text-sm font-medium">+24%</span>
            <span className="text-gray-500 text-sm ml-2">vs last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg ROI</p>
              <p className="text-2xl font-bold text-gray-900">332%</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <svg
                className="w-6 h-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
          </div>
          <div className="flex items-center mt-3">
            <span className="text-green-600 text-sm font-medium">+18%</span>
            <span className="text-gray-500 text-sm ml-2">vs last month</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 w-fit">
        {[
          { key: "all", label: "All Campaigns" },
          { key: "active", label: "Active" },
          { key: "completed", label: "Completed" },
          { key: "paused", label: "Paused" },
          { key: "draft", label: "Draft" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() =>
              setSelectedTab(tab.key as Campaign["status"] | "all")
            }
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              selectedTab === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
            <span className="ml-2 px-2 py-1 text-xs bg-gray-200 rounded-full">
              {tab.key === "all"
                ? campaigns.length
                : campaigns.filter((c) => c.status === tab.key).length}
            </span>
          </button>
        ))}
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCampaigns.map((campaign) => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            onClick={() => setSelectedCampaign(campaign)}
          />
        ))}
      </div>

      {filteredCampaigns.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No campaigns found
          </h3>
          <p className="text-gray-600">
            No campaigns match the selected filter.
          </p>
        </div>
      )}

      {/* Campaign Detail Modal */}
      <AnimatePresence>
        {selectedCampaign && (
          <CampaignModal
            campaign={selectedCampaign}
            onClose={() => setSelectedCampaign(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CampaignManagement;
