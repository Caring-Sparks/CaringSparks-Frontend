"use client";
import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useInfluencerStore } from "@/stores/influencerStore";
import { useRouter } from "next/navigation";
import BankDetailsPopup, { BankDetails } from "./BankDetailsPopup";
import { useToast } from "@/utils/ToastNotification";

interface InfluencerLayoutProps {
  children: React.ReactNode;
}

const InfluencerLayout: React.FC<InfluencerLayoutProps> = ({ children }) => {
  const {
    userLoading,
    fetchCurrentInfluencer,
    user,
    userError,
    fetchAssignedCampaigns,
    updateInfluencerBankDetails,
  } = useInfluencerStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showBankDetailsPopup, setShowBankDetailsPopup] = useState(false);
  const [isBankDetailsSubmitting, setIsBankDetailsSubmitting] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // ⚠️ FIX: Wrap the function in useCallback
  const shouldShowBankDetailsPopup = useCallback(() => {
    if (!user) return false;

    const hasBankDetails =
      user.bankDetails &&
      user.bankDetails.bankName &&
      user.bankDetails.accountNumber &&
      user.bankDetails.accountName;

    const hasFlag = user.hasBankDetails === true;

    const hasSkipped = localStorage.getItem("bankDetailsSkipped");
    const skipDate = localStorage.getItem("bankDetailsSkippedDate");
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    if (hasSkipped && skipDate && new Date(skipDate) < threeDaysAgo) {
      localStorage.removeItem("bankDetailsSkipped");
      localStorage.removeItem("bankDetailsSkippedDate");
    }

    // The logic inside this function uses 'user'
    return !(hasBankDetails || hasFlag) && !hasSkipped;
  }, [user]); // ⚠️ Add 'user' to the dependency array

  // Handle bank details submission using separate endpoint
  const handleBankDetailsSubmit = async (bankDetails: BankDetails) => {
    setIsBankDetailsSubmitting(true);
    try {
      await updateInfluencerBankDetails({
        bankName: bankDetails.bankName,
        accountNumber: bankDetails.accountNumber,
        accountName: bankDetails.accountName,
      });

      localStorage.removeItem("bankDetailsSkipped");
      localStorage.removeItem("bankDetailsSkippedDate");

      setShowBankDetailsPopup(false);

      showToast({
        type: "success",
        title: "Success",
        message: "Bank details updated successfully!.",
        duration: 6000,
      });
    } catch (error) {
      showToast({
        type: "error",
        title: "Error",
        message: "We could not update your bank details. Please try again",
        duration: 6000,
      });
      throw error;
    } finally {
      setIsBankDetailsSubmitting(false);
    }
  };

  // Handle popup close (skip for now)
  const handleBankDetailsClose = () => {
    localStorage.setItem("bankDetailsSkipped", "true");
    localStorage.setItem("bankDetailsSkippedDate", new Date().toISOString());
    setShowBankDetailsPopup(false);
  };

  useEffect(() => {
    fetchCurrentInfluencer();
    fetchAssignedCampaigns();
  }, [fetchAssignedCampaigns, fetchCurrentInfluencer]);

  // Check for bank details popup after user data is loaded
  useEffect(() => {
    if (user && !userLoading) {
      const shouldShow = shouldShowBankDetailsPopup();
      setShowBankDetailsPopup(shouldShow);
    }
  }, [user, userLoading, shouldShowBankDetailsPopup]); // This now works correctly

  if (userLoading) {
    return (
      <div className="flex justify-center flex-col items-center h-screen">
        <div className="loaderr"></div>
        <p className="mt-4">Loading Influencer data...</p>
      </div>
    );
  }

  if (userError && !user) {
    return (
      <div className="flex justify-center flex-col items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Failed to Load Influencer Data
          </h2>
          <p className="text-gray-600 mb-4">{userError}</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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

          <main className="">{children}</main>
        </div>
      </div>

      {/* Bank Details Popup */}
      {user && (
        <BankDetailsPopup
          isOpen={showBankDetailsPopup}
          onClose={handleBankDetailsClose}
          onSubmit={handleBankDetailsSubmit}
          userName={user.name}
          isSubmitting={isBankDetailsSubmitting}
        />
      )}
    </div>
  );
};

export default InfluencerLayout;
