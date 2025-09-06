"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  BiBell,
  BiLogOut,
  BiMenu,
  BiTrendingUp,
  BiUserCheck,
  BiX,
} from "react-icons/bi";
import { AnimatePresence, motion } from "framer-motion";
import { useAdminStore } from "@/stores/adminStore";
import { useBrandStore } from "@/stores/brandStore"; // Import the brand store
import Link from "next/link";
import { MdOutlineNotificationsPaused } from "react-icons/md";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useToast } from "@/utils/ToastNotification";
import { FaNairaSign } from "react-icons/fa6";

interface HeaderProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, toggleSidebar }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationOffset, setNotificationOffset] = useState(0);
  const NOTIFICATIONS_PER_PAGE = 10;

  // NEW: track unseen/seen using timestamps
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [lastSeen, setLastSeen] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const stored = localStorage.getItem("notif_last_seen");
    return stored ? Number(stored) : 0;
  });

  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Use both stores
  const { influencers } = useAdminStore();
  const { campaigns } = useBrandStore(); // Get campaigns from brand store

  const navigate = useRouter();
  const { showToast } = useToast();

  // Filter campaigns that have been paid (these are the "brands" with payments)
  const newPayments = campaigns.filter((campaign) => campaign.hasPaid === true);
  // All campaigns are essentially "brands" since they represent brand registrations/activities
  const brands = campaigns;

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
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
    influencers.length === 0 && brands.length === 0 && newPayments.length === 0;

  // Combine and sort all notifications by creation date
  const allNotifications = useMemo(() => {
    const notifications: any[] = [];

    // Add brands (campaigns)
    brands.forEach((campaign: any) => {
      notifications.push({
        id: campaign._id,
        type: "brand",
        data: campaign,
        createdAt: campaign.createdAt,
        timestamp: new Date(campaign.createdAt).getTime(),
      });
    });

    // Add payments
    newPayments.forEach((payment: any) => {
      notifications.push({
        id: `payment-${payment._id}`, // Unique ID for payments
        type: "payment",
        data: payment,
        createdAt: payment.createdAt,
        timestamp: new Date(payment.createdAt).getTime(),
      });
    });

    // Sort by newest first
    return notifications.sort((a, b) => b.timestamp - a.timestamp);
  }, [brands, newPayments]);

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

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer: ${token}`, // keep as-is if your API expects this
          },
        }
      );

      if (res.status === 200) {
        setIsLoggingOut(false);
        localStorage.clear();
        navigate.push("/");
      }
    } catch (error: any) {
      console.error("could not log out", error.message);
      setIsLoggingOut(false);
      showToast({
        type: "error",
        title: "Sorry!",
        message: `We could not log out out, please try again later.`,
        duration: 5000,
      });
    }
  };

  const formatDate = (dateString: string) => {
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

  // NEW: compute latest activity timestamp across all sources
  const latestActivityTs = useMemo(() => {
    const times: number[] = [];
    brands.forEach((b: any) => {
      if (b?.createdAt) times.push(new Date(b.createdAt).getTime());
    });
    newPayments.forEach((p: any) => {
      if (p?.createdAt) times.push(new Date(p.createdAt).getTime());
    });

    return times.length ? Math.max(...times) : 0;
  }, [brands, newPayments]);

  // NEW: only show the dot if there's something newer than the last time the user opened the panel
  useEffect(() => {
    if (latestActivityTs > lastSeen) {
      setHasNewNotifications(true);
    }
  }, [latestActivityTs, lastSeen]);

  const handleNotificationClick = () => {
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

  const loadPreviousNotifications = () => {
    setNotificationOffset((prev) => prev + NOTIFICATIONS_PER_PAGE);
  };

  const renderNotificationItem = (notification: any) => {
    switch (notification.type) {
      case "brand":
        return (
          <Link
            href="/brand/campaigns"
            key={notification.id}
            className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100"
          >
            <BiTrendingUp className="text-purple-600" size={20} />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                New campaign created!
              </p>
              <p className="text-xs text-gray-600">
                {notification.data.brandName} created a new campaign
              </p>
              <span className="text-xs text-gray-500">
                {formatDate(notification.createdAt)}
              </span>
            </div>
          </Link>
        );

      case "payment":
        return (
          <Link
            href="/brand/campaigns"
            key={notification.id}
            className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg hover:bg-green-100"
          >
            <FaNairaSign className="text-green-600" size={20} />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Campaign payment processed!
              </p>
              <p className="text-xs text-gray-600">
                {notification.data.totalCost} has been paid for &qout;
                {notification.data.brandName}&quot; campaign
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
