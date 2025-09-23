"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaTimes, FaCheck } from "react-icons/fa";
import { Bank } from "phosphor-react";

interface BankDetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bankDetails: BankDetails) => Promise<void>;
  userName: string;
  isSubmitting?: boolean; // External loading state
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

const NIGERIAN_BANKS = [
  "Access Bank",
  "Citibank Nigeria",
  "Ecobank Nigeria",
  "Fidelity Bank",
  "First Bank of Nigeria",
  "First City Monument Bank",
  "Guaranty Trust Bank",
  "Heritage Bank",
  "Keystone Bank",
  "Polaris Bank",
  "Providus Bank",
  "Stanbic IBTC Bank",
  "Standard Chartered Bank",
  "Sterling Bank",
  "Union Bank of Nigeria",
  "United Bank for Africa",
  "Unity Bank",
  "Wema Bank",
  "Zenith Bank",
  "Jaiz Bank",
  "SunTrust Bank",
  "Titan Trust Bank",
  "VFD Microfinance Bank",
  "Moniepoint Microfinance Bank",
  "Opay",
  "Kuda Bank",
  "Rubies Bank",
  "GoMoney",
  "V Bank",
];

const BankDetailsPopup: React.FC<BankDetailsPopupProps> = ({
  isOpen,
  onClose,
  onSubmit,
  userName,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<BankDetails>({
    bankName: "",
    accountNumber: "",
    accountName: "",
  });
  const [errors, setErrors] = useState<Partial<BankDetails>>({});
  const [submitError, setSubmitError] = useState<string>("");

  const validateForm = (): boolean => {
    const newErrors: Partial<BankDetails> = {};

    if (!formData.bankName) {
      newErrors.bankName = "Please select your bank";
    }

    if (!formData.accountNumber) {
      newErrors.accountNumber = "Account number is required";
    } else if (!/^\d{10}$/.test(formData.accountNumber)) {
      newErrors.accountNumber = "Account number must be exactly 10 digits";
    }

    if (!formData.accountName) {
      newErrors.accountName = "Account name is required";
    } else if (formData.accountName.length < 2) {
      newErrors.accountName = "Account name must be at least 2 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof BankDetails, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
    // Clear submit error when user makes changes
    if (submitError) {
      setSubmitError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitError("");
      await onSubmit(formData);
      // Success handled by parent component (closing popup, etc.)
    } catch (error: any) {
      console.error("Error submitting bank details:", error);
      setSubmitError(
        error.message || "Failed to save bank details. Please try again."
      );
    }
  };

  const handleSkipForNow = () => {
    // Store in localStorage that user skipped (temporary solution)
    localStorage.setItem("bankDetailsSkipped", "true");
    localStorage.setItem("bankDetailsSkippedDate", new Date().toISOString());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        onClick={(e) =>
          e.target === e.currentTarget && !isSubmitting && handleSkipForNow()
        }
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bank className="text-blue-600 text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Welcome, {userName}!
                  </h2>
                  <p className="text-sm text-gray-600">
                    Set up your payment details
                  </p>
                </div>
              </div>
              {!isSubmitting && (
                <button
                  onClick={handleSkipForNow}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Skip for now"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800 text-sm">
                  <FaCheck className="inline mr-2 text-blue-600" />
                  To receive payments for completed campaigns, please provide
                  your bank account details. This information is secure and will
                  only be used for payment processing.
                </p>
              </div>
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{submitError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Bank Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name *
                </label>
                <select
                  value={formData.bankName}
                  onChange={(e) =>
                    handleInputChange("bankName", e.target.value)
                  }
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    errors.bankName
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                >
                  <option value="">Select your bank</option>
                  {NIGERIAN_BANKS.map((bank) => (
                    <option key={bank} value={bank}>
                      {bank}
                    </option>
                  ))}
                </select>
                {errors.bankName && (
                  <p className="mt-1 text-sm text-red-600">{errors.bankName}</p>
                )}
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number *
                </label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) =>
                    handleInputChange(
                      "accountNumber",
                      e.target.value.replace(/\D/g, "").slice(0, 10)
                    )
                  }
                  placeholder="1234567890"
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    errors.accountNumber
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                />
                {errors.accountNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.accountNumber}
                  </p>
                )}
              </div>

              {/* Account Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Name *
                </label>
                <input
                  type="text"
                  value={formData.accountName}
                  onChange={(e) =>
                    handleInputChange("accountName", e.target.value)
                  }
                  placeholder="Enter account name as shown on your bank statement"
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    errors.accountName
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                />
                {errors.accountName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.accountName}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      Save Bank Details
                    </>
                  )}
                </button>

                {!isSubmitting && (
                  <button
                    type="button"
                    onClick={handleSkipForNow}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium transition-colors"
                  >
                    Skip for Now
                  </button>
                )}
              </div>

              <div className="text-center pt-2">
                <p className="text-xs text-gray-500">
                  You can update these details later in your profile settings
                </p>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BankDetailsPopup;
