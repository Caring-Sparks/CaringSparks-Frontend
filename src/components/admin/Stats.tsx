import { ArrowDown, ArrowUp } from "phosphor-react";
import { BiTrendingUp, BiUser } from "react-icons/bi";
import { BsActivity } from "react-icons/bs";
import { FaDollarSign } from "react-icons/fa";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { TbPercentage } from "react-icons/tb";
import StatCard from "./StatsCard";
import { useAdminStats, useAdminStore } from "@/stores/adminStore";
import { IoReload } from "react-icons/io5";

const Stats = () => {
  const { totalBrands, totalInfluencers, loading, error } = useAdminStats();
  const { brands, influencers } = useAdminStore();
  const refreshData = useAdminStore((state) => state.refreshData);

  const activeBrands = brands.filter(
    (brand: any) => brand.hasPaid === true
  ).length;

  const verifiedInfluencers = influencers.filter(
    (influencer: any) => influencer.status === "approved"
  ).length;

  const calculateRevenue = () => {
    if (!brands || brands.length === 0) return 0;
    const totalRevenue = brands.reduce(
      (acc: number, brand: any) => acc + (brand.totalCost || 0),
      0
    );

    return totalRevenue;
  };

  const calculateGrowthPercentage = () => {
    const totalUsers = totalBrands + totalInfluencers;
    const growthRate = (totalUsers / 100) * 94.3;
    return growthRate;
  };

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const previousStats = {
    totalInfluencers: totalInfluencers,
    totalBrands: totalBrands,
    activeBrands: activeBrands,
    verifiedInfluencers: verifiedInfluencers,
    revenue: 0,
    growthRate: 0,
  };

  function formatRevenue(value: number): string {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`;
    } else if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(1)}K`;
    } else {
      return `$${value.toFixed(0)}`;
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
      title: "Active Brands",
      value: loading ? "Loading..." : activeBrands.toString(),
      change: calculateChange(activeBrands, previousStats.activeBrands),
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
      icon: FaDollarSign,
      color: "bg-gradient-to-r from-emerald-500 to-emerald-600",
    },

    {
      title: "Growth Rate",
      value: loading
        ? "Loading..."
        : `${Math.min(calculateGrowthPercentage(), 100).toFixed(1)}%`,
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
    <div className="space-y-6">
      <span className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className={`p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition
              ${loading ? "cursor-not-allowed" : "cursor-pointer"}`}
        >
          <IoReload
            className={`text-xl ${
              loading ? "animate-spin text-blue-500" : "text-gray-700"
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
