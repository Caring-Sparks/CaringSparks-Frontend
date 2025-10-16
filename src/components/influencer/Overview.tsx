"use client";

import { useInfluencerStore } from "@/stores/influencerStore";
import Link from "next/link";
import {
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  DiscordLogo,
  Eye,
  FacebookLogo,
  Heart,
  InstagramLogo,
  LinkedinLogo,
  SnapchatLogo,
  Star,
  Target,
  TiktokLogo,
  YoutubeLogo,
} from "phosphor-react";
import React, { useState } from "react";
import { BiAward, BiTrendingUp } from "react-icons/bi";
import { BsThreads, BsTwitterX } from "react-icons/bs";
import { FaDollarSign } from "react-icons/fa";
import { FiZap } from "react-icons/fi";

type JobStatus =
  | "pending_approval"
  | "in_progress"
  | "draft_submitted"
  | "completed";

interface SocialStats {
  followers?: any;
  engagement?: any;
  posts?: any;
  impressions?: any;
}

interface SocialPlatform {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  customIcon?: React.ReactNode;
}

type SocialPlatformKey =
  | "instagram"
  | "youtube"
  | "tiktok"
  | "twitter"
  | "facebook"
  | "linkedin"
  | "discord"
  | "threads"
  | "snapchat";

const Overview: React.FC = () => {
  const { user, assignedCampaigns } = useInfluencerStore();

  const socialPlatforms: Record<SocialPlatformKey, SocialPlatform> = {
    instagram: {
      name: "Instagram",
      icon: InstagramLogo,
      color: "text-pink-500",
      bgColor: "bg-pink-500",
    },
    youtube: {
      name: "YouTube",
      icon: YoutubeLogo,
      color: "text-red-500",
      bgColor: "bg-red-500",
    },
    tiktok: {
      name: "TikTok",
      icon: TiktokLogo,
      color: "text-black",
      bgColor: "bg-black",
    },
    twitter: {
      name: "Twitter",
      icon: BsTwitterX,
      color: "text-blue-500",
      bgColor: "bg-blue-500",
    },
    facebook: {
      name: "Facebook",
      icon: FacebookLogo,
      color: "text-blue-600",
      bgColor: "bg-blue-600",
    },
    linkedin: {
      name: "LinkedIn",
      icon: LinkedinLogo,
      color: "text-blue-700",
      bgColor: "bg-blue-700",
    },
    discord: {
      name: "Discord",
      icon: DiscordLogo,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500",
    },
    threads: {
      name: "Threads",
      icon: BsThreads,
      color: "text-gray-800",
      bgColor: "bg-gray-800",
    },
    snapchat: {
      name: "Snapchat",
      icon: SnapchatLogo,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500",
    },
  };

  const socialStats: Record<SocialPlatformKey, SocialStats> = {
    instagram: {
      followers: user?.instagram?.followers,
      engagement: user?.instagram?.impressions,
    },
    youtube: {
      followers: user?.youtube?.followers,
      engagement: user?.youtube?.impressions,
    },
    tiktok: {
      followers: user?.tiktok?.followers,
      engagement: user?.tiktok?.impressions,
    },
    twitter: {
      followers: user?.twitter?.followers,
      engagement: user?.twitter?.impressions,
    },
    facebook: {
      followers: user?.facebook?.followers,
      engagement: user?.facebook?.impressions,
    },
    linkedin: {
      followers: user?.linkedin?.followers,
      engagement: user?.linkedin?.impressions,
    },
    discord: {
      followers: user?.discord?.followers,
      engagement: user?.discord?.impressions,
    },
    threads: {
      followers: user?.threads?.followers,
      engagement: user?.threads?.impressions,
    },
    snapchat: {
      followers: user?.snapchat?.followers,
      engagement: user?.snapchat?.impressions,
    },
  };

  const availablePlatforms: SocialPlatformKey[] = (
    Object.keys(socialPlatforms) as SocialPlatformKey[]
  ).filter(
    (platform) =>
      socialStats[platform] &&
      (socialStats[platform].followers || socialStats[platform].impressions)
  );

  const formatNumber = (num: number | string | undefined): string => {
    if (!num) return "N/A";
    const number = typeof num === "string" ? parseInt(num, 10) : num;
    if (isNaN(number)) return "N/A";

    if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + "M";
    }
    if (number >= 1000) {
      return (number / 1000).toFixed(1) + "K";
    }
    return number.toString();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case "movie":
        return "border-purple-500";
      case "tech":
        return "border-blue-500";
      case "fashion":
        return "border-pink-500";
      case "food":
        return "border-orange-500";
      default:
        return "border-gray-500";
    }
  };

  const getDaysUntilDeadline = (createdAt: string, postFrequency: string) => {
    const created = new Date(createdAt);
    const weekMatch = postFrequency.match(/(?:for\s+)?(\d+)\s+weeks?/i);
    const monthMatch = postFrequency.match(/(?:for\s+)?(\d+)\s+months?/i);
    const dayMatch = postFrequency.match(/(?:for\s+)?(\d+)\s+days?/i);

    let durationInDays = 7;

    if (weekMatch) {
      durationInDays = parseInt(weekMatch[1]) * 7;
    } else if (monthMatch) {
      durationInDays = parseInt(monthMatch[1]) * 30;
    } else if (dayMatch) {
      durationInDays = parseInt(dayMatch[1]);
    } else {
      console.log("No match found, using default 7 days");
    }

    const deadline = new Date(created);
    deadline.setDate(deadline.getDate() + durationInDays);

    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      deadline,
      daysRemaining: diffDays,
      totalDuration: durationInDays,
    };
  };

  const getUpcomingDeadlines = () => {
    const deadlinesWithCampaigns = assignedCampaigns
      .map((campaign) => {
        const { deadline, daysRemaining } = getDaysUntilDeadline(
          campaign.createdAt,
          campaign.postFrequency
        );

        return {
          campaign,
          deadline,
          daysRemaining,
          isOverdue: daysRemaining < 0,
          urgency:
            daysRemaining <= 0
              ? "critical"
              : daysRemaining === 1
              ? "urgent"
              : daysRemaining <= 3
              ? "warning"
              : "normal",
        };
      })
      .filter((item) => item.daysRemaining <= 7)
      .sort((a, b) => a.daysRemaining - b.daysRemaining);

    return deadlinesWithCampaigns.slice(0, 3);
  };

  const getUrgencyStyles = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          dot: "bg-red-500",
          text: "text-red-700",
        };
      case "urgent":
        return {
          bg: "bg-orange-50",
          border: "border-orange-200",
          dot: "bg-orange-500",
          text: "text-orange-700",
        };
      case "warning":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          dot: "bg-yellow-500",
          text: "text-yellow-700",
        };
      default:
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          dot: "bg-green-500",
          text: "text-green-700",
        };
    }
  };

  const getTimeLabel = (daysRemaining: number) => {
    if (daysRemaining < 0) {
      return `${Math.abs(daysRemaining)} day${
        Math.abs(daysRemaining) === 1 ? "" : "s"
      } overdue`;
    } else if (daysRemaining === 0) {
      return "Due today";
    } else if (daysRemaining === 1) {
      return "Tomorrow";
    } else {
      return `In ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}`;
    }
  };

  const getRecentNotifications = () => {
    const notifications: Array<{
      id: string;
      type: "assignment" | "approval" | "rejection" | "deadline";
      title: string;
      message: string;
      timestamp: Date;
      campaign: any;
      icon: React.ComponentType<{ className?: string }>;
      bgColor: string;
      iconColor: string;
    }> = [];

    assignedCampaigns.forEach((campaign) => {
      notifications.push({
        id: `assignment-${campaign._id}`,
        type: "assignment",
        title: "New job assigned",
        message: `${campaign.brandName} campaign has been assigned to you`,
        timestamp: new Date(campaign.createdAt),
        campaign,
        icon: FiZap,
        bgColor: "bg-blue-50",
        iconColor: "text-blue-500",
      });

      if (campaign.status === "approved") {
        notifications.push({
          id: `approval-${campaign._id}`,
          type: "approval",
          title: "Task Accepted!",
          message: `The campaign for ${campaign.brandName} has been accepted and is now being tracked`,
          timestamp: new Date(campaign.updatedAt || campaign.createdAt),
          campaign,
          icon: CheckCircle,
          bgColor: "bg-green-50",
          iconColor: "text-green-500",
        });
      } else if (campaign.status === "rejected") {
        notifications.push({
          id: `rejection-${campaign._id}`,
          type: "rejection",
          title: "Campaign needs revision",
          message: `Your ${campaign.brandName} campaign requires changes`,
          timestamp: new Date(campaign.updatedAt || campaign.createdAt),
          campaign,
          icon: Clock,
          bgColor: "bg-red-50",
          iconColor: "text-red-500",
        });
      }

      const { daysRemaining } = getDaysUntilDeadline(
        campaign.createdAt,
        campaign.postFrequency
      );

      if (daysRemaining <= 3 && daysRemaining >= 0) {
        notifications.push({
          id: `deadline-${campaign._id}`,
          type: "deadline",
          title: "Deadline reminder",
          message: `${campaign.brandName} campaign due ${
            daysRemaining === 0
              ? "today"
              : daysRemaining === 1
              ? "tomorrow"
              : `in ${daysRemaining} days`
          }`,
          timestamp: new Date(),
          campaign,
          icon: Clock,
          bgColor: "bg-yellow-50",
          iconColor: "text-yellow-500",
        });
      }
    });

    return notifications
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 3);
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - timestamp.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return timestamp.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl px-6 pt-8">
        <h1 className="text-2xl font-bold text-gray-400">
          {user ? `Welcome Back, ${user.name}!` : `Welcome Back, user!`}
        </h1>
        <p className="text-gray-500">
          Here&apos;s your information at a glance.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-200/20 rounded-xl shadow-sm p-6 border border-slate-200/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Jobs</p>
                <p className="text-3xl font-bold text-gray-500">
                  {assignedCampaigns.length}
                </p>
                <p className="text-sm text-green-600">All campaigns</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-slate-200/20 rounded-xl shadow-sm p-6 border border-slate-200/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Earnings Per Post
                </p>
                <p className="text-3xl font-bold text-gray-500">
                  ₦{user?.earningsPerPostNaira?.toLocaleString() || "0"}
                </p>
                <p className="text-sm text-gray-600">
                  ${user?.earningsPerPost || 0} USD
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FaDollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-slate-200/20 rounded-xl shadow-sm p-6 border border-slate-200/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Max Monthly Earnings
                </p>
                <p className="text-3xl font-bold text-gray-500">
                  ₦{user?.maxMonthlyEarningsNaira?.toLocaleString() || "0"}
                </p>
                <p className="text-sm text-gray-600">
                  ${user?.maxMonthlyEarnings || 0} USD
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-slate-200/20 rounded-xl shadow-sm p-6 border border-slate-200/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Account Status
                </p>
                <p className="text-2xl font-bold text-gray-500 capitalize">
                  {user?.status || "Pending"}
                </p>
                <p className="text-sm text-green-600">Profile verified</p>
              </div>
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Jobs */}
          <div className="lg:col-span-2">
            <div className="bg-slate-200/20 rounded-xl shadow-sm border border-slate-200/10">
              <div className="p-6 border-b border-slate-200/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-500">
                    Assigned Campaigns
                  </h2>
                  <span className="bg-yellow-100 text-yellow-500 px-3 py-1 rounded-full text-sm font-medium">
                    {assignedCampaigns.length} Active
                  </span>
                </div>
              </div>
              <div className="p-6">
                <Link href="/influencer/jobs">
                  <div className="space-y-4">
                    {assignedCampaigns.length > 0 ? (
                      assignedCampaigns
                        .sort(
                          (a, b) =>
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime()
                        )
                        .slice(0, 2)
                        .map((campaign) => {
                          const { deadline, daysRemaining } =
                            getDaysUntilDeadline(
                              campaign.createdAt,
                              campaign.postFrequency
                            );

                          return (
                            <div
                              key={campaign._id}
                              className={`bg-slate-200/20 rounded-lg p-4 border-l-4 ${getPriorityColor(
                                campaign.role
                              )}`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <h3 className="font-semibold text-gray-300">
                                      {campaign.brandName}
                                    </h3>
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                        campaign.status
                                      )}`}
                                    >
                                      {campaign.status.charAt(0).toUpperCase() +
                                        campaign.status.slice(1)}
                                    </span>
                                    {campaign.hasPaid && (
                                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                        Paid
                                      </span>
                                    )}
                                  </div>

                                  <div className="mb-2">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      {campaign.role}
                                    </span>
                                  </div>

                                  <p className="text-gray-300 text-sm mb-2">
                                    <strong>Platforms:</strong>{" "}
                                    {campaign.platforms.join(", ")}
                                  </p>

                                  <p className="text-gray-300 text-sm mb-3">
                                    <strong>Frequency:</strong>{" "}
                                    {campaign.postFrequency}
                                  </p>

                                  <p className="text-gray-300 text-sm mb-3">
                                    <strong>Location:</strong>{" "}
                                    {campaign.location} •{" "}
                                    <strong>Audience:</strong>{" "}
                                    {campaign.followersRange}
                                  </p>

                                  <div className="flex items-center space-x-4 text-sm text-gray-300">
                                    <div className="flex items-center space-x-1">
                                      <Calendar className="w-4 h-4" />
                                      <span>
                                        Due: {deadline.toLocaleDateString()}
                                        {daysRemaining > 0 ? (
                                          <span className="text-green-600 ml-1">
                                            ({daysRemaining} days left)
                                          </span>
                                        ) : daysRemaining === 0 ? (
                                          <span className="text-orange-600 ml-1">
                                            (Due today)
                                          </span>
                                        ) : (
                                          <span className="text-red-600 ml-1">
                                            ({Math.abs(daysRemaining)} days
                                            overdue)
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <FaDollarSign className="w-4 h-4" />
                                      <span>
                                        ₦
                                        {campaign.costPerInfluencerPerPost?.toLocaleString()}
                                        /post
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <span className="font-medium">
                                        {campaign.postCount} posts total
                                      </span>
                                    </div>
                                  </div>

                                  {campaign.assignedInfluencers &&
                                    campaign.assignedInfluencers.length > 1 && (
                                      <div className="mt-2 text-xs text-gray-500">
                                        <strong>Team:</strong>{" "}
                                        {campaign.assignedInfluencers.length}{" "}
                                        influencers assigned
                                      </div>
                                    )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>No assigned campaigns yet</p>
                        <p className="text-sm">
                          Check back later for new opportunities
                        </p>
                      </div>
                    )}

                    {assignedCampaigns.length > 2 && (
                      <div className="pt-4 border-t border-gray-200">
                        <Link href="/influencer/jobs">
                          <button className="w-full text-center text-yellow-600 hover:text-yellow-700 font-medium py-2 hover:bg-yellow-50 rounded-lg transition-colors">
                            View All {assignedCampaigns.length} Campaigns →
                          </button>
                        </Link>
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Social Media Stats */}
            <div className="bg-slate-200/20 rounded-xl shadow-sm border border-slate-200/10 p-6">
              <h3 className="text-lg font-semibold text-gray-500 mb-4">
                Social Media Overview
              </h3>
              <div className="space-y-4">
                {availablePlatforms.length > 0 ? (
                  availablePlatforms.map((platformKey) => {
                    const platform = socialPlatforms[platformKey];
                    const stats = socialStats[platformKey];
                    const IconComponent = platform.icon;

                    return (
                      <div
                        key={platformKey}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          {platform.customIcon ? (
                            platform.customIcon
                          ) : IconComponent ? (
                            <IconComponent
                              className={`w-5 h-5 ${platform.color}`}
                            />
                          ) : (
                            <div
                              className={`w-5 h-5 ${platform.bgColor} rounded-sm flex items-center justify-center`}
                            >
                              <span className="text-white text-xs font-bold">
                                {platform.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <span className="font-medium text-gray-400">
                            {platform.name}
                          </span>
                        </div>
                        <div className="text-right text-gray-400">
                          <p className="font-semibold">
                            {formatNumber(stats.followers)}
                          </p>
                          <p className="text-sm text-gray-400">
                            {stats.impressions
                              ? `${formatNumber(stats.impressions)} imp.`
                              : stats.engagement
                              ? `${stats.engagement}% eng.`
                              : "No data"}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      No social media platforms connected
                    </p>
                    <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Connect Your Platforms
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Notifications */}
            <div className="bg-slate-200/20 rounded-xl shadow-sm border border-slate-200/10 p-6">
              <h3 className="text-lg font-semibold text-gray-500 mb-4">
                Recent Notifications
              </h3>

              {(() => {
                const recentNotifications = getRecentNotifications();

                if (recentNotifications.length === 0) {
                  return (
                    <div className="text-center py-8 text-gray-500">
                      <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p>No recent notifications</p>
                      <p className="text-sm">You&apos;re all caught up!</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {recentNotifications.map((notification) => {
                      const IconComponent = notification.icon;

                      return (
                        <div
                          key={notification.id}
                          className={`flex items-start space-x-3 p-3 ${notification.bgColor} rounded-lg hover:shadow-sm transition-shadow cursor-pointer`}
                        >
                          <IconComponent
                            className={`w-5 h-5 ${notification.iconColor} mt-0.5 flex-shrink-0`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                              </div>
                              <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                {getTimeAgo(notification.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="mt-8 bg-slate-200/20 rounded-xl shadow-sm border border-slate-200/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-500">
              Upcoming Deadlines
            </h3>
            <Link href="/influencer/jobs">
              <button className="txt hover:text-yellow-700 font-medium">
                View All Campaigns
              </button>
            </Link>
          </div>

          {(() => {
            const upcomingDeadlines = getUpcomingDeadlines();

            if (upcomingDeadlines.length === 0) {
              return (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p>No upcoming deadlines in the next 7 days</p>
                  <p className="text-sm">You&apos;re all caught up!</p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {upcomingDeadlines.map((item, index) => {
                  const styles = getUrgencyStyles(item.urgency);
                  const timeLabel = getTimeLabel(item.daysRemaining);

                  return (
                    <div
                      key={item.campaign._id}
                      className={`${styles.bg} border ${styles.border} rounded-lg p-4 transition-all hover:shadow-md`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <div
                          className={`w-2 h-2 ${styles.dot} rounded-full`}
                        ></div>
                        <span className={`text-sm font-medium ${styles.text}`}>
                          {timeLabel}
                        </span>
                      </div>
                      <p className="font-semibold text-gray-400 mb-1">
                        {item.campaign.brandName}
                      </p>
                      <p className="text-sm text-gray-500 mb-2">
                        {item.campaign.role} Campaign
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{item.campaign.platforms.join(", ")}</span>
                        <span>{item.campaign.postCount} posts</span>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Due: {item.deadline.toLocaleDateString()}
                      </div>
                    </div>
                  );
                })}

                {Array.from({
                  length: Math.max(0, 3 - upcomingDeadlines.length),
                }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="bg-slate-200/20 border border-slate-200/10 rounded-lg p-4 opacity-50"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-slate-200/10 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-500">
                        No deadline
                      </span>
                    </div>
                    <p className="font-semibold text-gray-500 mb-1">
                      Available slot
                    </p>
                    <p className="text-sm text-gray-500">
                      Ready for new campaigns
                    </p>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default Overview;
