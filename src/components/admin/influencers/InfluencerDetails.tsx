"use client";

import React, { useState } from "react";
import Image from "next/image";
import { BiUserCheck, BiUserX, BiX } from "react-icons/bi";
import { motion, AnimatePresence } from "framer-motion";
import { TbUserCancel } from "react-icons/tb";
import { useAdminStore, useInitializeAdminData } from "@/stores/adminStore";
import { Warning } from "phosphor-react";
import { useToast } from "@/utils/ToastNotification";

interface SocialMedia {
  impressions?: number;
  followers?: number;
  url?: string;
  proofUrl?: string;
}

export interface InfluencerProps {
  id: string;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  location?: string;
  niches?: string[];
  audienceLocation?: string;
  malePercentage?: number;
  femalePercentage?: number;
  audienceProofUrl?: string;
  instagram?: SocialMedia;
  twitter?: SocialMedia;
  tiktok?: SocialMedia;
  youtube?: SocialMedia;
  facebook?: SocialMedia;
  linkedin?: SocialMedia;
  discord?: SocialMedia;
  threads?: SocialMedia;
  snapchat?: SocialMedia;
  followerFee?: number;
  impressionFee?: number;
  locationFee?: number;
  nicheFee?: number;
  earningsPerPost?: number;
  earningsPerPostNaira?: number;
  maxMonthlyEarnings?: number;
  maxMonthlyEarningsNaira?: number;
  followersCount?: number;
  status: string;
  emailSent?: boolean;
  createdAt: string;
  updatedAt?: string;
  category: string;
  joinDate: string;
  avatar?: string;
  [key: string]: any;
}

interface InfluencerDetailsProps {
  selectedInfluencer: InfluencerProps | null;
  showDetailsModal: boolean;
  handleCloseModal: () => void;
}

const getStatusBadge = (status: string) => {
  const statusColors = {
    approved: "bg-green-100 text-green-700 ring-green-200",
    pending: "bg-yellow-100 text-yellow-700 ring-yellow-200",
    rejected: "bg-red-100 text-red-700 ring-red-200",
  };

  const colorClass =
    statusColors[status.toLowerCase() as keyof typeof statusColors] ||
    "bg-gray-100 text-gray-700 ring-gray-200";

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ring-1 ${colorClass}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const SectionCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="bg-gray-50 rounded-xl p-5 shadow-sm border border-gray-100"
  >
    <h4 className="text-base font-semibold text-gray-800 mb-4">{title}</h4>
    <div className="space-y-3">{children}</div>
  </motion.div>
);

const InfluencerDetails: React.FC<InfluencerDetailsProps> = ({
  selectedInfluencer,
  showDetailsModal,
  handleCloseModal,
}) => {
  const [confirm, setConfirm] = useState<boolean>(false);
  const { showToast } = useToast();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [isRejecting, setIsRejecting] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string>("");
  const { fetchData } = useInitializeAdminData();

  const updateInfluencerStatus = useAdminStore(
    (state) => state.updateInfluencerStatus
  );
  const deleteInfluencer = useAdminStore((state) => state.deleteInfluencer);

  const handleDelete = async () => {
    if (!selectedInfluencer) return;
    setIsDeleting(true);
    setActionError("");
    try {
      await deleteInfluencer(selectedInfluencer.id);
      showToast({
        type: "success",
        title: "Successful!",
        message: "The influencer has successfully been deleted.",
        duration: 5000,
      });
      handleCloseModal();
      fetchData();
    } catch (error) {
      console.error("Failed to delete influencer:", error);
      showToast({
        type: "error",
        title: "sorry!",
        message: "There was an error while trying to delete the influencer",
        duration: 5000,
      });
      setActionError("Failed to delete influencer. Please try again.");
    } finally {
      setConfirm(false);
      setIsDeleting(false);
      handleCloseModal();
    }
  };

  const handleStatusApproved = async () => {
    if (!selectedInfluencer) return;
    setIsApproving(true);
    try {
      await updateInfluencerStatus(selectedInfluencer.id, "approved");
      showToast({
        type: "success",
        title: "Successful!",
        message: "The influencer status has been approved.",
        duration: 5000,
      });
      handleCloseModal();
      fetchData();
    } catch (error) {
      console.error("Failed to approve influencer:", error);
      showToast({
        type: "error",
        title: "Sorry!",
        message: "The influencer status could not be updated.",
        duration: 5000,
      });
      setActionError("Failed to approve influencer. Please try again.");
    } finally {
      setIsApproving(false);
    }
  };

  const handleStatusReject = async () => {
    if (!selectedInfluencer) return;
    setIsRejecting(true);
    try {
      await updateInfluencerStatus(selectedInfluencer.id, "rejected");
      showToast({
        type: "success",
        title: "Successful!",
        message: "The influencer status has been rejected.",
        duration: 5000,
      });
      handleCloseModal();
      fetchData();
    } catch (error) {
      console.error("Failed to reject influencer:", error);
      showToast({
        type: "error",
        title: "Sorry!",
        message: "The influencer status could not be updated.",
        duration: 5000,
      });
      setActionError("Failed to reject influencer. Please try again.");
    } finally {
      setIsRejecting(false);
    }
  };

  if (!showDetailsModal || !selectedInfluencer) return null;

  const isLoading = isDeleting || isApproving || isRejecting;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={handleCloseModal}
        className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-xl relative"
        >
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-gray-600 font-medium">
                  {isDeleting && "Deleting influencer..."}
                  {isApproving && "Approving influencer..."}
                  {isRejecting && "Rejecting influencer..."}
                </p>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
            <h3 className="text-xl font-bold text-gray-900">
              Influencer Profile
            </h3>
            <button
              onClick={handleCloseModal}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <BiX size={24} />
            </button>
          </div>

          {/* Error Message */}
          {actionError && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm font-medium">{actionError}</p>
            </div>
          )}

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Grid Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SectionCard title="Basic Information">
                <Info label="Name" value={selectedInfluencer.name} />
                <Info label="Email" value={selectedInfluencer.email} />
                <Info label="Phone" value={selectedInfluencer.phone ?? "N/A"} />
                <Info
                  label="WhatsApp"
                  value={selectedInfluencer.whatsapp ?? "N/A"}
                />
                <Info
                  label="Location"
                  value={selectedInfluencer.location ?? "N/A"}
                />
              </SectionCard>

              <SectionCard title="Audience Information">
                <Info
                  label="Niches"
                  value={selectedInfluencer.niches?.join(", ") ?? "N/A"}
                />
                <Info
                  label="Audience Location"
                  value={selectedInfluencer.audienceLocation ?? "N/A"}
                />
                <Info
                  label="Male %"
                  value={`${selectedInfluencer.malePercentage ?? "N/A"}%`}
                />
                <Info
                  label="Female %"
                  value={`${selectedInfluencer.femalePercentage ?? "N/A"}%`}
                />
              </SectionCard>
            </div>

            {/* Social Media */}
            <SectionCard title="Social Media Platforms">
              {Object.entries(selectedInfluencer).map(([platform, data]) => {
                if (
                  typeof data === "object" &&
                  data !== null &&
                  ("followers" in data ||
                    "url" in data ||
                    "impressions" in data)
                ) {
                  const socialMediaData = data as SocialMedia;
                  return (
                    <div key={platform} className="mb-8">
                      <h1 className="text-lg font-semibold capitalize">
                        {platform}
                      </h1>

                      <div className="grid grid-cols-1 gap-6">
                        <span className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <Info
                            label="Followers"
                            value={socialMediaData.followers ?? "N/A"}
                          />
                          <a target="_blank" href={socialMediaData.url}>
                            <Info
                              label="URL"
                              value={socialMediaData.url ?? "N/A"}
                            />
                          </a>
                          <Info
                            label="Impressions"
                            value={socialMediaData.impressions ?? "N/A"}
                          />
                        </span>

                        {socialMediaData.proofUrl && (
                          <SectionCard title="Audience Proof">
                            <Image
                              src={socialMediaData.proofUrl}
                              alt={`${platform} Audience Proof`}
                              width={800}
                              height={600}
                              className="rounded-xl w-full h-auto"
                            />
                          </SectionCard>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </SectionCard>

            {/* Earnings */}
            <SectionCard title="Earnings Information">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Info
                  label="Follower Fee"
                  value={`$${selectedInfluencer.followerFee ?? 0}`}
                />
                <Info
                  label="Impression Fee"
                  value={`$${selectedInfluencer.impressionFee ?? 0}`}
                />
                <Info
                  label="Location Fee"
                  value={`$${selectedInfluencer.locationFee ?? 0}`}
                />
                <Info
                  label="Niche Fee"
                  value={`$${selectedInfluencer.nicheFee ?? 0}`}
                />
                <Info
                  label="Earnings Per Post"
                  value={`$${selectedInfluencer.earningsPerPost ?? 0}`}
                />
                <Info
                  label="Earnings Per Post (₦)"
                  value={`₦${
                    selectedInfluencer.earningsPerPostNaira?.toLocaleString() ??
                    0
                  }`}
                />
                <Info
                  label="Max Monthly Earnings"
                  value={`$${selectedInfluencer.maxMonthlyEarnings ?? 0}`}
                />
                <Info
                  label="Max Monthly (₦)"
                  value={`₦${
                    selectedInfluencer.maxMonthlyEarningsNaira?.toLocaleString() ??
                    0
                  }`}
                />
              </div>
            </SectionCard>

            {/* Status */}
            <SectionCard title="Status Information">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Info
                  label="Current Status"
                  value={getStatusBadge(selectedInfluencer.status)}
                  raw
                />
                <Info
                  label="Join Date"
                  value={new Date(
                    selectedInfluencer.createdAt
                  ).toLocaleDateString()}
                />
              </div>
            </SectionCard>

            {/* Audience Proof */}
            {selectedInfluencer.audienceProofUrl && (
              <SectionCard title="Audience Proof">
                <Image
                  src={selectedInfluencer.audienceProofUrl}
                  alt="Audience Proof"
                  width={800}
                  height={600}
                  className="rounded-xl border border-gray-200 shadow-sm w-full h-auto"
                />
              </SectionCard>
            )}
          </div>

          {/* Footer actions */}
          <div className="relative grid lg:grid-cols-3 grid-cols-1 gap-2 p-4 text-white font-semibold">
            <button
              onClick={handleStatusApproved}
              disabled={isLoading}
              className="bg-green-500 p-3 rounded-md flex items-center justify-center gap-3 hover:bg-green-700 cursor-pointer transition-all ease-in duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isApproving ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <BiUserCheck size={28} />
              )}
              Approve
            </button>

            <button
              onClick={handleStatusReject}
              disabled={isLoading}
              className="bg-slate-300 p-3 rounded-md flex items-center justify-center gap-3 hover:bg-slate-400 cursor-pointer transition-all ease-in duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRejecting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
              ) : (
                <BiUserX size={28} />
              )}
              Reject
            </button>

            {/* Delete confirmation */}
            <div className="relative inline-block">
              {confirm && (
                <div className="absolute bottom-full left-0 mb-2 bg-white shadow-lg text-black border rounded-md border-slate-200 z-50">
                  <div className="flex flex-col items-center gap-4 p-6">
                    <span className="bg-red-200 p-4 rounded-full">
                      <Warning size={28} className="text-red-600" />
                    </span>
                    <h1 className="text-center text-sm font-medium">
                      Are you sure you want to delete this influencer?
                    </h1>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="px-3 py-1 bg-red-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDeleting ? "Deleting..." : "Yes, delete"}
                      </button>
                      <button
                        onClick={() => setConfirm(false)}
                        disabled={isDeleting}
                        className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        No, cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setConfirm(!confirm)}
                disabled={isLoading}
                className="bg-red-500 w-full p-3 rounded-md flex items-center justify-center gap-3 
                hover:bg-red-700 cursor-pointer transition-all ease-in duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <TbUserCancel size={28} />
                )}
                Delete
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const Info = ({
  label,
  value,
  raw = false,
}: {
  label: string;
  value: React.ReactNode;
  raw?: boolean;
}) => (
  <div>
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <div className="mt-0.5 text-gray-900 text-sm font-semibold">
      {raw ? value : <span>{value}</span>}
    </div>
  </div>
);

export default InfluencerDetails;
