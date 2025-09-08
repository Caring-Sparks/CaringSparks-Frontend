"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAdminStore } from "@/stores/adminStore";
import {
  FaInstagram,
  FaFacebook,
  FaTiktok,
  FaYoutube,
  FaTwitter,
  FaLinkedin,
  FaSnapchat,
  FaArrowLeft,
  FaFilter,
  FaSearch,
  FaCheck,
  FaTimes,
  FaDiscord,
} from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/utils/ToastNotification";
import Image from "next/image";

interface SocialMediaAccount {
  platform: string;
  username: string;
  followerCount: number;
  verified: boolean;
}

interface Influencer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  bio?: string;
  profileImage?: string;
  socialMediaAccounts: SocialMediaAccount[];
  totalFollowers: number;
  averageEngagement?: number;
  niche: string[];
  isVerified: boolean;
  rating: number;
  completedCampaigns: number;
  joinedDate: string;
  isActive: boolean;
}

interface Campaign {
  _id: string;
  brandName: string;
  role: string;
  platforms: string[];
  location: string;
  additionalLocations?: string[];
  followersRange?: string;
  influencersMin: number;
  influencersMax: number;
  assignedInfluencers?: string[];
}

const InfluencerAssignment: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("campaignId");
  const { showToast } = useToast();

  // Using the store
  const {
    campaigns,
    influencers,
    loading,
    error,
    hasInitialized,
    fetchData,
    clearError,
  } = useAdminStore();

  const [campaign, setCampaign] = useState<Campaign | any>(null);
  const [filteredInfluencers, setFilteredInfluencers] = useState<Influencer[]>(
    []
  );
  const [selectedInfluencers, setSelectedInfluencers] = useState<Set<string>>(
    new Set()
  );
  const [assignLoading, setAssignLoading] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("");
  const [followersFilter, setFollowersFilter] = useState("all");
  const [dateJoinedFilter, setDateJoinedFilter] = useState("all");
  const [nicheFilter, setNicheFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // All available platforms based on your enum
  const availablePlatforms = [
    "Instagram",
    "X",
    "TikTok",
    "Youtube",
    "Facebook",
    "Linkedin",
    "Threads",
    "Discord",
    "Snapchat",
  ];

  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          return user?.data?.token || null;
        }
        return null;
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        return null;
      }
    }
    return null;
  };

  // Initialize data and find campaign
  useEffect(() => {
    const initializeData = async () => {
      if (!hasInitialized) {
        await fetchData();
      }

      if (!campaignId) {
        router.push("/campaigns");
        return;
      }

      // Find campaign from store
      const foundCampaign = campaigns.find((c) => c._id === campaignId);
      if (foundCampaign) {
        setCampaign(foundCampaign);
        if (foundCampaign.assignedInfluencers) {
          setSelectedInfluencers(new Set(foundCampaign.assignedInfluencers));
        }
      } else if (hasInitialized && campaigns.length > 0) {
        // Campaign not found and data has been loaded
        showToast({
          type: "error",
          title: "Error",
          message: "Campaign not found.",
          duration: 4000,
        });
        router.push("/admin/campaigns");
      }
    };

    initializeData();
  }, [campaignId, campaigns, hasInitialized, fetchData, router, showToast]);

  // Handle store errors
  useEffect(() => {
    if (error) {
      showToast({
        type: "error",
        title: "Error",
        message: error,
        duration: 6000,
      });
      clearError();
    }
  }, [error, showToast, clearError]);

  // Convert store influencers to component format and apply filters
  useEffect(() => {
    if (!influencers || influencers.length === 0) {
      setFilteredInfluencers([]);
      return;
    }

    const convertedInfluencers: Influencer[] = influencers
      .filter((inf) => {
        // Only include approved influencers
        return inf.status === "approved";
      })
      .map((inf) => {
        // Helper function to safely parse follower counts
        const parseFollowers = (
          followers: string | number | undefined | null
        ): number => {
          if (!followers) return 0;
          if (typeof followers === "number") return followers;
          const parsed = parseInt(String(followers).replace(/,/g, ""));
          return isNaN(parsed) ? 0 : parsed;
        };

        // Calculate total followers from all platforms
        const platformFollowers = [
          parseFollowers(inf.instagram?.followers),
          parseFollowers(inf.twitter?.followers),
          parseFollowers(inf.tiktok?.followers),
          parseFollowers(inf.youtube?.followers),
          parseFollowers(inf.facebook?.followers),
          parseFollowers(inf.linkedin?.followers),
          parseFollowers(inf.discord?.followers),
          parseFollowers(inf.threads?.followers),
          parseFollowers(inf.snapchat?.followers),
        ];

        const totalFollowers = platformFollowers.reduce(
          (sum, count) => sum + count,
          0
        );

        // Build social media accounts array
        const socialMediaAccounts: SocialMediaAccount[] = [];

        // Helper function to add platform if it has followers
        const addPlatform = (platformName: string, platformData: any) => {
          if (
            platformData?.followers &&
            parseFollowers(platformData.followers) > 0
          ) {
            socialMediaAccounts.push({
              platform: platformName,
              username: platformData.url || platformData.username || "",
              followerCount: parseFollowers(platformData.followers),
              verified: false,
            });
          }
        };

        // Add all platforms
        addPlatform("Instagram", inf.instagram);
        addPlatform("X", inf.twitter);
        addPlatform("TikTok", inf.tiktok);
        addPlatform("Youtube", inf.youtube);
        addPlatform("Facebook", inf.facebook);
        addPlatform("Linkedin", inf.linkedin);
        addPlatform("Discord", inf.discord);
        addPlatform("Threads", inf.threads);
        addPlatform("Snapchat", inf.snapchat);

        // Split name into first and last name
        const nameParts = (inf.name || "Unknown User").split(" ");
        const firstName = nameParts[0] || "Unknown";
        const lastName = nameParts.slice(1).join(" ") || "";

        return {
          _id: inf._id || inf.id,
          firstName,
          lastName,
          email: inf.email || "",
          phone: inf.phone || "",
          location: inf.location || "",
          bio: inf.bio || "",
          profileImage: inf.profileImage || inf.avatar,
          socialMediaAccounts,
          totalFollowers: inf.followersCount || totalFollowers,
          averageEngagement: inf.averageEngagement || 0,
          niche: Array.isArray(inf.niches) ? inf.niches : [],
          isVerified: inf.isVerified || false,
          rating: inf.rating || 4,
          completedCampaigns: inf.completedCampaigns || 0,
          joinedDate: inf.createdAt || inf.joinDate || new Date().toISOString(),
          isActive: inf.status === "approved",
        };
      });

    // Apply filters
    let filtered = convertedInfluencers.filter((influencer) => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        influencer.firstName.toLowerCase().includes(searchLower) ||
        influencer.lastName.toLowerCase().includes(searchLower) ||
        influencer.email.toLowerCase().includes(searchLower) ||
        influencer.location.toLowerCase().includes(searchLower) ||
        influencer.niche.some((n) => n.toLowerCase().includes(searchLower));

      // Platform filter
      const matchesPlatform =
        platformFilter === "all" ||
        influencer.socialMediaAccounts.some(
          (account) =>
            account.platform.toLowerCase() === platformFilter.toLowerCase()
        );

      // Location filter (now supports typing/searching)
      const matchesLocation =
        !locationFilter ||
        influencer.location
          .toLowerCase()
          .includes(locationFilter.toLowerCase());

      // Followers filter
      let matchesFollowers = true;
      if (followersFilter !== "all") {
        const totalFollowers = influencer.totalFollowers;
        switch (followersFilter) {
          case "1k-3k":
            matchesFollowers = totalFollowers >= 1000 && totalFollowers <= 3000;
            break;
          case "3k-10k":
            matchesFollowers =
              totalFollowers >= 3000 && totalFollowers <= 10000;
            break;
          case "10k-20k":
            matchesFollowers =
              totalFollowers >= 10000 && totalFollowers <= 20000;
            break;
          case "20k-50k":
            matchesFollowers =
              totalFollowers >= 20000 && totalFollowers <= 50000;
            break;
          case "50k+":
            matchesFollowers = totalFollowers >= 50000;
            break;
        }
      }

      // Date joined filter
      let matchesDateJoined = true;
      if (dateJoinedFilter !== "all") {
        const joinedDate = new Date(influencer.joinedDate);
        const now = new Date();
        const monthsAgo = new Date();
        monthsAgo.setMonth(now.getMonth() - parseInt(dateJoinedFilter));
        matchesDateJoined = joinedDate >= monthsAgo;
      }

      // Niche filter
      const matchesNiche =
        nicheFilter === "all" ||
        influencer.niche.some(
          (n) => n.toLowerCase() === nicheFilter.toLowerCase()
        );

      return (
        matchesSearch &&
        matchesPlatform &&
        matchesLocation &&
        matchesFollowers &&
        matchesDateJoined &&
        matchesNiche &&
        influencer.isActive
      );
    });

    // Sort by rating and total followers
    filtered.sort((a, b) => {
      if (a.rating !== b.rating) return b.rating - a.rating;
      return b.totalFollowers - a.totalFollowers;
    });

    setFilteredInfluencers(filtered);
  }, [
    influencers,
    searchTerm,
    platformFilter,
    locationFilter,
    followersFilter,
    dateJoinedFilter,
    nicheFilter,
  ]);

  const handleInfluencerSelect = (influencerId: string) => {
    const newSelected = new Set(selectedInfluencers);

    if (newSelected.has(influencerId)) {
      newSelected.delete(influencerId);
    } else {
      // Check if we haven't exceeded the maximum number of influencers
      if (campaign && newSelected.size < campaign.influencersMax) {
        newSelected.add(influencerId);
      } else {
        showToast({
          type: "warning",
          title: "Maximum Reached",
          message: `You can only assign up to ${campaign?.influencersMax} influencers to this campaign.`,
          duration: 4000,
        });
        return;
      }
    }

    setSelectedInfluencers(newSelected);
  };

  const handleAssignInfluencers = async () => {
    if (!campaignId || selectedInfluencers.size === 0) return;

    if (selectedInfluencers.size < (campaign?.influencersMin || 0)) {
      showToast({
        type: "warning",
        title: "Minimum Not Met",
        message: `Please select at least ${campaign?.influencersMin} influencers.`,
        duration: 4000,
      });
      return;
    }

    const token = getAuthToken();
    if (!token) {
      showToast({
        type: "error",
        title: "Authentication Error",
        message: "Please log in to assign influencers.",
        duration: 4000,
      });
      return;
    }

    setAssignLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/campaigns/${campaignId}/assign`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            influencerIds: Array.from(selectedInfluencers),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to assign influencers");
      }

      showToast({
        type: "success",
        title: "Success!",
        message:
          data.message ||
          `${selectedInfluencers.size} influencers have been assigned to the campaign.`,
        duration: 6000,
      });

      // Refresh data to get updated campaign info
      await fetchData();

      // Navigate back to campaigns list
      router.push("/admin/campaigns");
    } catch (error: any) {
      console.error("Error assigning influencers:", error);
      showToast({
        type: "error",
        title: "Assignment Failed",
        message:
          error.message || "Failed to assign influencers. Please try again.",
        duration: 6000,
      });
    } finally {
      setAssignLoading(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return <FaInstagram className="text-pink-600" />;
      case "facebook":
        return <FaFacebook className="text-blue-600" />;
      case "tiktok":
        return <FaTiktok className="text-black" />;
      case "youtube":
        return <FaYoutube className="text-red-600" />;
      case "x":
      case "twitter":
        return <FaTwitter className="text-blue-400" />;
      case "linkedin":
        return <FaLinkedin className="text-blue-700" />;
      case "snapchat":
        return <FaSnapchat className="text-yellow-400" />;
      case "discord":
        return <FaDiscord className="text-indigo-600" />;
      case "threads":
        return (
          <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
        );
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const getUniqueNiches = () => {
    const niches = filteredInfluencers
      .flatMap((inf) => inf.niche)
      .filter(Boolean);
    return [...new Set(niches)].sort();
  };

  if (loading || !hasInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-red-600 text-lg font-medium">
            Campaign not found
          </div>
          <button
            onClick={() => router.push("/admin/campaigns")}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
          >
            Back to Campaigns
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push("/admin/campaigns")}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <FaArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Assign Influencers
              </h1>
              <p className="text-gray-600 mt-1">
                Campaign:{" "}
                <span className="font-medium">{campaign.brandName}</span>
              </p>
            </div>
          </div>

          {/* Campaign Info */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Location:</span>
                <div className="text-gray-900">
                  {campaign.location || "Any"}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  Required Influencers:
                </span>
                <div className="text-gray-900">
                  {campaign.influencersMin} - {campaign.influencersMax}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Selected:</span>
                <div className="text-gray-900">{selectedInfluencers.size}</div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Platforms:</span>
                <div className="text-gray-900">
                  {campaign.platforms.join(", ")}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  Followers Range:
                </span>
                <div className="text-gray-900">
                  {campaign.followersRange || "Any"}
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4 mb-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search influencers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 ${
                  showFilters
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FaFilter className="w-4 h-4" />
                Filters
              </button>
            </div>

            {/* Filter Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-lg p-6 shadow-sm overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Platform
                      </label>
                      <select
                        value={platformFilter}
                        onChange={(e) => setPlatformFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="all">All Platforms</option>
                        {availablePlatforms.map((platform) => (
                          <option key={platform} value={platform}>
                            {platform}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        placeholder="Type to filter location..."
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Followers
                      </label>
                      <select
                        value={followersFilter}
                        onChange={(e) => setFollowersFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="all">All Followers</option>
                        <option value="1k-3k">1K - 3K</option>
                        <option value="3k-10k">3K - 10K</option>
                        <option value="10k-20k">10K - 20K</option>
                        <option value="20k-50k">20K - 50K</option>
                        <option value="50k+">50K+</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Niche
                      </label>
                      <select
                        value={nicheFilter}
                        onChange={(e) => setNicheFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="all">All Niches</option>
                        {getUniqueNiches().map((niche) => (
                          <option key={niche} value={niche}>
                            {niche}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            {filteredInfluencers.length} influencers found
          </p>
          {selectedInfluencers.size > 0 && (
            <button
              onClick={handleAssignInfluencers}
              disabled={
                assignLoading ||
                selectedInfluencers.size < (campaign.influencersMin || 0)
              }
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              {assignLoading
                ? "Assigning..."
                : `Assign ${selectedInfluencers.size} Influencers`}
            </button>
          )}
        </div>

        {/* Influencers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInfluencers.map((influencer) => {
            const isSelected = selectedInfluencers.has(influencer._id);

            return (
              <div
                key={influencer._id}
                className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${
                  isSelected ? "ring-2 ring-indigo-500 border-indigo-500" : ""
                }`}
                onClick={() => handleInfluencerSelect(influencer._id)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {influencer.profileImage ? (
                        <Image
                          src={influencer.profileImage}
                          alt={`${influencer.firstName} ${influencer.lastName}`}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {influencer.firstName[0]}
                            {influencer.lastName[0] ||
                              influencer.firstName[1] ||
                              ""}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {influencer.firstName} {influencer.lastName}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {influencer.location}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`p-2 rounded-full ${
                        isSelected ? "bg-indigo-600" : "bg-gray-100"
                      }`}
                    >
                      {isSelected ? (
                        <FaCheck className="w-4 h-4 text-white" />
                      ) : (
                        <div className="w-4 h-4" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Social Media Accounts */}
                    <div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {influencer.socialMediaAccounts
                          .slice(0, 4)
                          .map((account, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-1 text-sm"
                            >
                              {getPlatformIcon(account.platform)}
                              <span className="text-gray-700">
                                {formatFollowers(account.followerCount)}
                              </span>
                            </div>
                          ))}
                      </div>
                      <div className="text-sm text-gray-600">
                        Total:{" "}
                        <span className="font-medium">
                          {formatFollowers(influencer.totalFollowers)} followers
                        </span>
                      </div>
                    </div>

                    {/* Niches */}
                    {influencer.niche.length > 0 && (
                      <div>
                        <span className="text-gray-600 text-sm">Niches:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {influencer.niche.slice(0, 3).map((niche, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {niche}
                            </span>
                          ))}
                          {influencer.niche.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              +{influencer.niche.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Bio */}
                    {influencer.bio && (
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {influencer.bio}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredInfluencers.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">
              No influencers found
            </div>
            <p className="text-gray-600">
              {influencers.length === 0
                ? "No influencers available in the system."
                : "Try adjusting your search criteria or filters."}
            </p>
            {influencers.length > 0 && (
              <p className="text-gray-500 text-sm mt-2">
                Note: Only approved influencers are shown for assignment.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InfluencerAssignment;
