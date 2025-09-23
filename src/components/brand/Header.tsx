"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  BiBell,
  BiLogOut,
  BiMenu,
  BiCheck,
  BiUserCheck,
  BiX,
} from "react-icons/bi";
import { AnimatePresence, motion } from "framer-motion";
import { useAdminStore } from "@/stores/adminStore";
import { useBrandStore } from "@/stores/brandStore";
import Link from "next/link";
import { MdOutlineNotificationsPaused } from "react-icons/md";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useToast } from "@/utils/ToastNotification";

// Type definitions
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
  createdAt?: any;
  updatedAt?: any;
  assignedInfluencers: string[];
}

interface PlatformData {
  followers: string;
  url: string;
  impressions: string;
  proofUrl?: string;
}

interface Influencer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  location: string;
  niches: string[];
  audienceLocation?: string;
  malePercentage?: string;
  femalePercentage?: string;
  audienceProofUrl?: string;

  // Platform data
  instagram?: PlatformData;
  twitter?: PlatformData;
  tiktok?: PlatformData;
  youtube?: PlatformData;
  facebook?: PlatformData;
  linkedin?: PlatformData;
  discord?: PlatformData;
  threads?: PlatformData;
  snapchat?: PlatformData;

  // Calculated earnings
  followerFee?: number;
  impressionFee?: number;
  locationFee?: number;
  nicheFee?: number;
  earningsPerPost?: number;
  earningsPerPostNaira?: number;
  maxMonthlyEarnings?: number;
  maxMonthlyEarningsNaira?: number;
  followersCount?: number;

  // Legacy fields
  amountPerPost?: string;
  amountPerMonth?: string;

  // Metadata
  status: "pending" | "approved" | "rejected";
  emailSent: boolean;
  isValidated: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface Notification {
  id: string;
  type: "approval" | "assignment" | "rejection";
  data: Campaign;
  createdAt: string;
  timestamp: number;
}

interface User {
  data?: {
    token?: string;
  };
}

interface HeaderProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, toggleSidebar }) => {
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [notificationOffset, setNotificationOffset] = useState<number>(0);
  const NOTIFICATIONS_PER_PAGE = 10;

  // Track unseen/seen using timestamps
  const [hasNewNotifications, setHasNewNotifications] =
    useState<boolean>(false);
  const [lastSeen, setLastSeen] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const stored = localStorage.getItem("notif_last_seen");
    return stored ? Number(stored) : 0;
  });

  const [showLogoutPopup, setShowLogoutPopup] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  // Use both stores
  const { influencers } = useAdminStore();
  const { campaigns } = useBrandStore();

  // Router and toast hooks
  const router = useRouter();
  const { showToast } = useToast();

  // Filter campaigns for different notification types
  const approvedCampaigns = campaigns.filter(
    (campaign: Campaign) => campaign.status === "approved"
  );
  const rejectedCampaigns = campaigns.filter(
    (campaign: Campaign) => campaign.status === "rejected"
  );
  const campaignsWithInfluencers = campaigns.filter(
    (campaign: Campaign) =>
      campaign.assignedInfluencers && campaign.assignedInfluencers.length > 0
  );

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const getAuthToken = (): string | null => {
    if (typeof window !== "undefined") {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user: User = JSON.parse(userStr);
          return user?.data?.token || null;
        }
        return null;
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        return null;
      }
    }
    return null;
  };

  const token = getAuthToken();

  const hasNoActivity =
    approvedCampaigns.length === 0 && campaignsWithInfluencers.length === 0;

  // Combine and sort all notifications by creation date
  const allNotifications = useMemo((): Notification[] => {
    const notifications: Notification[] = [];

    // Add approved campaigns notifications
    approvedCampaigns.forEach((campaign: Campaign) => {
      notifications.push({
        id: `approval-${campaign._id}`,
        type: "approval",
        data: campaign,
        createdAt: campaign.updatedAt || campaign.createdAt,
        timestamp: new Date(campaign.updatedAt || campaign.createdAt).getTime(),
      });
    });

    // Add rejected campaigns notifications
    rejectedCampaigns.forEach((campaign: Campaign) => {
      notifications.push({
        id: `rejection-${campaign._id}`,
        type: "rejection",
        data: campaign,
        createdAt: campaign.updatedAt || campaign.createdAt,
        timestamp: new Date(campaign.updatedAt || campaign.createdAt).getTime(),
      });
    });

    // Add influencer assignment notifications
    campaignsWithInfluencers.forEach((campaign: Campaign) => {
      notifications.push({
        id: `assignment-${campaign._id}`,
        type: "assignment",
        data: campaign,
        createdAt: campaign.updatedAt || campaign.createdAt,
        timestamp: new Date(campaign.updatedAt || campaign.createdAt).getTime(),
      });
    });

    // Sort by newest first and remove duplicates
    const uniqueNotifications = notifications.reduce(
      (acc: Notification[], current: Notification) => {
        const existingIndex = acc.findIndex(
          (item: Notification) =>
            item.data._id === current.data._id && item.type === current.type
        );
        if (existingIndex === -1) {
          acc.push(current);
        }
        return acc;
      },
      []
    );

    return uniqueNotifications.sort((a, b) => b.timestamp - a.timestamp);
  }, [approvedCampaigns, campaignsWithInfluencers, rejectedCampaigns]);

  // Get current page of notifications
  const currentNotifications = allNotifications.slice(
    notificationOffset,
    notificationOffset + NOTIFICATIONS_PER_PAGE
  );
  const hasMoreNotifications =
    notificationOffset + NOTIFICATIONS_PER_PAGE < allNotifications.length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async (): Promise<void> => {
    setIsLoggingOut(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer: ${token}`,
          },
        }
      );

      if (res.status === 200) {
        setIsLoggingOut(false);
        localStorage.clear();
        router.push("/");
      }
    } catch (error: any) {
      console.error("could not log out", error.message);
      setIsLoggingOut(false);
      showToast({
        type: "error",
        title: "Sorry!",
        message: `We could not log you out, please try again later.`,
        duration: 5000,
      });
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();

    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

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
  };

  // Compute latest activity timestamp across all sources
  const latestActivityTs = useMemo((): number => {
    const times: number[] = [];
    approvedCampaigns.forEach((c: Campaign) => {
      if (c?.updatedAt || c?.createdAt) {
        times.push(new Date(c.updatedAt || c.createdAt).getTime());
      }
    });
    campaignsWithInfluencers.forEach((c: Campaign) => {
      if (c?.updatedAt || c?.createdAt) {
        times.push(new Date(c.updatedAt || c.createdAt).getTime());
      }
    });

    return times.length ? Math.max(...times) : 0;
  }, [approvedCampaigns, campaignsWithInfluencers]);

  // Only show the dot if there's something newer than the last time the user opened the panel
  useEffect(() => {
    if (latestActivityTs > lastSeen) {
      setHasNewNotifications(true);
    }
  }, [latestActivityTs, lastSeen]);

  const handleNotificationClick = (): void => {
    setShowNotifications((prev) => !prev);

    // Mark as seen when opening the panel and reset offset
    if (!showNotifications) {
      const seen = Date.now();
      setLastSeen(seen);
      setHasNewNotifications(false);
      setNotificationOffset(0); // Reset to show latest notifications
      if (typeof window !== "undefined") {
        localStorage.setItem("notif_last_seen", String(seen));
      }
    }
  };

  const loadPreviousNotifications = (): void => {
    setNotificationOffset((prev) => prev + NOTIFICATIONS_PER_PAGE);
  };

  const renderNotificationItem = (notification: Notification): any | null => {
    switch (notification.type) {
      case "approval":
        return (
          <Link
            href="/brand/campaigns"
            key={notification.id}
            className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg hover:bg-green-100"
          >
            <BiCheck className="text-green-600" size={20} />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Campaign Approved!
              </p>
              <p className="text-xs text-gray-600">
                &quot;{notification.data.brandName}&quot; campaign has been
                approved and is now active
              </p>
              <span className="text-xs text-gray-500">
                {formatDate(notification.createdAt)}
              </span>
            </div>
          </Link>
        );

      case "rejection":
        return (
          <Link
            href="/brand/campaigns"
            key={notification.id}
            className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg hover:bg-green-100"
          >
            <BiCheck className="text-green-600" size={20} />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Campaign Rejected!
              </p>
              <p className="text-xs text-gray-600">
                &quot;{notification.data.brandName}&quot; campaign has been
                rejected. Please contact support for more details
              </p>
              <span className="text-xs text-gray-500">
                {formatDate(notification.createdAt)}
              </span>
            </div>
          </Link>
        );

      case "assignment":
        return (
          <Link
            href="/brand/campaigns"
            key={notification.id}
            className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100"
          >
            <BiUserCheck className="text-blue-600" size={20} />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Influencers Assigned!
              </p>
              <p className="text-xs text-gray-600">
                {notification.data.assignedInfluencers?.length || 0}{" "}
                influencer(s) assigned to &quot;{notification.data.brandName}
                &quot; campaign
              </p>
              <span className="text-xs text-gray-500">
                {formatDate(notification.createdAt)}
              </span>
            </div>
          </Link>
        );

      default:
        return null;
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between relative">
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {sidebarOpen ? <BiX size={20} /> : <BiMenu size={20} />}
        </button>
        <h1 className="text-2xl font-bold lg:hidden block text-gray-900">
          CaringSparks
        </h1>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-4 relative">
        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={handleNotificationClick}
            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <BiBell size={20} />
            {hasNewNotifications && (
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-72 bg-white shadow-lg rounded-lg border border-gray-200 z-50"
              >
                <div className="p-3 bg-slate-200/50 font-semibold text-gray-700 flex items-center justify-between">
                  <span>Notifications</span>
                  {allNotifications.length > 0 && (
                    <span className="text-xs text-gray-500">
                      Showing{" "}
                      {Math.min(
                        notificationOffset + NOTIFICATIONS_PER_PAGE,
                        allNotifications.length
                      )}{" "}
                      of {allNotifications.length}
                    </span>
                  )}
                </div>

                {hasNoActivity ? (
                  <div className="flex flex-col items-center justify-center p-6 text-gray-500">
                    <div className="p-4 rounded-full bg-gray-100 mb-3">
                      <MdOutlineNotificationsPaused className="text-2xl text-gray-400" />
                    </div>
                    <p className="text-lg font-medium">
                      It&apos;s quiet for now
                    </p>
                    <p className="text-sm text-gray-400">
                      Try refreshing or check back later.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-80 overflow-y-auto">
                    <div className="p-3 space-y-3">
                      {currentNotifications.map((notification) =>
                        renderNotificationItem(notification)
                      )}
                    </div>

                    {hasMoreNotifications && (
                      <div className="p-3 pt-0">
                        <button
                          onClick={loadPreviousNotifications}
                          className="w-full py-2 px-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                        >
                          Load Previous (
                          {Math.min(
                            NOTIFICATIONS_PER_PAGE,
                            allNotifications.length -
                              (notificationOffset + NOTIFICATIONS_PER_PAGE)
                          )}
                          )
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Logout */}
        <button
          onClick={() => setShowLogoutPopup(true)}
          className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <BiLogOut size={20} />
        </button>
      </div>

      {/* Logout Confirmation Popup */}
      <AnimatePresence>
        {showLogoutPopup && (
          <motion.div
            key="logout-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center p-8 z-50"
            onClick={() => setShowLogoutPopup(false)}
          >
            <motion.div
              key="logout-modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Confirm Logout
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to logout?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowLogoutPopup(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition"
                >
                  {isLoggingOut ? "Logging Out..." : "Logout"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
