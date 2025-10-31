"use client";

import { useState, useEffect } from "react";
import { useBrandStore } from "@/stores/brandStore";
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
} from "phosphor-react";
import { BiBuilding } from "react-icons/bi";
import { CgMail } from "react-icons/cg";
import { useToast } from "@/utils/ToastNotification";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

interface AccountFormData {
  brandName: string;
  email: string;
  brandPhone: string;
  role: "brand" | "business" | "person" | "movie" | "music" | "other" | "";
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  campaignUpdates: boolean;
  paymentAlerts: boolean;
  marketingEmails: boolean;
}

const Account: React.FC = () => {
  const {
    user,
    campaigns,
    userLoading,
    userError,
    fetchUser,
    fetchCampaignsByEmail,
    clearErrors,
    clearUser,
  } = useBrandStore();

  const [activeTab, setActiveTab] = useState<
    "profile" | "security" | "notifications" | "billing"
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
    brandName: "",
    email: "",
    brandPhone: "",
    role: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    campaignUpdates: true,
    paymentAlerts: true,
    marketingEmails: false,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        brandName: user.brandName || "",
        email: user.email || "",
        brandPhone: user.brandPhone || "",
        role: (user.role?.toLowerCase() as AccountFormData["role"]) || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      fetchCampaignsByEmail(user.email);
    }
  }, [user, fetchCampaignsByEmail]);

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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
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
        }/api/auth/update-profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            brandName: formData.brandName,
            email: formData.email,
            brandPhone: formData.brandPhone,
            role: formData.role
              ? formData.role.charAt(0).toUpperCase() + formData.role.slice(1)
              : formData.role,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      setSuccessMessage("Profile updated successfully!");
      showToast({
        type: "success",
        title: "Success!",
        message: "Profile updated successfully!",
        duration: 6000,
      });
      await fetchUser();
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

  const handleNotificationUpdate = async () => {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSuccessMessage("Notification settings updated successfully!");
    } catch (error) {
      setErrorMessage(
        "Failed to update notification settings. Please try again."
      );
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
    const totalCampaigns = campaigns.length;
    const paidCampaigns = campaigns.filter((c) => c.hasPaid).length;
    const totalSpent = campaigns
      .filter((c) => c.hasPaid)
      .reduce((sum, c) => sum + (c.totalCost || 0), 0);

    return { totalCampaigns, paidCampaigns, totalSpent };
  };

  const { totalCampaigns, paidCampaigns, totalSpent } = calculateAccountStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const formatRoleForDisplay = (role: string) => {
    if (!role) return "";
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-black p-6">
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
            key="logout-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-2xl flex items-center justify-center p-8 z-50"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              key="logout-modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-200/20 backdrop-blur-2xl rounded-xl shadow-2xl w-full max-w-sm p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-white mb-4">
                Confirm Action
              </h2>
              <p className="text-sm text-white mb-6">
                Are you sure you want to delete your account?
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

      <div className="min-h-screen bg-black p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">
              Account Management
            </h1>
            <p className="text-white mt-1">
              Manage your account settings and preferences
            </p>
          </div>

          {/* Display userError if it exists */}
          {userError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-red-700">{userError}</span>
            </div>
          )}

          {/* Account Overview */}
          <div className="bg-slate-200/20 rounded-xl shadow-sm border border-slate-200/10 p-6 mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <User className="text-yellow-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {user?.brandName || "Brand Account"}
                </h2>
                <p className="text-white">{user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200/10">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {totalCampaigns}
                </div>
                <div className="text-white text-sm">Total Campaigns</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {paidCampaigns}
                </div>
                <div className="text-white text-sm">Paid Campaigns</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(totalSpent)}
                </div>
                <div className="text-white text-sm">Total Spent</div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-slate-200/20 rounded-xl shadow-sm border border-slate-200/10 overflow-hidden">
            <div className="border-b border-slate-200/10">
              <nav className="flex overflow-scroll no-scrollbar">
                {[
                  { key: "profile", label: "Profile", icon: User },
                  { key: "security", label: "Security", icon: Shield },
                  // { key: "notifications", label: "Notifications", icon: Bell },
                  { key: "billing", label: "Billing", icon: CreditCard },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as typeof activeTab)}
                    className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                      activeTab === key
                        ? "border-b-2 border-yellow-600 text-yellow-600 bg-yellow-50/10"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50/10"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">
                      Profile Information
                    </h3>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center space-x-2 text-yellow-600 hover:text-yellow-700"
                    >
                      <PencilSimple size={16} />
                      <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
                    </button>
                  </div>

                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Brand Name
                        </label>
                        <div className="relative">
                          <BiBuilding
                            className="absolute left-3 top-3 text-white"
                            size={18}
                          />
                          <input
                            type="text"
                            name="brandName"
                            value={formData.brandName}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="frm2"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Role
                        </label>
                        <select
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          disabled
                          className="frm2"
                        >
                          <option value="">Select Role</option>
                          <option value="brand">Brand</option>
                          <option value="business">Business</option>
                          <option value="person">Person</option>
                          <option value="movie">Movie</option>
                          <option value="music">Music</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <CgMail
                            className="absolute left-3 top-3 text-white"
                            size={18}
                          />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="frm2"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone
                            className="absolute left-3 top-3 text-white"
                            size={18}
                          />
                          <input
                            type="tel"
                            name="brandPhone"
                            value={formData.brandPhone}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="frm2"
                          />
                        </div>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex space-x-4">
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                          <FloppyDisk size={16} />
                          <span>{loading ? "Saving..." : "Save Changes"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-6 py-2 border border-slate-200/10 rounded-lg text-white hover:bg-gray-50/10 font-medium transition-colors"
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
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white">
                    Security Settings
                  </h3>

                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          className="frm"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          className="absolute right-3 top-3 text-white hover:text-white"
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
                      <label className="block text-sm font-medium text-white mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          className="frm"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-3 text-white hover:text-white"
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
                      <label className="block text-sm font-medium text-white mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="frm"
                        placeholder="Confirm new password"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={
                        loading ||
                        !formData.currentPassword ||
                        !formData.newPassword
                      }
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {loading ? "Changing Password..." : "Change Password"}
                    </button>
                  </form>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Notification Preferences
                  </h3>

                  <div className="space-y-4">
                    {[
                      {
                        key: "emailNotifications",
                        label: "Email Notifications",
                        description: "Receive general notifications via email",
                      },
                      {
                        key: "smsNotifications",
                        label: "SMS Notifications",
                        description: "Receive important updates via SMS",
                      },
                      {
                        key: "campaignUpdates",
                        label: "Campaign Updates",
                        description:
                          "Get notified about campaign status changes",
                      },
                      {
                        key: "paymentAlerts",
                        label: "Payment Alerts",
                        description:
                          "Receive notifications about payment activities",
                      },
                      {
                        key: "marketingEmails",
                        label: "Marketing Emails",
                        description:
                          "Receive promotional emails and newsletters",
                      },
                    ].map(({ key, label, description }) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {label}
                          </div>
                          <div className="text-sm text-white">
                            {description}
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={
                              notifications[key as keyof NotificationSettings]
                            }
                            disabled
                            onChange={() =>
                              handleNotificationChange(
                                key as keyof NotificationSettings
                              )
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleNotificationUpdate}
                    disabled={loading}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {loading ? "Updating..." : "Update Preferences"}
                  </button>
                </div>
              )}

              {/* Billing Tab */}
              {activeTab === "billing" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white">
                    Billing & Account
                  </h3>

                  <div className="bg-slate-200/10 border border-slate-200/10 rounded-lg p-6">
                    <h4 className="font-medium text-white mb-4">
                      Account Statistics
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-slate-200/10 border border-slate-200/10 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-gray-300">
                          {totalCampaigns}
                        </div>
                        <div className="text-gray-300 text-sm">
                          Total Campaigns
                        </div>
                      </div>
                      <div className="bg-slate-200/10 border border-slate-200/10 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(totalSpent)}
                        </div>
                        <div className="text-gray-300 text-sm">Total Spent</div>
                      </div>
                      <div className="bg-slate-200/10 border border-slate-200/10 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-500">
                          {paidCampaigns}
                        </div>
                        <div className="text-gray-300 text-sm">
                          Paid Campaigns
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200/10 pt-6">
                    <h4 className="font-medium mb-4 text-red-600">
                      Danger Zone
                    </h4>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h5 className="font-medium text-red-900 mb-2">
                        Delete Account
                      </h5>
                      <p className="text-red-700 text-sm mb-4">
                        Once you delete your account, there is no going back.
                        Please be certain. This will permanently delete all your
                        campaigns, data, and cannot be undone.
                      </p>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        disabled={loading}
                        className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        <Trash size={16} />
                        <span>
                          {loading ? "Deleting..." : "Delete Account"}
                        </span>
                      </button>
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
