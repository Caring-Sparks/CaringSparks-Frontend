"use client";

import { useState, useEffect } from "react";
import { useInfluencerStore } from "@/stores/influencerStore";
import {
  User,
  Phone,
  Eye,
  EyeSlash,
  Check,
  X,
  PencilSimple,
  FloppyDisk,
  Shield,
  CreditCard,
  Bell,
  Trash,
  MapPin,
  Calendar,
  Globe,
  Users,
  Star,
  Clock,
} from "phosphor-react";
import { BiBuilding, BiTrendingUp } from "react-icons/bi";
import { CgMail } from "react-icons/cg";
import { useToast } from "@/utils/ToastNotification";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

interface AccountFormData {
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  location: string;
  niches: string[];
  audienceLocation?: string;
  // Bank Details
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  newCampaignAlerts: boolean;
  paymentUpdates: boolean;
  marketingEmails: boolean;
}

const Account: React.FC = () => {
  const {
    user,
    assignedCampaigns,
    userLoading,
    userError,
    fetchCurrentInfluencer,
    fetchAssignedCampaigns,
    updateInfluencerProfile,
    updateInfluencerBankDetails,
    fetchInfluencerBankDetails,
    clearErrors,
    clearUser,
  } = useInfluencerStore();

  const [activeTab, setActiveTab] = useState<
    "profile" | "banking" | "security" | "analytics"
  >("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { showToast } = useToast();

  const [formData, setFormData] = useState<AccountFormData>({
    name: "",
    email: "",
    phone: "",
    whatsapp: "",
    location: "",
    niches: [],
    audienceLocation: "",
    bankName: "",
    accountNumber: "",
    accountName: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: false,
    newCampaignAlerts: true,
    paymentUpdates: true,
    marketingEmails: false,
  });

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        whatsapp: user.whatsapp || "",
        location: user.location || "",
        niches: user.niches || [],
        audienceLocation: user.audienceLocation || "",
        bankName: user.bankDetails?.bankName || "",
        accountNumber: user.bankDetails?.accountNumber || "",
        accountName: user.bankDetails?.accountName || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      fetchAssignedCampaigns();
    }
  }, [user, fetchAssignedCampaigns]);

  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "niches") {
      // Handle niches as comma-separated values
      setFormData((prev) => ({
        ...prev,
        niches: value
          .split(",")
          .map((niche) => niche.trim())
          .filter(Boolean),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleBankDetailsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await updateInfluencerBankDetails({
        bankName: formData.bankName || "",
        accountNumber: formData.accountNumber || "",
        accountName: formData.accountName || "",
      });

      setSuccessMessage("Bank details updated successfully!");
      showToast({
        type: "success",
        title: "Success!",
        message: "Bank details updated successfully!",
        duration: 6000,
      });
      await fetchCurrentInfluencer();
      setIsEditing(false);
    } catch (error: any) {
      setErrorMessage(
        error.message || "Failed to update bank details. Please try again."
      );
      showToast({
        type: "error",
        title: "Sorry!",
        message: "Failed to update bank details. Please try again.",
        duration: 6000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await updateInfluencerProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        location: formData.location,
        niches: formData.niches,
        audienceLocation: formData.audienceLocation,
      });

      setSuccessMessage("Profile updated successfully!");
      showToast({
        type: "success",
        title: "Success!",
        message: "Profile updated successfully!",
        duration: 6000,
      });
      await fetchCurrentInfluencer();
      setIsEditing(false);
    } catch (error: any) {
      setErrorMessage(
        error.message || "Failed to update profile. Please try again."
      );
      showToast({
        type: "error",
        title: "Sorry!",
        message: "Failed to update profile. Please try again.",
        duration: 6000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMessage("New passwords do not match.");
      return;
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      setErrorMessage("New password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const token = localStorage.getItem("user");
      let authToken = null;

      if (token) {
        try {
          const user = JSON.parse(token);
          authToken = user?.data?.token || user?.token;
        } catch (err) {
          console.error("Error parsing user token:", err);
        }
      }

      if (!authToken) {
        setErrorMessage("No authentication token found. Please login again.");
        return;
      }

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/api/auth/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to change password");
      }

      setSuccessMessage("Password changed successfully!");
      showToast({
        type: "success",
        title: "Success!",
        message: (
          <>
            Password changed successfully! Please{" "}
            <Link href="/" className="text-blue-600 underline">
              login again
            </Link>{" "}
            with your new password to prevent disruptions.
          </>
        ),
        duration: 12000,
      });
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error: any) {
      setErrorMessage(
        error.message ||
          "Failed to change password. Please check your current password and try again."
      );

      showToast({
        type: "error",
        title: "Sorry!",
        message:
          "Failed to change password. Please check your current password and try again.",
        duration: 6000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccountDeletion = async () => {
    try {
      const token = localStorage.getItem("user");
      let authToken = null;

      if (token) {
        try {
          const user = JSON.parse(token);
          authToken = user?.data?.token || user?.token;
        } catch (err) {
          console.error("Error parsing user token:", err);
        }
      }

      if (!authToken) {
        setErrorMessage("No authentication token found. Please login again.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/api/auth/delete-account`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete account");
      }
      clearUser();
      localStorage.clear();
      window.location.href = "/";
    } catch (error: any) {
      setErrorMessage(
        error.message || "Failed to delete account. Please try again."
      );
      showToast({
        type: "error",
        title: "Sorry!",
        message: "Failed to delete account. Please try again.",
        duration: 6000,
      });
      setLoading(false);
    }
  };

  const calculateAccountStats = () => {
    const totalCampaigns = assignedCampaigns.length;
    const completedCampaigns = assignedCampaigns.filter(
      (c) => c.status === "approved"
    ).length;
    const activeCampaigns = assignedCampaigns.filter(
      (c: any) => c.status === "active" || c.status === "pending"
    ).length;
    const totalEarnings = user?.maxMonthlyEarningsNaira || 0;
    const successRate =
      totalCampaigns > 0
        ? Math.round((completedCampaigns / totalCampaigns) * 100)
        : 0;

    return {
      totalCampaigns,
      completedCampaigns,
      activeCampaigns,
      totalEarnings,
      successRate,
    };
  };

  const {
    totalCampaigns,
    completedCampaigns,
    activeCampaigns,
    totalEarnings,
    successRate,
  } = calculateAccountStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            key="delete-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center p-8 z-50"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              key="delete-modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Delete Account
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to permanently delete your account? This
                action cannot be undone and will remove all your data,
                campaigns, and earnings history.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAccountDeletion}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition"
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Account Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your influencer profile and preferences
            </p>
          </div>

          {/* Status Messages */}
          {userError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-red-700">{userError}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-green-700">{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-red-700">{errorMessage}</span>
            </div>
          )}

          {/* Enhanced Account Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-8 mb-6">
              <div className="flex items-center space-x-6 mb-6 lg:mb-0">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <User className="text-white" size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {user?.name || "Influencer Account"}
                  </h2>
                  <div className="flex items-center space-x-2 text-gray-600 mb-2">
                    <CgMail size={16} />
                    <span>{user?.email}</span>
                  </div>
                  {user?.location && (
                    <div className="flex items-center space-x-2 text-gray-600 mb-2">
                      <MapPin size={16} />
                      <span>{user.location}</span>
                    </div>
                  )}
                  {user?.createdAt && (
                    <div className="flex items-center space-x-2 text-gray-500 text-sm">
                      <Calendar size={16} />
                      <span>Member since {formatDate(user.createdAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-4">
                  {user?.niches?.map((niche, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full font-medium"
                    >
                      {niche}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {totalCampaigns}
                </div>
                <div className="text-gray-600 text-sm">Total Campaigns</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {completedCampaigns}
                </div>
                <div className="text-gray-600 text-sm">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {activeCampaigns}
                </div>
                <div className="text-gray-600 text-sm">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {formatCurrency(totalEarnings)}
                </div>
                <div className="text-gray-600 text-sm">Est. Monthly</div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex overflow-x-auto no-scrollbar">
                {[
                  { key: "profile", label: "Profile Details", icon: User },
                  { key: "banking", label: "Bank Details", icon: CreditCard },
                  { key: "security", label: "Security", icon: Shield },
                  // { key: "analytics", label: "Analytics", icon: BiTrendingUp },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as typeof activeTab)}
                    className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                      activeTab === key
                        ? "border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-8">
              {/* Enhanced Profile Tab */}
              {activeTab === "profile" && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        Profile Information
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        Update your personal information and professional
                        details
                      </p>
                    </div>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        isEditing
                          ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          : "bg-indigo-600 text-white hover:bg-indigo-700"
                      }`}
                    >
                      <PencilSimple size={16} />
                      <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
                    </button>
                  </div>

                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="font-medium text-gray-900 mb-4">
                        Basic Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name *
                          </label>
                          <div className="relative">
                            <User
                              className="absolute left-3 top-3 text-gray-400"
                              size={18}
                            />
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              required
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address *
                          </label>
                          <div className="relative">
                            <CgMail
                              className="absolute left-3 top-3 text-gray-400"
                              size={18}
                            />
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              required
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <div className="relative">
                            <Phone
                              className="absolute left-3 top-3 text-gray-400"
                              size={18}
                            />
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            WhatsApp Number
                          </label>
                          <div className="relative">
                            <Phone
                              className="absolute left-3 top-3 text-gray-400"
                              size={18}
                            />
                            <input
                              type="tel"
                              name="whatsapp"
                              value={formData.whatsapp}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location
                          </label>
                          <div className="relative">
                            <MapPin
                              className="absolute left-3 top-3 text-gray-400"
                              size={18}
                            />
                            <input
                              type="text"
                              name="location"
                              value={formData.location}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Audience Location
                          </label>
                          <div className="relative">
                            <Users
                              className="absolute left-3 top-3 text-gray-400"
                              size={18}
                            />
                            <input
                              type="text"
                              name="audienceLocation"
                              value={formData.audienceLocation}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                            />
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Niches (comma-separated)
                          </label>
                          <input
                            type="text"
                            name="niches"
                            value={formData.niches.join(", ")}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="e.g., Fashion, Beauty, Lifestyle, Technology"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex space-x-4 pt-4">
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                          <FloppyDisk size={16} />
                          <span>{loading ? "Saving..." : "Save Changes"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              )}

              {/* Banking Tab */}
              {activeTab === "banking" && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        Bank Account Details
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        Add your bank account information for payments
                      </p>
                    </div>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        isEditing
                          ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          : "bg-indigo-600 text-white hover:bg-indigo-700"
                      }`}
                    >
                      <PencilSimple size={16} />
                      <span>{isEditing ? "Cancel" : "Edit Bank Details"}</span>
                    </button>
                  </div>

                  <form
                    onSubmit={handleBankDetailsUpdate}
                    className="space-y-6"
                  >
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="font-medium text-gray-900 mb-4">
                        Account Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bank Name *
                          </label>
                          <div className="relative">
                            <BiBuilding
                              className="absolute left-3 top-3 text-gray-400"
                              size={18}
                            />
                            <input
                              type="text"
                              name="bankName"
                              value={formData.bankName}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              required
                              placeholder="e.g., First Bank of Nigeria"
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account Number *
                          </label>
                          <div className="relative">
                            <CreditCard
                              className="absolute left-3 top-3 text-gray-400"
                              size={18}
                            />
                            <input
                              type="text"
                              name="accountNumber"
                              value={formData.accountNumber}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              required
                              placeholder="0123456789"
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                            />
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account Name *
                          </label>
                          <div className="relative">
                            <User
                              className="absolute left-3 top-3 text-gray-400"
                              size={18}
                            />
                            <input
                              type="text"
                              name="accountName"
                              value={formData.accountName}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              required
                              placeholder="Account holder's full name"
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Bank Details Status */}
                      {user?.bankDetails && (
                        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Check className="text-green-600" size={20} />
                            <span className="text-green-800 font-medium">
                              Bank details saved
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {isEditing && (
                      <div className="flex space-x-4 pt-4">
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                          <FloppyDisk size={16} />
                          <span>
                            {loading ? "Saving..." : "Save Bank Details"}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Security Settings
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Manage your password and account security
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">
                      Change Password
                    </h4>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <Shield
                            className="absolute left-3 top-3 text-gray-400"
                            size={18}
                          />
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowCurrentPassword(!showCurrentPassword)
                            }
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          >
                            {showCurrentPassword ? (
                              <EyeSlash size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <Shield
                            className="absolute left-3 top-3 text-gray-400"
                            size={18}
                          />
                          <input
                            type={showNewPassword ? "text" : "password"}
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          >
                            {showNewPassword ? (
                              <EyeSlash size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <Shield
                            className="absolute left-3 top-3 text-gray-400"
                            size={18}
                          />
                          <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Confirm new password"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={
                          loading ||
                          !formData.currentPassword ||
                          !formData.newPassword ||
                          !formData.confirmPassword
                        }
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        {loading ? "Changing Password..." : "Change Password"}
                      </button>
                    </form>
                  </div>

                  {/* Danger Zone */}
                  <div className="border-t border-gray-200 pt-8">
                    <h4 className="font-medium mb-4 text-red-600">
                      Danger Zone
                    </h4>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <div className="flex items-start space-x-3">
                        <Trash className="text-red-600 mt-1" size={20} />
                        <div className="flex-1">
                          <h5 className="font-medium text-red-900 mb-2">
                            Delete Account
                          </h5>
                          <p className="text-red-700 text-sm mb-4">
                            Permanently delete your account and all associated
                            data. This action cannot be undone and will remove:
                          </p>
                          <ul className="text-red-700 text-sm space-y-1 mb-4 list-disc list-inside">
                            <li>All campaign history and data</li>
                            <li>
                              Profile information and social media connections
                            </li>
                            <li>Earnings history and analytics</li>
                            <li>All saved preferences and settings</li>
                          </ul>
                          <button
                            onClick={() => setShowDeleteModal(true)}
                            disabled={loading}
                            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                          >
                            <Trash size={16} />
                            <span>
                              {loading ? "Processing..." : "Delete Account"}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === "analytics" && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Analytics & Performance
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Track your campaign performance and earnings
                    </p>
                  </div>

                  {/* Performance Overview */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <BiTrendingUp className="text-blue-600" size={24} />
                        <span className="text-blue-600 text-sm font-medium">
                          Total
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-blue-900">
                        {totalCampaigns}
                      </div>
                      <div className="text-blue-700 text-sm">Campaigns</div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <Check className="text-green-600" size={24} />
                        <span className="text-green-600 text-sm font-medium">
                          Success
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-green-900">
                        {completedCampaigns}
                      </div>
                      <div className="text-green-700 text-sm">Completed</div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <Clock className="text-purple-600" size={24} />
                        <span className="text-purple-600 text-sm font-medium">
                          Active
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-purple-900">
                        {activeCampaigns}
                      </div>
                      <div className="text-purple-700 text-sm">In Progress</div>
                    </div>
                  </div>

                  {/* Earnings Overview */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <CreditCard size={20} />
                      <span>Earnings Overview</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="text-lg font-bold text-indigo-600">
                          {formatCurrency(user?.earningsPerPostNaira || 0)}
                        </div>
                        <div className="text-gray-600 text-sm">Per Post</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="text-lg font-bold text-purple-600">
                          {formatCurrency(user?.maxMonthlyEarningsNaira || 0)}
                        </div>
                        <div className="text-gray-600 text-sm">Max Monthly</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="text-lg font-bold text-green-600">
                          {formatCurrency(
                            completedCampaigns *
                              (user?.earningsPerPostNaira || 0)
                          )}
                        </div>
                        <div className="text-gray-600 text-sm">
                          Estimated Earnings
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Account;
