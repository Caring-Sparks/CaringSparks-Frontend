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
import Link from "next/link";
import { FaDollarSign } from "react-icons/fa";
import { MdOutlineNotificationsPaused } from "react-icons/md";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useToast } from "@/utils/ToastNotification";

interface HeaderProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, toggleSidebar }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationOffset, setNotificationOffset] = useState(0);
  const NOTIFICATIONS_PER_PAGE = 10;
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [lastSeen, setLastSeen] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const stored = localStorage.getItem("notif_last_seen");
    return stored ? Number(stored) : 0;
  });

  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { brands, influencers } = useAdminStore();
  const navigate = useRouter();
  const { showToast } = useToast();

  const newPayments = brands.filter((brand) => brand.hasPaid === true);
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

  const allNotifications = useMemo(() => {
    const notifications: any[] = [];

    // Add influencers
    influencers.forEach((influencer: any) => {
      notifications.push({
        id: influencer.id,
        type: "influencer",
        data: influencer,
        createdAt: influencer.createdAt,
        timestamp: new Date(influencer.createdAt).getTime(),
      });
    });

    // Add brands
    brands.forEach((brand: any) => {
      notifications.push({
        id: brand._id,
        type: "brand",
        data: brand,
        createdAt: brand.createdAt,
        timestamp: new Date(brand.createdAt).getTime(),
      });
    });

    // Add payments
    newPayments.forEach((payment: any) => {
      notifications.push({
        id: payment._id,
        type: "payment",
        data: payment,
        createdAt: payment.createdAt,
        timestamp: new Date(payment.createdAt).getTime(),
      });
    });

    return notifications.sort((a, b) => b.timestamp - a.timestamp);
  }, [influencers, brands, newPayments]);

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
            Authorization: `Bearer: ${token}`,
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

  const latestActivityTs = useMemo(() => {
    const times: number[] = [];

    influencers.forEach((i: any) => {
      if (i?.createdAt) times.push(new Date(i.createdAt).getTime());
    });
    brands.forEach((b: any) => {
      if (b?.createdAt) times.push(new Date(b.createdAt).getTime());
    });
    newPayments.forEach((p: any) => {
      if (p?.createdAt) times.push(new Date(p.createdAt).getTime());
    });

    return times.length ? Math.max(...times) : 0;
  }, [influencers, brands, newPayments]);

  useEffect(() => {
    if (latestActivityTs > lastSeen) {
      setHasNewNotifications(true);
    }
  }, [latestActivityTs, lastSeen]);

  const handleNotificationClick = () => {
    setShowNotifications((prev) => !prev);

    if (!showNotifications) {
      const seen = Date.now();
      setLastSeen(seen);
      setHasNewNotifications(false);
      setNotificationOffset(0);
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
      case "influencer":
        return (
          <Link
            href="/admin/influencers"
            key={notification.id}
            className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100"
          >
            <BiUserCheck className="text-blue-600" size={20} />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                New influencer joined!
              </p>
              <p className="text-xs text-gray-600">
                {notification.data.name} joined as an influencer
              </p>
              <span className="text-xs text-gray-500">
                {formatDate(notification.createdAt)}
              </span>
            </div>
          </Link>
        );

      case "brand":
        return (
          <Link
            href="/admin/brands"
            key={notification.id}
            className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100"
          >
            <BiTrendingUp className="text-purple-600" size={20} />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                New brand registered!
              </p>
              <p className="text-xs text-gray-600">
                {notification.data.brandName} created an account
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
            href="/admin/brands"
            key={notification.id}
            className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg hover:bg-green-100"
          >
            <FaDollarSign className="text-green-600" size={20} />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Campaign payment processed!
              </p>
              <p className="text-xs text-gray-600">
                ${notification.data.totalCost} has been paid for a campaign
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
    <header className="bg-black shadow-sm shadow-slate-200/20 px-6 py-4 flex items-center justify-between relative">
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden text-white p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {sidebarOpen ? <BiX size={20} /> : <BiMenu size={20} />}
        </button>
        <h1 className="text-2xl font-bold lg:hidden block text-white">
          The•PR•God
        </h1>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-4 relative">
        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={handleNotificationClick}
            className="relative p-2 text-gray-600 bg-slate-200/20 border hover:text-blue-500 hover:bg-gray-100 duration-300 ease-in-out rounded-lg transition-colors"
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
                className="absolute right-0 mt-2 w-72 bg-slate-200/20 backdrop-blur-2xl shadow-lg rounded-lg border border-gray-200/10 z-50"
              >
                <div className="p-3 bg-slate-200/10 font-semibold text-gray-400 flex items-center justify-between">
                  <span>Notifications</span>
                  {allNotifications.length > 0 && (
                    <span className="text-xs text-gray-400">
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
                    <div className="p-4 rounded-full bg-gray-100/10 mb-3">
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
          className="p-2 text-gray-600 hover:text-red-600 bg-slate-200/20 border duration-300 ease-in-out hover:bg-gray-100 rounded-lg transition-colors"
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
            className="fixed inset-0 bg-black/40 backdrop-blur-2xl flex items-center justify-center p-8 z-50"
            onClick={() => setShowLogoutPopup(false)}
          >
            <motion.div
              key="logout-modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-200/20 backdrop-blur-2xl border border-slate-200/10 rounded-xl shadow-2xl w-full max-w-sm p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-white mb-4">
                Confirm Logout
              </h2>
              <p className="text-sm text-white mb-6">
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
                  {isLoggingOut ? "..." : "Logout"}
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
