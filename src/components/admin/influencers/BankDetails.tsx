import React, { useState } from "react";

interface InfluencerDetailsProps {
  selectedInfluencer: any;
}

const BankDetailsDisplay: React.FC<InfluencerDetailsProps> = ({
  selectedInfluencer,
}) => {
  const [copiedField, setCopiedField] = useState<string | any>(null);

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const hasBankDetails =
    selectedInfluencer?.bankDetails &&
    (selectedInfluencer.bankDetails.accountName ||
      selectedInfluencer.bankDetails.accountNumber ||
      selectedInfluencer.bankDetails.bankName);

  const hasCryptoDetails =
    selectedInfluencer?.cryptoDetails &&
    (selectedInfluencer.cryptoDetails.network ||
      selectedInfluencer.cryptoDetails.walletAddress ||
      selectedInfluencer.cryptoDetails.walletType);

  if (!hasBankDetails && !hasCryptoDetails) {
    return (
      <div className="p-6">
        <div className="bg-slate-200/20 border border-gray-200 rounded-lg p-6">
          <p className="text-white text-center">
            No payment details available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      {/* Bank Details Section */}
      {hasBankDetails && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-slate-800 px-4 py-3">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              Bank Details
            </h3>
          </div>

          <div className="p-4 space-y-3">
            {selectedInfluencer.bankDetails.accountName && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex-1">
                  <p className="text-xs text-white font-medium mb-1">
                    Account Name
                  </p>
                  <p className="text-gray-900 font-medium">
                    {selectedInfluencer.bankDetails.accountName}
                  </p>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(
                      selectedInfluencer.bankDetails.accountName,
                      "accountName"
                    )
                  }
                  className="ml-3 p-2 hover:bg-gray-200 rounded-md transition"
                  title="Copy to clipboard"
                >
                  {copiedField === "accountName" ? (
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            )}

            {selectedInfluencer.bankDetails.accountNumber && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex-1">
                  <p className="text-xs text-white font-medium mb-1">
                    Account Number
                  </p>
                  <p className="text-gray-900 font-mono font-semibold text-lg">
                    {selectedInfluencer.bankDetails.accountNumber}
                  </p>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(
                      selectedInfluencer.bankDetails.accountNumber,
                      "accountNumber"
                    )
                  }
                  className="ml-3 p-2 hover:bg-gray-200 rounded-md transition"
                  title="Copy to clipboard"
                >
                  {copiedField === "accountNumber" ? (
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            )}

            {selectedInfluencer.bankDetails.bankName && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex-1">
                  <p className="text-xs text-white font-medium mb-1">
                    Bank Name
                  </p>
                  <p className="text-gray-900 font-medium">
                    {selectedInfluencer.bankDetails.bankName}
                  </p>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(
                      selectedInfluencer.bankDetails.bankName,
                      "bankName"
                    )
                  }
                  className="ml-3 p-2 hover:bg-gray-200 rounded-md transition"
                  title="Copy to clipboard"
                >
                  {copiedField === "bankName" ? (
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Crypto Details Section */}
      {hasCryptoDetails && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-slate-800 px-4 py-3">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Cryptocurrency Details
            </h3>
          </div>

          <div className="p-4 space-y-3">
            {selectedInfluencer.cryptoDetails.walletType && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex-1">
                  <p className="text-xs text-white font-medium mb-1">
                    Wallet Type
                  </p>
                  <p className="text-gray-900 font-medium">
                    {selectedInfluencer.cryptoDetails.walletType}
                  </p>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(
                      selectedInfluencer.cryptoDetails.walletType,
                      "walletType"
                    )
                  }
                  className="ml-3 p-2 hover:bg-gray-200 rounded-md transition"
                  title="Copy to clipboard"
                >
                  {copiedField === "walletType" ? (
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            )}

            {selectedInfluencer.cryptoDetails.network && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex-1">
                  <p className="text-xs text-white font-medium mb-1">
                    Network
                  </p>
                  <p className="text-gray-900 font-medium">
                    {selectedInfluencer.cryptoDetails.network}
                  </p>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(
                      selectedInfluencer.cryptoDetails.network,
                      "network"
                    )
                  }
                  className="ml-3 p-2 hover:bg-gray-200 rounded-md transition"
                  title="Copy to clipboard"
                >
                  {copiedField === "network" ? (
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            )}

            {selectedInfluencer.cryptoDetails.walletAddress && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex-1">
                  <p className="text-xs text-white font-medium mb-1">
                    Wallet Address
                  </p>
                  <p className="text-gray-900 font-mono text-sm break-all">
                    {selectedInfluencer.cryptoDetails.walletAddress}
                  </p>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(
                      selectedInfluencer.cryptoDetails.walletAddress,
                      "walletAddress"
                    )
                  }
                  className="ml-3 p-2 hover:bg-gray-200 rounded-md transition flex-shrink-0"
                  title="Copy to clipboard"
                >
                  {copiedField === "walletAddress" ? (
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BankDetailsDisplay;
