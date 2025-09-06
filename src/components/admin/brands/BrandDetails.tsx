import { Trash, Warning } from "phosphor-react";
import React, { useState } from "react";
import { BiX } from "react-icons/bi";
import { useAdminStore, useInitializeAdminData } from "@/stores/adminStore";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/utils/ToastNotification";

interface BrandDetailsProps {
  selectedBrand: {
    _id: string;
    role?: string;
    platforms?: string[];
    brandName?: string;
    email?: string;
    brandPhone?: string;
    influencersMin?: number;
    influencersMax?: number;
    followersRange?: string;
    location?: string;
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
    isValidated?: boolean;
    createdAt?: string;
    updatedAt?: string;
  } | null;
  showDetailsModal: boolean;
  handleCloseModal: () => void;
}

const BrandDetails: React.FC<BrandDetailsProps> = ({
  selectedBrand,
  showDetailsModal,
  handleCloseModal,
}) => {
  const [confirm, setConfirm] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { fetchData } = useInitializeAdminData();
  const deleteBrand = useAdminStore((state) => state.deleteBrand);
  const { showToast } = useToast();

  const handleDelete = async () => {
    if (!selectedBrand) return;

    setIsDeleting(true);
    try {
      await deleteBrand(selectedBrand._id);
      showToast({
        type: "success",
        title: "Successful!",
        message: `${selectedBrand.brandName} has been deleted`,
        duration: 5000,
      });
      fetchData();
    } catch (error) {
      console.error("Failed to delete brand:", error);
      showToast({
        type: "error",
        title: "Sorry!",
        message: `${selectedBrand.brandName} could not be deleted`,
        duration: 5000,
      });
    } finally {
      setIsDeleting(false);
      setConfirm(false);
      handleCloseModal();
    }
  };

  const formatCurrency = (amount?: number): string => {
    if (!amount) return "₦0";
    return `₦${new Intl.NumberFormat("en-NG").format(amount)}`;
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (
    status: boolean | undefined,
    type: "payment" | "validation"
  ) => {
    if (type === "payment") {
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {status ? "Paid" : "Unpaid"}
        </span>
      );
    } else {
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            status
              ? "bg-blue-100 text-blue-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {status ? "Validated" : "Pending Validation"}
        </span>
      );
    }
  };
  if (!showDetailsModal || !selectedBrand) return null;

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
          {/* Header */}
          <div className="sticky top-0 bg-white px-6 py-4 flex justify-between items-center rounded-t-2xl">
            <h3 className="text-xl font-semibold text-gray-900">
              Brand Details
            </h3>
            <button
              onClick={handleCloseModal}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <BiX size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Brand Header Card */}
            <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedBrand.brandName}
              </h2>
              <p className="text-sm text-gray-600">
                {selectedBrand.role || "N/A"}
              </p>
            </div>

            {/* Info Sections */}
            <Section title="Basic Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Info label="Email" value={selectedBrand.email} />
                <Info label="Phone" value={selectedBrand.brandPhone} />
                <Info label="Location" value={selectedBrand.location} />
                <Info
                  label="Additional Locations"
                  value={
                    selectedBrand.additionalLocations?.length
                      ? selectedBrand.additionalLocations.join(", ")
                      : "None"
                  }
                />
              </div>
            </Section>

            <Section title="Campaign Requirements">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Info
                  label="Platforms"
                  value={selectedBrand.platforms?.join(", ")}
                />
                <Info
                  label="Followers Range"
                  value={selectedBrand.followersRange}
                />
                <Info
                  label="Influencers Range"
                  value={
                    selectedBrand.influencersMin && selectedBrand.influencersMax
                      ? `${selectedBrand.influencersMin.toLocaleString()} - ${selectedBrand.influencersMax.toLocaleString()}`
                      : undefined
                  }
                />
                <Info
                  label="Average Influencers"
                  value={selectedBrand.avgInfluencers?.toLocaleString()}
                />
              </div>
            </Section>

            <Section title="Campaign Details">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Info
                  label="Post Frequency"
                  value={selectedBrand.postFrequency}
                />
                <Info
                  label="Post Duration"
                  value={selectedBrand.postDuration}
                />
                <Info label="Total Posts" value={selectedBrand.postCount} />
              </div>
            </Section>

            <Section title="Financial Information">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Info
                  label="Cost per Influencer per Post"
                  value={formatCurrency(selectedBrand.costPerInfluencerPerPost)}
                  strong
                />
                <Info
                  label="Total Base Cost"
                  value={formatCurrency(selectedBrand.totalBaseCost)}
                  strong
                />
                <Info
                  label="Platform Fee"
                  value={formatCurrency(selectedBrand.platformFee)}
                  strong
                />
                <Info
                  label="Total Cost"
                  value={formatCurrency(selectedBrand.totalCost)}
                  strong
                />
              </div>
            </Section>

            <Section title="Timestamps">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Info
                  label="Created Date"
                  value={formatDate(selectedBrand.createdAt)}
                />
                <Info
                  label="Last Updated"
                  value={formatDate(selectedBrand.updatedAt)}
                />
              </div>
            </Section>

            <div className="relative inline-block w-full text-white">
              {confirm && (
                <div
                  className="absolute bottom-full right-0 -translate-x-0 mb-2 
                    bg-white shadow-lg text-black border rounded-md border-slate-200 z-50"
                >
                  <div className="flex flex-col items-center gap-4 p-6">
                    <span className="bg-red-200 p-4 rounded-full">
                      <Warning size={28} className="text-red-600" />
                    </span>
                    <h1 className="text-center text-sm font-medium">
                      Are you sure you want to delete this brand?
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
                  <Trash size={28} />
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
  strong,
}: {
  label: string;
  value?: string | number | null;
  strong?: boolean;
}) => (
  <div className="bg-gray-50 rounded-lg p-3 shadow-sm">
    <p className="text-xs font-medium text-gray-500">{label}</p>
    <p className={`text-gray-900 ${strong ? "font-semibold text-base" : ""}`}>
      {value ?? "N/A"}
    </p>
  </div>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-3">
    <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
    <div className="grid gap-3">{children}</div>
  </div>
);

export default BrandDetails;
