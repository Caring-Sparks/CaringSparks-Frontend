"use client";

import { Users, Briefcase, Clock, ArrowClockwise } from "phosphor-react";
import { BiCalendar, BiChart, BiTrendingUp } from "react-icons/bi";
import { MdOutlineNotificationsPaused } from "react-icons/md";
import Link from "next/link";
import { useBrandStore } from "@/stores/brandStore";
import { GiCheckMark } from "react-icons/gi";
import { useEffect, useMemo, useState } from "react";
import { FaNairaSign } from "react-icons/fa6";
import { TbMoneybag } from "react-icons/tb";

interface Campaign {
  _id?: string;
  role: "Brand" | "Business" | "Person" | "Movie" | "Music" | "Other";
  platforms: string[];
  brandName: string;
  email: string;
  brandPhone: string;
  influencersMin: number;
  influencersMax: number;
  followersRange?: string;
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
  status: "approved" | "rejected" | "pending";
  isValidated?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const Overview: React.FC = () => {
  const {
    campaigns,
    user,
    userLoading,
    campaignsLoading,
    userError,
    campaignsError,
    fetchCampaigns,
    fetchCampaignsByEmail,
  } = useBrandStore();

  const [refreshing, setRefreshing] = useState(false);

  const safeCampaigns: Campaign[] = useMemo(() => campaigns || [], [campaigns]);
  const safeUser = user || null;

  const newPayments = useMemo(() => {
    return safeCampaigns.filter((campaign) => campaign.hasPaid === true);
  }, [safeCampaigns]);

  const recentPayments = useMemo(() => {
    return newPayments
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 3);
  }, [newPayments]);

  const recentCampaign = useMemo((): Campaign | undefined => {
    return [...safeCampaigns]
      .sort((a: Campaign, b: Campaign) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
      .at(0);
  }, [safeCampaigns]);

  const campaignStats = useMemo(() => {
    const totalCampaigns = safeCampaigns.length;
    const paidCampaigns = safeCampaigns.filter(
      (c: Campaign) => c.hasPaid
    ).length;
    const unpaidCampaigns = safeCampaigns.filter(
      (c: Campaign) => !c.hasPaid
    ).length;
    const validatedCampaigns = safeCampaigns.filter(
      (c: Campaign) => c.status === "approved"
    ).length;

    const totalSpent: number = safeCampaigns
      .filter((c: Campaign) => c.hasPaid && c.totalCost)
      .reduce((sum: number, c: Campaign) => sum + (c.totalCost || 0), 0);

    const averageCampaignCost: number =
      totalCampaigns > 0
        ? safeCampaigns.reduce(
            (sum: number, c: Campaign) => sum + (c.totalCost || 0),
            0
          ) / totalCampaigns
        : 0;

    return {
      totalCampaigns,
      paidCampaigns,
      unpaidCampaigns,
      validatedCampaigns,
      totalSpent,
      averageCampaignCost,
    };
  }, [safeCampaigns]);

  useEffect(() => {
    if (user?.email && campaigns.length === 0) {
      fetchCampaignsByEmail(user.email);
    }
  }, [user?.email, campaigns.length, fetchCampaignsByEmail]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (user?.email) {
        await fetchCampaignsByEmail(user.email);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "Unknown date";

    try {
      const date = new Date(dateString);
      const now = new Date();

      const diffMs: number = now.getTime() - date.getTime();
      const diffSec: number = Math.floor(diffMs / 1000);
      const diffMin: number = Math.floor(diffSec / 60);
      const diffHour: number = Math.floor(diffMin / 60);
      const diffDay: number = Math.floor(diffHour / 24);

      if (diffSec < 60) {
        return `${diffSec} sec${diffSec !== 1 ? "s" : ""} ago`;
      } else if (diffMin < 60) {
        return `${diffMin} min${diffMin !== 1 ? "s" : ""} ago`;
      } else if (diffHour < 24) {
        return `${diffHour} hour${diffHour !== 1 ? "s" : ""} ago`;
      } else if (diffDay === 1) {
        return `Yesterday at ${date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })}`;
      } else {
        return date.toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      }
    } catch (error) {
      return "Unknown date";
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  // loading state
  if (userLoading || campaignsLoading || refreshing) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent mx-auto mb-4"></div>
          <div className="text-lg text-gray-400">Loading brand data...</div>
        </div>
      </div>
    );
  }

  // error state
  if (userError || campaignsError) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <div className="text-lg text-red-600 mb-4">
            Error: {userError || campaignsError}
          </div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const {
    totalCampaigns,
    paidCampaigns,
    unpaidCampaigns,
    validatedCampaigns,
    totalSpent,
    averageCampaignCost,
  } = campaignStats;

  return (
    <div className="space-y-8 mt-8 p-6">
      {/* Header with user info and refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-500">
            Welcome back{safeUser?.brandName ? `, ${safeUser.brandName}` : ""}!
          </h1>
          <p className="text-gray-500">
            Here&apos;s what&apos;s happening with your campaigns
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="bg-slate-200/20 p-2 text-slate-400 border border-slate-200/10 rounded-full hover:bg-slate-700 transition-colors disabled:opacity-50"
        >
          <ArrowClockwise size={20} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-200/20 rounded-xl shadow-sm border border-gray-200/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">
                Total Campaigns
              </p>
              <p className="text-2xl font-bold text-gray-400">
                {totalCampaigns}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Briefcase size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-slate-200/20 rounded-xl shadow-sm border border-gray-200/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">
                Paid Campaigns
              </p>
              <p className="text-2xl font-bold text-gray-400">
                {paidCampaigns}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <GiCheckMark size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-slate-200/20 rounded-xl shadow-sm border border-gray-200/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">
                Pending Payment
              </p>
              <p className="text-2xl font-bold text-gray-400">
                {unpaidCampaigns}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-slate-200/20 rounded-xl shadow-sm border border-gray-200/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Spent</p>
              <p className="text-2xl font-bold text-gray-400">
                {formatCurrency(totalSpent)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <TbMoneybag size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-slate-200/20 rounded-xl shadow-sm border border-gray-200/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-400">
              Recent Activity
            </h3>
            <Link
              href="/brand/campaigns"
              className="text-sm text-yellow-500 hover:text-yellow-800"
            >
              View all campaigns
            </Link>
          </div>

          {!recentCampaign && recentPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-gray-500 py-12">
              <div className="p-4 rounded-full bg-gradient-to-br from-yellow-100/20 to-yellow-100/20 mb-4">
                <div className="flex items-center space-x-2">
                  <MdOutlineNotificationsPaused className="text-2xl text-yellow-500" />
                  <FaNairaSign className="text-xl text-yellow-500" />
                </div>
              </div>
              <p className="text-lg font-medium text-gray-500 mb-2">
                Get Started with Your First Campaign
              </p>
              <p className="text-sm text-gray-500 text-center max-w-sm mb-6">
                Create campaigns, connect with influencers, and track your
                payments all in one place.
              </p>
              <Link href="/brand/campaigns">
                <button className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-600 text-white rounded-lg hover:from-yellow-700 hover:to-yellow-700 transition-all duration-200 shadow-sm hover:shadow-md">
                  Create Your First Campaign
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentCampaign && (
                <div className="flex items-center space-x-3 p-4 bg-blue-50/10 rounded-lg border border-blue-200/10">
                  <Briefcase className="text-yellow-500" size={24} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-400">
                      Latest Campaign
                    </p>
                    <p className="text-lg font-semibold text-gray-400">
                      {recentCampaign.brandName}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {recentCampaign.role}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          recentCampaign.hasPaid
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {recentCampaign.hasPaid ? "Paid" : "Pending Payment"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-400">
                      {formatCurrency(recentCampaign.totalCost || 0)}
                    </p>
                    <span className="text-xs text-gray-400">
                      {formatDate(recentCampaign.createdAt)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-slate-200/20 rounded-xl shadow-sm border border-gray-200/10 p-6">
          <h3 className="text-lg font-semibold text-gray-400 mb-4">
            Campaign Analytics
          </h3>

          {totalCampaigns === 0 ? (
            <div className="flex flex-col items-center justify-center text-gray-500 py-8">
              <div className="p-4 rounded-full bg-gray-100 mb-3">
                <BiChart className="text-2xl text-gray-400" />
              </div>
              <p className="text-lg font-medium">No data available</p>
              <p className="text-sm text-gray-400">
                Analytics will appear after creating campaigns.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-200/20 border border-slate-200/10 rounded-lg">
                <div className="flex items-center space-x-3">
                  <BiTrendingUp className="text-green-600" size={20} />
                  <span className="text-sm font-medium text-gray-400">
                    Average Campaign Cost
                  </span>
                </div>
                <span className="text-lg font-semibold text-gray-400">
                  {formatCurrency(averageCampaignCost)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-200/20 border border-slate-200/10 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Users className="text-yellow-500" size={20} />
                  <span className="text-sm font-medium text-gray-400">
                    Approved Campaigns
                  </span>
                </div>
                <span className="text-lg font-semibold text-gray-400">
                  {validatedCampaigns}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-200/20 border-slate-200/10 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <BiCalendar className="text-indigo-700" size={20} />
                  <span className="text-sm font-medium text-gray-400">
                    Payment Success Rate
                  </span>
                </div>
                <span className="text-lg font-semibold text-gray-400">
                  {totalCampaigns > 0
                    ? Math.round((paidCampaigns / totalCampaigns) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Overview;
