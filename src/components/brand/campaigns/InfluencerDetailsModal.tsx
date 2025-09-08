import { AnimatePresence, motion } from "framer-motion";
import { FaTimes, FaInstagram, FaFacebook, FaTiktok, FaYoutube, FaLinkedin, FaTwitter, FaSnapchat, FaWhatsapp, FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
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

interface InfluencerDetailsModalProps {
  influencer: Influencer | null;
  isOpen: boolean;
  onClose: () => void;
}

const InfluencerDetailsModal: React.FC<InfluencerDetailsModalProps> = ({
  influencer,
  isOpen,
  onClose,
}) => {
  if (!influencer) return null;

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return <FaInstagram className="text-pink-500" />;
      case 'facebook':
        return <FaFacebook className="text-blue-600" />;
      case 'tiktok':
        return <FaTiktok className="text-black" />;
      case 'youtube':
        return <FaYoutube className="text-red-600" />;
      case 'linkedin':
        return <FaLinkedin className="text-blue-700" />;
      case 'twitter':
        return <FaTwitter className="text-blue-400" />;
      case 'snapchat':
        return <FaSnapchat className="text-yellow-400" />;
      case 'threads':
        return <SiThreads className="text-black" />;
      case 'discord':
        return <SiDiscord className="text-indigo-600" />;
      default:
        return null;
    }
  };

  const formatNumber = (num: string | number) => {
    const value = typeof num === 'string' ? parseInt(num) : num;
    if (isNaN(value)) return '0';
    
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
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

  // Get platforms with data
  const getPlatformsWithData = () => {
    const platforms = ['instagram', 'twitter', 'tiktok', 'youtube', 'facebook', 'linkedin', 'discord', 'threads', 'snapchat'];
    return platforms.filter(platform => {
      const platformData = influencer[platform as keyof Influencer] as PlatformData;
      return platformData && (platformData.followers || platformData.url || platformData.impressions);
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
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
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Influencer Details</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes className="text-gray-500" />
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
                    <h3 className="text-2xl font-semibold text-gray-900">{influencer.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(influencer.status)}`}>
                      {influencer.status.charAt(0).toUpperCase() + influencer.status.slice(1)}
                    </span>
                    {influencer.isValidated && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Verified
                      </span>
                    )}
                  </div>
                  
                  {/* Contact Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaEnvelope className="text-sm" />
                      <span>{influencer.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaPhone className="text-sm" />
                      <span>{influencer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaWhatsapp className="text-sm text-green-600" />
                      <span>{influencer.whatsapp}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaMapMarkerAlt className="text-sm" />
                      <span>{influencer.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Niches */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Niches</h4>
                <div className="flex flex-wrap gap-2">
                  {influencer.niches.map((niche, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                    >
                      {niche}
                    </span>
                  ))}
                </div>
              </div>

              {/* Audience Demographics */}
              {(influencer.audienceLocation || influencer.malePercentage || influencer.femalePercentage) && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Audience Demographics</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {influencer.audienceLocation && (
                      <div className="mb-2">
                        <span className="font-medium text-gray-700">Location: </span>
                        <span className="text-gray-900">{influencer.audienceLocation}</span>
                      </div>
                    )}
                    {(influencer.malePercentage || influencer.femalePercentage) && (
                      <div className="flex gap-4">
                        {influencer.malePercentage && (
                          <div>
                            <span className="font-medium text-gray-700">Male: </span>
                            <span className="text-gray-900">{influencer.malePercentage}%</span>
                          </div>
                        )}
                        {influencer.femalePercentage && (
                          <div>
                            <span className="font-medium text-gray-700">Female: </span>
                            <span className="text-gray-900">{influencer.femalePercentage}%</span>
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
                          className="text-indigo-600 hover:text-indigo-800 underline text-sm"
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
                  <h4 className="font-semibold text-gray-900 mb-3">Social Media Platforms</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activePlatforms.map((platform) => {
                      const platformData = influencer[platform as keyof Influencer] as PlatformData;
                      return (
                        <div key={platform} className="p-4 bg-gray-50 rounded-lg border">
                          <div className="flex items-center gap-3 mb-3">
                            {getPlatformIcon(platform)}
                            <span className="font-medium text-gray-900 capitalize">{platform}</span>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            {platformData.followers && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Followers:</span>
                                <span className="font-medium">{formatNumber(platformData.followers)}</span>
                              </div>
                            )}
                            {platformData.impressions && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Impressions:</span>
                                <span className="font-medium">{formatNumber(platformData.impressions)}</span>
                              </div>
                            )}
                            {platformData.url && (
                              <div>
                                <a
                                  href={platformData.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 hover:text-indigo-800 underline text-sm"
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
              {(influencer.earningsPerPostNaira || influencer.maxMonthlyEarningsNaira || influencer.amountPerPost || influencer.amountPerMonth) && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Earnings Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {influencer.earningsPerPostNaira && (
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h5 className="font-medium text-green-900 mb-1">Earnings Per Post</h5>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(influencer.earningsPerPostNaira)}
                        </p>
                      </div>
                    )}
                    {influencer.maxMonthlyEarningsNaira && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h5 className="font-medium text-blue-900 mb-1">Max Monthly Earnings</h5>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatCurrency(influencer.maxMonthlyEarningsNaira)}
                        </p>
                      </div>
                    )}
                    {influencer.amountPerPost && (
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h5 className="font-medium text-purple-900 mb-1">Amount Per Post (Legacy)</h5>
                        <p className="text-lg font-semibold text-purple-600">
                          {influencer.amountPerPost}
                        </p>
                      </div>
                    )}
                    {influencer.amountPerMonth && (
                      <div className="p-4 bg-orange-50 rounded-lg">
                        <h5 className="font-medium text-orange-900 mb-1">Amount Per Month (Legacy)</h5>
                        <p className="text-lg font-semibold text-orange-600">
                          {influencer.amountPerMonth}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {influencer.followersCount && (
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <h5 className="font-medium text-indigo-900 mb-1">Total Followers</h5>
                    <p className="text-2xl font-bold text-indigo-600">
                      {formatNumber(influencer.followersCount)}
                    </p>
                  </div>
                )}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-1">Member Since</h5>
                  <p className="text-gray-600 font-medium">
                    {formatDate(influencer.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
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