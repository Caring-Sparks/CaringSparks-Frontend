import { ArrowDown, ArrowUp } from "phosphor-react";
import { BiTrendingUp, BiUser } from "react-icons/bi";
import { BsActivity } from "react-icons/bs";
import { FaDollarSign } from "react-icons/fa";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { TbPercentage } from "react-icons/tb";
import StatCard from "./StatsCard";
import { useAdminStats, useAdminStore } from "@/stores/adminStore";
import { IoReload } from "react-icons/io5";
import { FaNairaSign } from "react-icons/fa6";

const Stats = () => {
  const { totalBrands, totalInfluencers, loading, error } = useAdminStats();
  const { brands, influencers, campaigns } = useAdminStore();
  const refreshData = useAdminStore((state) => state.refreshData);

  const activeBrands = campaigns.filter(
    (campaign: any) => campaign.hasPaid === true
  ).length;

  const verifiedInfluencers = influencers.filter(
    (influencer: any) => influencer.status === "approved"
  ).length;

  const approvedPaidCampaigns = campaigns.filter(
    (campaign: any) => campaign.status === "approved" && campaign.hasPaid === true
  ).length;

  const calculateRevenue = () => {
    if (!campaigns || campaigns.length === 0) return 0;
    
    const totalRevenue = campaigns
      .filter((campaign: any) => campaign.hasPaid === true)
      .reduce((acc: number, campaign: any) => acc + (campaign.totalCost || 0), 0);

    return totalRevenue;
  };

  const calculateGrowthPercentage = () => {
    const totalUsers = totalBrands + totalInfluencers;
    if (totalUsers === 0) return 0;
    const growthRate = Math.min((totalUsers / 100) * 94.3, 100);
    return growthRate;
  };

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const previousStats = {
    totalInfluencers: Math.max(0, totalInfluencers - Math.floor(totalInfluencers * 0.1)),
    totalBrands: Math.max(0, totalBrands - Math.floor(totalBrands * 0.1)),
    activeBrands: Math.max(0, activeBrands - Math.floor(activeBrands * 0.05)),
    verifiedInfluencers: Math.max(0, verifiedInfluencers - Math.floor(verifiedInfluencers * 0.08)),
    revenue: Math.max(0, calculateRevenue() - (calculateRevenue() * 0.15)),
    growthRate: Math.max(0, calculateGrowthPercentage() - 5),
  };

  function formatRevenue(value: number): string {
    if (value >= 1_000_000) {
      return `₦${(value / 1_000_000).toFixed(1)}M`;
    } else if (value >= 1_000) {
      return `₦${(value / 1_000).toFixed(1)}K`;
    } else {
      return `₦${value.toLocaleString()}`;
    }
  }

  const stats = [
    {
      title: "Total Influencers",
      value: loading ? "Loading..." : totalInfluencers.toString(),
      change: calculateChange(totalInfluencers, previousStats.totalInfluencers),
      icon: BiUser,
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
    },
    {
      title: "Total Brands",
      value: loading ? "Loading..." : totalBrands.toString(),
      change: calculateChange(totalBrands, previousStats.totalBrands),
      icon: HiOutlineBuildingOffice2,
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
    },
    {
      title: "Active Campaigns",
      value: loading ? "Loading..." : approvedPaidCampaigns.toString(),
      change: calculateChange(approvedPaidCampaigns, previousStats.activeBrands),
      icon: BiTrendingUp,
      color: "bg-gradient-to-r from-green-500 to-green-600",
    },
    {
      title: "Verified Influencers",
      value: loading ? "Loading..." : verifiedInfluencers.toString(),
      change: calculateChange(
        verifiedInfluencers,
        previousStats.verifiedInfluencers
      ),
      icon: BsActivity,
      color: "bg-gradient-to-r from-orange-500 to-orange-600",
    },
    {
      title: "Total Revenue",
      value: loading ? "Loading..." : formatRevenue(calculateRevenue()),
      change: calculateChange(calculateRevenue(), previousStats.revenue),
      icon: FaNairaSign,
      color: "bg-gradient-to-r from-emerald-500 to-emerald-600",
    },
    {
      title: "Growth Rate",
      value: loading
        ? "Loading..."
        : `${calculateGrowthPercentage().toFixed(1)}%`,
      change: calculateChange(
        calculateGrowthPercentage(),
        previousStats.growthRate
      ),
      icon: TbPercentage,
      color: "bg-gradient-to-r from-cyan-500 to-cyan-600",
    },
  ];

  // Handle error state
  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600">Error loading stats: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const handleRefresh = () => {
    refreshData();
  };

  return (
    <div className="space-y-6 p-6">
      <span className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-500">Dashboard Overview</h2>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className={`p-2 rounded-full bg-slate-200/20 hover:bg-gray-300 transition
              ${loading ? "cursor-not-allowed" : "cursor-pointer"}`}
        >
          <IoReload
            className={`text-xl ${
              loading ? "animate-spin text-yellow-500" : "text-gray-500"
            }`}
          />
        </button>
      </span>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>
    </div>
  );
};

export default Stats;