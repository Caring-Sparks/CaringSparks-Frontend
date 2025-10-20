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
} from "react-icons/fa";
import { SiThreads, SiDiscord } from "react-icons/si";

// Platform data interface matching your schema
interface PlatformData {
  followers: string;
  url: string;
  impressions: string;
  proofUrl?: string;
}

// Influencer interface matching your schema
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

interface AllInfluencersProps {
  influencers: Influencer[];
  campaignName: string;
  isOpen: boolean;
  onClose: () => void;
  onInfluencerClick: any;
}

const AllInfluencers: React.FC<AllInfluencersProps> = ({
  influencers,
  campaignName,
  isOpen,
  onClose,
  onInfluencerClick,
}) => {
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "instagram":
        return <FaInstagram className="text-pink-500 text-sm" />;
      case "facebook":
        return <FaFacebook className="text-blue-600 text-sm" />;
      case "tiktok":
        return <FaTiktok className="text-black text-sm" />;
      case "youtube":
        return <FaYoutube className="text-red-600 text-sm" />;
      case "linkedin":
        return <FaLinkedin className="text-blue-700 text-sm" />;
      case "twitter":
        return <FaTwitter className="text-blue-400 text-sm" />;
      case "snapchat":
        return <FaSnapchat className="text-yellow-400 text-sm" />;
      case "threads":
        return <SiThreads className="text-black text-sm" />;
      case "discord":
        return <SiDiscord className="text-yellow-600 text-sm" />;
      default:
        return null;
    }
  };

  const formatNumber = (num: string | number) => {
    const value = typeof num === "string" ? parseInt(num) : num;
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

  const getTotalFollowers = (influencer: Influencer) => {
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
    let total = 0;

    platforms.forEach((platform) => {
      const platformData = influencer[
        platform as keyof Influencer
      ] as PlatformData;
      if (platformData && platformData.followers) {
        const followers = parseInt(platformData.followers);
        if (!isNaN(followers)) {
          total += followers;
        }
      }
    });

    return total > 0 ? total : influencer.followersCount || 0;
  };

  const getMainPlatform = (influencer: Influencer) => {
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

    // Find platform with most followers
    let maxFollowers = 0;
    let mainPlatform = "";

    platforms.forEach((platform) => {
      const platformData = influencer[
        platform as keyof Influencer
      ] as PlatformData;
      if (platformData && platformData.followers) {
        const followers = parseInt(platformData.followers);
        if (!isNaN(followers) && followers > maxFollowers) {
          maxFollowers = followers;
          mainPlatform = platform;
        }
      }
    });

    return (
      mainPlatform ||
      platforms.find((platform) => {
        const platformData = influencer[
          platform as keyof Influencer
        ] as PlatformData;
        return platformData && (platformData.url || platformData.followers);
      })
    );
  };

  const getActivePlatforms = (influencer: Influencer) => {
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-2xl flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-black border border-slate-200/10 no-scrollbar rounded-2xl shadow-2xl w-full max-w-6xl max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-slate-200/20 border-b border-slate-200/10 backdrop-blur-2xl px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Assigned Influencers
                </h2>
                <p className="text-gray-600 mt-1">
                  {campaignName} • {influencers.length} influencer
                  {influencers.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {influencers.map((influencer, index) => {
                  const totalFollowers = getTotalFollowers(influencer);
                  const mainPlatform = getMainPlatform(influencer);
                  const activePlatforms = getActivePlatforms(influencer);

                  return (
                    <motion.div
                      key={influencer._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 bg-slate-200/20 hover:bg-gray-100/10 rounded-xl border border-slate-200/10 hover:border-gray-300 cursor-pointer transition-all duration-200 hover:shadow-md"
                      onClick={() => onInfluencerClick(influencer)}
                    >
                      <div className="flex items-start gap-4">
                        {/* Profile Picture */}
                        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-500 to-purple-600 text-white font-bold">
                          {influencer.name.charAt(0).toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {influencer.name}
                            </h3>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                influencer.status
                              )}`}
                            >
                              {influencer.status}
                            </span>
                            {influencer.isValidated && (
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                                ✓
                              </span>
                            )}
                          </div>

                          <p className="text-gray-600 text-sm mb-2 truncate">
                            {influencer.email}
                          </p>

                          <p className="text-gray-500 text-xs mb-3">
                            📍 {influencer.location}
                          </p>

                          {/* Niches */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            {influencer.niches.slice(0, 2).map((niche, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded"
                              >
                                {niche}
                              </span>
                            ))}
                            {influencer.niches.length > 2 && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                +{influencer.niches.length - 2}
                              </span>
                            )}
                          </div>

                          {/* Platform info */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {mainPlatform && getPlatformIcon(mainPlatform)}
                              <span className="text-sm font-medium text-gray-700">
                                {formatNumber(totalFollowers)} followers
                              </span>
                            </div>

                            {/* Active platforms count */}
                            <div className="flex items-center gap-1">
                              {activePlatforms.slice(0, 3).map((platform) => (
                                <div key={platform} className="w-4 h-4">
                                  {getPlatformIcon(platform)}
                                </div>
                              ))}
                              {activePlatforms.length > 3 && (
                                <span className="text-xs text-gray-500 ml-1">
                                  +{activePlatforms.length - 3}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Earnings */}
                          {(influencer.earningsPerPostNaira ||
                            influencer.amountPerPost) && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <span className="text-xs text-gray-500">
                                Earnings:{" "}
                              </span>
                              <span className="text-sm font-medium text-green-600">
                                {influencer.earningsPerPostNaira
                                  ? formatCurrency(
                                      influencer.earningsPerPostNaira
                                    )
                                  : influencer.amountPerPost}
                                {influencer.earningsPerPostNaira ? "/post" : ""}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Empty state */}
              {influencers.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg mb-2">
                    No influencers assigned
                  </div>
                  <p className="text-gray-600">
                    This campaign doesn&apos;t have any assigned influencers
                    yet.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Click on any influencer to view detailed information
              </div>
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

export default AllInfluencers;
