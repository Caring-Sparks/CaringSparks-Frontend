"use client";

import type React from "react";

import { AnimatePresence, motion } from "framer-motion";
import {
  FaTimes,
  FaInstagram,
  FaFacebook,
  FaTiktok,
  FaYoutube,
  FaLinkedin,
  FaTwitter,
  FaSnapchat,
  FaWhatsapp,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaEye,
  FaHeart,
  FaComment,
  FaShare,
  FaChartLine,
  FaUsers,
} from "react-icons/fa";
import { SiThreads, SiDiscord } from "react-icons/si";

interface PlatformData {
  followers: string;
  url: string;
  impressions: string;
  proofUrl?: string;
}

interface SubmittedJob {
  _id: string;
  description: string;
  submittedAt: string;
}

interface Influencer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  location: string;
  niches: string[];
  audienceLocation?: string;
  malePercentage?: string;
  femalePercentage?: string;
  audienceProofUrl?: string;

  // Platform data
  instagram?: PlatformData;
  twitter?: PlatformData;
  tiktok?: PlatformData;
  youtube?: PlatformData;
  facebook?: PlatformData;
  linkedin?: PlatformData;
  discord?: PlatformData;
  threads?: PlatformData;
  snapchat?: PlatformData;

  // Calculated earnings
  followerFee?: number;
  impressionFee?: number;
  locationFee?: number;
  nicheFee?: number;
  earningsPerPost?: number;
  earningsPerPostNaira?: number;
  maxMonthlyEarnings?: number;
  maxMonthlyEarningsNaira?: number;
  followersCount?: number;

  // Legacy fields
  amountPerPost?: string;
  amountPerMonth?: string;

  // Metadata
  status: "pending" | "approved" | "rejected";
  emailSent: boolean;
  isValidated: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface InfluencerDetailsModalProps {
  influencer: Influencer | null;
  isOpen: boolean;
  onClose: () => void;
  submittedJobs?: SubmittedJob[];
}

const InfluencerDetailsModal: React.FC<InfluencerDetailsModalProps> = ({
  influencer,
  isOpen,
  onClose,
  submittedJobs = [],
}) => {
  if (!influencer) return null;

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "instagram":
        return <FaInstagram className="text-pink-500" />;
      case "facebook":
        return <FaFacebook className="text-blue-600" />;
      case "tiktok":
        return <FaTiktok className="text-black" />;
      case "youtube":
        return <FaYoutube className="text-red-600" />;
      case "linkedin":
        return <FaLinkedin className="text-blue-700" />;
      case "twitter":
        return <FaTwitter className="text-blue-400" />;
      case "snapchat":
        return <FaSnapchat className="text-yellow-400" />;
      case "threads":
        return <SiThreads className="text-black" />;
      case "discord":
        return <SiDiscord className="text-indigo-600" />;
      default:
        return null;
    }
  };

  const formatNumber = (num: string | number) => {
    const value = typeof num === "string" ? Number.parseInt(num) : num;
    if (isNaN(value)) return "0";

    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + "M";
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + "K";
    }
    return value.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const getPlatformsWithData = () => {
    const platforms = [
      "instagram",
      "twitter",
      "tiktok",
      "youtube",
      "facebook",
      "linkedin",
      "discord",
      "threads",
      "snapchat",
    ];
    return platforms.filter((platform) => {
      const platformData = influencer[
        platform as keyof Influencer
      ] as PlatformData;
      return (
        platformData &&
        (platformData.followers || platformData.url || platformData.impressions)
      );
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const activePlatforms = getPlatformsWithData();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-2xl flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-black rounded-2xl shadow-2xl no-scrollbar w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-slate-200/20 border-b backdrop-blur-2xl border-slate-200/10 px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">
                Influencer Details
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes className="text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Profile Section */}
              <div className="flex items-start gap-6 mb-8">
                <div className="w-24 h-24 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-3xl font-bold">
                  {influencer.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-2xl font-semibold text-white">
                      {influencer.name}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        influencer.status
                      )}`}
                    >
                      {influencer.status.charAt(0).toUpperCase() +
                        influencer.status.slice(1)}
                    </span>
                    {influencer.isValidated && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Verified
                      </span>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white">
                      <FaEnvelope className="text-sm" />
                      <span>{influencer.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white">
                      <FaPhone className="text-sm" />
                      <span>{influencer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white">
                      <FaWhatsapp className="text-sm text-green-600" />
                      <span>{influencer.whatsapp}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white">
                      <FaMapMarkerAlt className="text-sm" />
                      <span>{influencer.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Niches */}
              <div className="mb-6">
                <h4 className="font-semibold text-white mb-3">Niches</h4>
                <div className="flex flex-wrap gap-2">
                  {influencer.niches.map((niche, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                    >
                      {niche}
                    </span>
                  ))}
                </div>
              </div>

              {/* Audience Demographics */}
              {(influencer.audienceLocation ||
                influencer.malePercentage ||
                influencer.femalePercentage) && (
                <div className="mb-6">
                  <h4 className="font-semibold text-white mb-3">
                    Audience Demographics
                  </h4>
                  <div className="bg-slate-200/20 border border-slate-200/10 p-4 rounded-lg">
                    {influencer.audienceLocation && (
                      <div className="mb-2">
                        <span className="font-medium text-white">
                          Location:{" "}
                        </span>
                        <span className="text-white">
                          {influencer.audienceLocation}
                        </span>
                      </div>
                    )}
                    {(influencer.malePercentage ||
                      influencer.femalePercentage) && (
                      <div className="flex gap-4">
                        {influencer.malePercentage && (
                          <div>
                            <span className="font-medium text-white">
                              Male:{" "}
                            </span>
                            <span className="text-white">
                              {influencer.malePercentage}%
                            </span>
                          </div>
                        )}
                        {influencer.femalePercentage && (
                          <div>
                            <span className="font-medium text-white">
                              Female:{" "}
                            </span>
                            <span className="text-white">
                              {influencer.femalePercentage}%
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    {influencer.audienceProofUrl && (
                      <div className="mt-2">
                        <a
                          href={influencer.audienceProofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-yellow-600 hover:text-yellow-800 underline text-sm"
                        >
                          View Audience Proof
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Social Media Platforms */}
              {activePlatforms.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-white mb-3">
                    Social Media Platforms
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activePlatforms.map((platform) => {
                      const platformData = influencer[
                        platform as keyof Influencer
                      ] as PlatformData;
                      return (
                        <div
                          key={platform}
                          className="p-4 bg-slate-200/20 border-slate-200/10 rounded-lg border"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            {getPlatformIcon(platform)}
                            <span className="font-medium text-white capitalize">
                              {platform}
                            </span>
                          </div>

                          <div className="space-y-2 text-sm">
                            {platformData.followers && (
                              <div className="flex justify-between">
                                <span className="text-white">Followers:</span>
                                <span className="font-medium text-white">
                                  {formatNumber(platformData.followers)}
                                </span>
                              </div>
                            )}
                            {platformData.impressions && (
                              <div className="flex justify-between">
                                <span className="text-white">Impressions:</span>
                                <span className="font-medium text-white">
                                  {formatNumber(platformData.impressions)}
                                </span>
                              </div>
                            )}
                            {platformData.url && (
                              <div>
                                <a
                                  href={platformData.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-yellow-600 hover:text-yellow-800 underline text-sm"
                                >
                                  View Profile
                                </a>
                              </div>
                            )}
                            {platformData.proofUrl && (
                              <div>
                                <a
                                  href={platformData.proofUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green-600 hover:text-green-800 underline text-sm"
                                >
                                  View Proof
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Earnings Information */}
              {(influencer.earningsPerPostNaira ||
                influencer.maxMonthlyEarningsNaira ||
                influencer.amountPerPost ||
                influencer.amountPerMonth) && (
                <div className="mb-6">
                  <h4 className="font-semibold text-white mb-3">
                    Earnings Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {influencer.earningsPerPostNaira && (
                      <div className="p-4 bg-green-50/10 border border-slate-200/10 rounded-lg">
                        <h5 className="font-medium text-green-600 mb-1">
                          Earnings Per Post
                        </h5>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(influencer.earningsPerPostNaira)}
                        </p>
                      </div>
                    )}
                    {influencer.maxMonthlyEarningsNaira && (
                      <div className="p-4 bg-blue-50/10 border border-slate-200/10 rounded-lg">
                        <h5 className="font-medium text-blue-700 mb-1">
                          Max Monthly Earnings
                        </h5>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatCurrency(influencer.maxMonthlyEarningsNaira)}
                        </p>
                      </div>
                    )}
                    {influencer.amountPerPost && (
                      <div className="p-4 bg-purple-50/10 border border-slate-200/10 rounded-lg">
                        <h5 className="font-medium text-purple-700 mb-1">
                          Amount Per Post (Legacy)
                        </h5>
                        <p className="text-lg font-semibold text-purple-600">
                          {influencer.amountPerPost}
                        </p>
                      </div>
                    )}
                    {influencer.amountPerMonth && (
                      <div className="p-4 bg-orange-50/10 border border-slate-200/10 rounded-lg">
                        <h5 className="font-medium text-orange-700 mb-1">
                          Amount Per Month (Legacy)
                        </h5>
                        <p className="text-lg font-semibold text-orange-600">
                          {influencer.amountPerMonth}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Stats */}
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 bg-gray-50/10 border border-slate-200/10 rounded-lg">
                  <h5 className="font-medium text-white mb-1">Member Since</h5>
                  <p className="text-white font-medium">
                    {formatDate(influencer.createdAt)}
                  </p>
                </div>
              </div>

              {/* Submitted Jobs */}
              {submittedJobs.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xl font-semibold text-white flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                      Submitted Jobs
                    </h4>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      {submittedJobs.length}{" "}
                      {submittedJobs.length === 1 ? "Job" : "Jobs"}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {submittedJobs.map((job, index) => {
                      const parseJobDescription = (description: string) => {
                        const lines = description
                          .split("\n")
                          .filter((line) => line.trim());
                        const parsed: { [key: string]: string } = {};

                        lines.forEach((line) => {
                          if (line.includes(":")) {
                            const [key, ...valueParts] = line.split(":");
                            const value = valueParts.join(":").trim();
                            parsed[key.trim()] = value;
                          }
                        });

                        return parsed;
                      };

                      const jobData = parseJobDescription(job.description);

                      return (
                        <div
                          key={job._id}
                          className="bg-slate-200/20 border border-slate-200/10 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                          {/* Job Header */}
                          <div className="px-6 py-4 border-b border-gray-100/10 bg-gradient-to-r from-yellow-50 to-yellow-50">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                                  {index + 1}
                                </div>
                                <h5 className="text-lg font-semibold text-gray-900">
                                  Job Submission #{index + 1}
                                </h5>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-white">
                                  Submitted
                                </div>
                                <div className="text-sm font-medium text-gray-900">
                                  {formatDate(job.submittedAt)}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Job Content */}
                          <div className="p-6">
                            {Object.keys(jobData).length > 0 ? (
                              <div className="space-y-6">
                                {(Object.entries(jobData).some(
                                  ([key]) =>
                                    key.toLowerCase().includes("reach") ||
                                    key.toLowerCase().includes("engagement") ||
                                    key.toLowerCase().includes("views") ||
                                    key.toLowerCase().includes("likes") ||
                                    key.toLowerCase().includes("comments") ||
                                    key.toLowerCase().includes("shares") ||
                                    key.toLowerCase().includes("impressions")
                                ) ||
                                  Object.keys(jobData).some(
                                    (key) => key.toLowerCase() === "metrics"
                                  )) && (
                                  <div>
                                    <h6 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                      <FaChartLine className="text-yellow-600" />
                                      Performance Metrics
                                    </h6>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                      {(() => {
                                        const allMetrics: [string, string][] =
                                          [];

                                        const metricsField = Object.entries(
                                          jobData
                                        ).find(
                                          ([key]) =>
                                            key.toLowerCase() === "metrics"
                                        );

                                        if (metricsField) {
                                          const [, metricsValue] = metricsField;
                                          try {
                                            const parsedMetrics =
                                              typeof metricsValue === "string"
                                                ? JSON.parse(metricsValue)
                                                : metricsValue;

                                            Object.entries(
                                              parsedMetrics
                                            ).forEach(([key, value]) => {
                                              allMetrics.push([
                                                key,
                                                String(value),
                                              ]);
                                            });
                                          } catch (e) {
                                            console.error(
                                              "Failed to parse metrics:",
                                              e
                                            );
                                          }
                                        }

                                        Object.entries(jobData)
                                          .filter(
                                            ([key]) =>
                                              key.toLowerCase() !== "metrics" &&
                                              (key
                                                .toLowerCase()
                                                .includes("reach") ||
                                                key
                                                  .toLowerCase()
                                                  .includes("engagement") ||
                                                key
                                                  .toLowerCase()
                                                  .includes("views") ||
                                                key
                                                  .toLowerCase()
                                                  .includes("likes") ||
                                                key
                                                  .toLowerCase()
                                                  .includes("comments") ||
                                                key
                                                  .toLowerCase()
                                                  .includes("shares") ||
                                                key
                                                  .toLowerCase()
                                                  .includes("impressions"))
                                          )
                                          .forEach(([key, value]) => {
                                            allMetrics.push([key, value]);
                                          });

                                        return allMetrics.map(
                                          ([key, value]) => {
                                            const getMetricIcon = (
                                              metricKey: string
                                            ) => {
                                              const lowerKey =
                                                metricKey.toLowerCase();
                                              if (
                                                lowerKey.includes("views") ||
                                                lowerKey.includes("reach") ||
                                                lowerKey.includes("impressions")
                                              ) {
                                                return (
                                                  <FaEye className="text-blue-500" />
                                                );
                                              } else if (
                                                lowerKey.includes("likes")
                                              ) {
                                                return (
                                                  <FaHeart className="text-red-500" />
                                                );
                                              } else if (
                                                lowerKey.includes("comments")
                                              ) {
                                                return (
                                                  <FaComment className="text-green-500" />
                                                );
                                              } else if (
                                                lowerKey.includes("shares")
                                              ) {
                                                return (
                                                  <FaShare className="text-purple-500" />
                                                );
                                              } else if (
                                                lowerKey.includes("engagement")
                                              ) {
                                                return (
                                                  <FaUsers className="text-orange-500" />
                                                );
                                              }
                                              return (
                                                <FaChartLine className="text-indigo-500" />
                                              );
                                            };

                                            const formatMetricValue = (
                                              val: string
                                            ) => {
                                              const cleaned = val
                                                .replace(/,/g, "")
                                                .trim();
                                              const numValue =
                                                Number.parseFloat(
                                                  cleaned.replace(
                                                    /[^\d.-]/g,
                                                    ""
                                                  )
                                                );
                                              if (!isNaN(numValue)) {
                                                if (numValue >= 1_000_000)
                                                  return (
                                                    (
                                                      numValue / 1_000_000
                                                    ).toFixed(1) + "M"
                                                  );
                                                if (numValue >= 1_000)
                                                  return (
                                                    (numValue / 1_000).toFixed(
                                                      1
                                                    ) + "K"
                                                  );
                                                return numValue.toLocaleString();
                                              }
                                              return val;
                                            };

                                            return (
                                              <div
                                                key={key}
                                                className="p-3 bg-white rounded-lg shadow flex flex-col items-center"
                                              >
                                                <div className="flex items-center gap-2 text-gray-700 font-medium text-sm">
                                                  {getMetricIcon(key)}
                                                  <span className="capitalize">
                                                    {key}
                                                  </span>
                                                </div>
                                                <p className="text-lg font-bold text-gray-900">
                                                  {formatMetricValue(value)}
                                                </p>
                                              </div>
                                            );
                                          }
                                        );
                                      })()}
                                    </div>
                                  </div>
                                )}

                                {/* Other Job Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {Object.entries(jobData)
                                    .filter(
                                      ([key]) =>
                                        key.toLowerCase() !== "metrics" &&
                                        !key.toLowerCase().includes("reach") &&
                                        !key
                                          .toLowerCase()
                                          .includes("engagement") &&
                                        !key.toLowerCase().includes("views") &&
                                        !key.toLowerCase().includes("likes") &&
                                        !key
                                          .toLowerCase()
                                          .includes("comments") &&
                                        !key.toLowerCase().includes("shares") &&
                                        !key
                                          .toLowerCase()
                                          .includes("impressions")
                                    )
                                    .map(([key, value]) => {
                                      const isUrl = value.startsWith("http");
                                      const isPlatform = key
                                        .toLowerCase()
                                        .includes("platform");

                                      return (
                                        <div key={key} className="space-y-1">
                                          <div className="text-sm font-medium text-white capitalize">
                                            {key
                                              .replace(/([A-Z])/g, " $1")
                                              .trim()}
                                          </div>
                                          <div className="text-sm text-white">
                                            {isUrl ? (
                                              <a
                                                href={value}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-yellow-600 hover:text-yellow-800 underline break-all"
                                              >
                                                View Post
                                              </a>
                                            ) : isPlatform ? (
                                              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                                                {value}
                                              </span>
                                            ) : (
                                              <span className="break-words">
                                                {value}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                </div>
                              </div>
                            ) : (
                              /* Fallback for unstructured descriptions */
                              <div className="bg-gray-50 rounded-lg p-4">
                                <div className="text-sm font-medium text-white mb-2">
                                  Job Description
                                </div>
                                <div className="text-sm text-white whitespace-pre-wrap leading-relaxed">
                                  {job.description}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Job Footer */}
                          <div className="px-6 py-3 bg-slate-200/20 border-t border-slate-200/10 rounded-b-xl">
                            <div className="flex items-center justify-between text-xs text-gray-900">
                              <span>Job ID: {job._id}</span>
                              <span className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                Completed
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-slate-200/20 backdrop-blur-2xl border-t border-slate-200/10 px-6 py-4 rounded-b-2xl flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InfluencerDetailsModal;
