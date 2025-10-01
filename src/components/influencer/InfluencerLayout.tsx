"use client";
import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useInfluencerStore } from "@/stores/influencerStore";
import { useRouter } from "next/navigation";
import PaymentDetailsPopup, { PaymentDetails } from "./BankDetailsPopup";
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
  const [showPaymentDetailsPopup, setShowPaymentDetailsPopup] = useState(false);
  const [isPaymentDetailsSubmitting, setIsPaymentDetailsSubmitting] =
    useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const shouldShowPaymentDetailsPopup = useCallback(() => {
    if (!user) return false;

    // Check for bank details
    const hasBankDetails =
      user.bankDetails &&
      user.bankDetails.bankName &&
      user.bankDetails.accountNumber &&
      user.bankDetails.accountName;

    // Check for crypto details
    const hasCryptoDetails =
      user.cryptoDetails &&
      user.cryptoDetails.walletAddress &&
      user.cryptoDetails.network;

    // Check if either payment method is set up
    const hasPaymentMethod = hasBankDetails || hasCryptoDetails;
    const hasFlag =
      user.hasBankDetails === true || user.hasCryptoDetails === true;

    const hasSkipped = localStorage.getItem("paymentDetailsSkipped");
    const skipDate = localStorage.getItem("paymentDetailsSkippedDate");
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    if (hasSkipped && skipDate && new Date(skipDate) < threeDaysAgo) {
      localStorage.removeItem("paymentDetailsSkipped");
      localStorage.removeItem("paymentDetailsSkippedDate");
    }

    return !(hasPaymentMethod || hasFlag) && !hasSkipped;
  }, [user]);

  // Handle payment details submission
  const handlePaymentDetailsSubmit = async (paymentDetails: PaymentDetails) => {
    setIsPaymentDetailsSubmitting(true);
    try {
      if (paymentDetails.paymentType === "bank" && paymentDetails.bankDetails) {
        // Submit bank details
        await updateInfluencerBankDetails({
          paymentType: "bank",
          bankName: paymentDetails.bankDetails.bankName,
          accountNumber: paymentDetails.bankDetails.accountNumber,
          accountName: paymentDetails.bankDetails.accountName,
        });

        showToast({
          type: "success",
          title: "Success",
          message: "Bank details saved successfully!",
          duration: 6000,
        });
      } else if (
        paymentDetails.paymentType === "crypto" &&
        paymentDetails.cryptoDetails
      ) {
        // Submit crypto details
        await updateInfluencerBankDetails({
          paymentType: "crypto",
          walletAddress: paymentDetails.cryptoDetails.walletAddress,
          network: paymentDetails.cryptoDetails.network,
          walletType: paymentDetails.cryptoDetails.walletType,
        });

        showToast({
          type: "success",
          title: "Success",
          message: "Crypto wallet details saved successfully!",
          duration: 6000,
        });
      }

      localStorage.removeItem("paymentDetailsSkipped");
      localStorage.removeItem("paymentDetailsSkippedDate");

      setShowPaymentDetailsPopup(false);
    } catch (error) {
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to save payment details. Please try again.",
        duration: 6000,
      });
      throw error;
    } finally {
      setIsPaymentDetailsSubmitting(false);
    }
  };

  // Handle popup close (skip for now)
  const handlePaymentDetailsClose = () => {
    localStorage.setItem("paymentDetailsSkipped", "true");
    localStorage.setItem("paymentDetailsSkippedDate", new Date().toISOString());
    setShowPaymentDetailsPopup(false);
  };

  useEffect(() => {
    fetchCurrentInfluencer();
    fetchAssignedCampaigns();
  }, [fetchAssignedCampaigns, fetchCurrentInfluencer]);

  // Check for payment details popup after user data is loaded
  useEffect(() => {
    if (user && !userLoading) {
      const shouldShow = shouldShowPaymentDetailsPopup();
      setShowPaymentDetailsPopup(shouldShow);
    }
  }, [user, userLoading, shouldShowPaymentDetailsPopup]);

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

      {/* Payment Details Popup */}
      {user && (
        <PaymentDetailsPopup
          isOpen={showPaymentDetailsPopup}
          onClose={handlePaymentDetailsClose}
          onSubmit={handlePaymentDetailsSubmit}
          userName={user.name}
          isSubmitting={isPaymentDetailsSubmitting}
        />
      )}
    </div>
  );
};

export default InfluencerLayout;
