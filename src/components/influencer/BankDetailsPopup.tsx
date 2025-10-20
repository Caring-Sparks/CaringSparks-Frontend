"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaTimes, FaCheck } from "react-icons/fa";
import { Bank, CurrencyBtc } from "phosphor-react";

interface PaymentDetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (paymentDetails: PaymentDetails) => Promise<void>;
  userName: string;
  isSubmitting?: boolean;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface CryptoDetails {
  walletAddress: string;
  network: string;
  walletType: string;
}

export interface PaymentDetails {
  paymentType: "bank" | "crypto";
  bankDetails?: BankDetails;
  cryptoDetails?: CryptoDetails;
}

const CRYPTO_NETWORKS = [
  "Bitcoin (BTC)",
  "Ethereum (ETH)",
  "Binance Smart Chain (BSC)",
  "Tron (TRX)",
  "Polygon (MATIC)",
  "Solana (SOL)",
  "USDT (TRC20)",
  "USDT (ERC20)",
  "USDT (BSC)",
  "USDC",
];

const PaymentDetailsPopup: React.FC<PaymentDetailsPopupProps> = ({
  isOpen,
  onClose,
  onSubmit,
  userName,
  isSubmitting = false,
}) => {
  const [paymentType, setPaymentType] = useState<"bank" | "crypto">("bank");
  const [bankData, setBankData] = useState<BankDetails>({
    bankName: "",
    accountNumber: "",
    accountName: "",
  });
  const [cryptoData, setCryptoData] = useState<CryptoDetails>({
    walletAddress: "",
    network: "",
    walletType: "",
  });
  const [errors, setErrors] = useState<Record<any, any>>({});
  const [submitError, setSubmitError] = useState<string>("");

  const validateBankForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!bankData.bankName.trim()) {
      newErrors.bankName = "Bank name is required";
    }

    if (!bankData.accountNumber) {
      newErrors.accountNumber = "Account number is required";
    } else if (!/^\d{10}$/.test(bankData.accountNumber)) {
      newErrors.accountNumber = "Account number must be exactly 10 digits";
    }

    if (!bankData.accountName.trim()) {
      newErrors.accountName = "Account name is required";
    } else if (bankData.accountName.length < 2) {
      newErrors.accountName = "Account name must be at least 2 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCryptoForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!cryptoData.walletAddress.trim()) {
      newErrors.walletAddress = "Wallet address is required";
    } else if (cryptoData.walletAddress.length < 26) {
      newErrors.walletAddress = "Please enter a valid wallet address";
    }

    if (!cryptoData.network) {
      newErrors.network = "Please select a network";
    }

    if (!cryptoData.walletType.trim()) {
      newErrors.walletType = "Wallet type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBankInputChange = (field: keyof BankDetails, value: string) => {
    setBankData({ ...bankData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
    if (submitError) setSubmitError("");
  };

  const handleCryptoInputChange = (
    field: keyof CryptoDetails,
    value: string
  ) => {
    setCryptoData({ ...cryptoData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
    if (submitError) setSubmitError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid =
      paymentType === "bank" ? validateBankForm() : validateCryptoForm();

    if (!isValid) return;

    try {
      setSubmitError("");
      const paymentDetails: PaymentDetails = {
        paymentType,
        ...(paymentType === "bank"
          ? { bankDetails: bankData }
          : { cryptoDetails: cryptoData }),
      };
      await onSubmit(paymentDetails);
    } catch (error: any) {
      console.error("Error submitting payment details:", error);
      setSubmitError(
        error.message || "Failed to save payment details. Please try again."
      );
    }
  };

  const handleSkipForNow = () => {
    localStorage.setItem("paymentDetailsSkipped", "true");
    localStorage.setItem("paymentDetailsSkippedDate", new Date().toISOString());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-2xl flex items-center justify-center p-4 z-50"
        onClick={(e) =>
          e.target === e.currentTarget && !isSubmitting && handleSkipForNow()
        }
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-black rounded-2xl border no-scrollbar border-slate-200/10 shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-200/10 sticky top-0 bg-slate-200/20 backdrop-blur-2xl z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-200/10 rounded-full flex items-center justify-center">
                  {paymentType === "bank" ? (
                    <Bank className="txt text-xl" />
                  ) : (
                    <CurrencyBtc className="txt text-xl" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-400">
                    Welcome, {userName}!
                  </h2>
                  <p className="text-sm text-gray-400">
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
            {/* Payment Type Toggle */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-3">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentType("bank")}
                  disabled={isSubmitting}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    paymentType === "bank"
                      ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                      : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Bank className="text-xl" />
                  <span className="font-medium">Bank Transfer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentType("crypto")}
                  disabled={isSubmitting}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    paymentType === "crypto"
                      ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                      : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <CurrencyBtc className="text-xl" />
                  <span className="font-medium">Crypto</span>
                </button>
              </div>
            </div>

            <div className="mb-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800 text-sm">
                  <FaCheck className="inline mr-2 text-yellow-600" />
                  {paymentType === "bank"
                    ? "To receive payments for completed campaigns, please provide your bank account details."
                    : "To receive crypto payments for completed campaigns, please provide your wallet details."}
                </p>
              </div>
            </div>

            {submitError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{submitError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {paymentType === "bank" ? (
                <>
                  {/* Bank Name Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Name *
                    </label>
                    <input
                      type="text"
                      value={bankData.bankName}
                      onChange={(e) =>
                        handleBankInputChange("bankName", e.target.value)
                      }
                      placeholder="e.g., First Bank of Nigeria"
                      disabled={isSubmitting}
                      className={`frm ${
                        errors.bankName
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.bankName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.bankName}
                      </p>
                    )}
                  </div>

                  {/* Account Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Number *
                    </label>
                    <input
                      type="text"
                      value={bankData.accountNumber}
                      onChange={(e) =>
                        handleBankInputChange(
                          "accountNumber",
                          e.target.value.replace(/\D/g, "").slice(0, 10)
                        )
                      }
                      placeholder="1234567890"
                      disabled={isSubmitting}
                      className={`frm ${
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
                      value={bankData.accountName}
                      onChange={(e) =>
                        handleBankInputChange("accountName", e.target.value)
                      }
                      placeholder="John Doe"
                      disabled={isSubmitting}
                      className={`frm ${
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
                </>
              ) : (
                <>
                  {/* Crypto Network */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Network/Currency *
                    </label>
                    <select
                      value={cryptoData.network}
                      onChange={(e) =>
                        handleCryptoInputChange("network", e.target.value)
                      }
                      disabled={isSubmitting}
                      className={`frm ${
                        errors.network
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Select network</option>
                      {CRYPTO_NETWORKS.map((network) => (
                        <option key={network} value={network}>
                          {network}
                        </option>
                      ))}
                    </select>
                    {errors.network && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.network}
                      </p>
                    )}
                  </div>

                  {/* Wallet Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wallet Address *
                    </label>
                    <input
                      type="text"
                      value={cryptoData.walletAddress}
                      onChange={(e) =>
                        handleCryptoInputChange("walletAddress", e.target.value)
                      }
                      placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
                      disabled={isSubmitting}
                      className={`frm ${
                        errors.walletAddress
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.walletAddress && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.walletAddress}
                      </p>
                    )}
                  </div>

                  {/* Wallet Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wallet Type *
                    </label>
                    <input
                      type="text"
                      value={cryptoData.walletType}
                      onChange={(e) =>
                        handleCryptoInputChange("walletType", e.target.value)
                      }
                      placeholder="e.g., MetaMask, Trust Wallet, Binance"
                      disabled={isSubmitting}
                      className={`frm font-mono ${
                        errors.walletType
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.walletType && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.walletType}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      Save Payment Details
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

export default PaymentDetailsPopup;
