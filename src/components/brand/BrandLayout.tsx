"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useBrandStore } from "@/stores/brandStore";
import { useRouter } from "next/navigation";

interface BrandLayoutProps {
  children: React.ReactNode;
}

const BrandLayout: React.FC<BrandLayoutProps> = ({ children }) => {
  const {
    fetchUser,
    fetchCampaignsByEmail,
    userLoading,
    campaignsLoading,
    userError,
    user,
  } = useBrandStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const router = useRouter();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Fetch user data first
        await fetchUser();

        // If user exists, fetch their campaigns
        if (user?.email) {
          await fetchCampaignsByEmail(user.email);
        }

        setInitialLoadComplete(true);
      } catch (error) {
        console.error("Error initializing brand data:", error);
        setInitialLoadComplete(true);
      }
    };

    initializeData();
  }, [fetchCampaignsByEmail, fetchUser, user?.email]);

  // Show loading state during initial load
  const isLoading = !initialLoadComplete || (userLoading && !user);

  if (isLoading) {
    return (
      <div className="flex justify-center flex-col items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
        <p className="mt-4 text-gray-600 text-lg">Loading Brand data...</p>
      </div>
    );
  }

  // Show error state if user fetch failed
  if (userError && !user) {
    return (
      <div className="flex justify-center flex-col items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Failed to Load Brand Data
          </h2>
          <p className="text-gray-600 mb-4">{userError}</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex w-full">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="w-full lg:ml-64">
          <Header sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

          <main className="min-h-screen">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default BrandLayout;
