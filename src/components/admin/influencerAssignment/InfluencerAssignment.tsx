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
  FaDiscord,
} from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/utils/ToastNotification";
import Image from "next/image";
import { BsThreads } from "react-icons/bs";
import { Country, State, City } from "country-state-city";

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

interface AssignedInfluencer {
  _id: string;
  influencerId: string;
  acceptanceStatus: "pending" | "accepted" | "declined";
  assignedAt: Date;
  respondedAt?: Date;
  isCompleted: boolean;
  completedAt?: Date;
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
  assignedInfluencers?: AssignedInfluencer[];
}

const InfluencerAssignment: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("campaignId");
  const { showToast } = useToast();

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
  const [locationCountry, setLocationCountry] = useState("");
  const [locationState, setLocationState] = useState("");
  const [locationCity, setLocationCity] = useState("");
  const [locationStates, setLocationStates] = useState<any[]>([]);
  const [locationCities, setLocationCities] = useState<any[]>([]);
  const [followersFilter, setFollowersFilter] = useState("all");
  const [nicheFilter, setNicheFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

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

  const countries = Country.getAllCountries();

  // Location filter handlers
  const handleLocationCountryChange = (countryCode: string) => {
    setLocationCountry(countryCode);
    setLocationState("");
    setLocationCity("");

    if (countryCode) {
      const countryStates = State.getStatesOfCountry(countryCode);
      setLocationStates(countryStates);
      setLocationCities([]);
    } else {
      setLocationStates([]);
      setLocationCities([]);
    }
  };

  const handleLocationStateChange = (stateCode: string) => {
    setLocationState(stateCode);
    setLocationCity("");

    if (stateCode && locationCountry) {
      const stateCities = City.getCitiesOfState(locationCountry, stateCode);
      setLocationCities(stateCities);
    } else {
      setLocationCities([]);
    }
  };

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

  const getAssignedInfluencerIds = (
    assignedInfluencers?: (AssignedInfluencer | string)[]
  ): string[] => {
    if (!assignedInfluencers || !Array.isArray(assignedInfluencers)) {
      return [];
    }

    return assignedInfluencers
      .map((item: any) => {
        if (typeof item === "string") {
          return item;
        }
        return item.influencerId?._id || item.influencerId || item._id;
      })
      .filter(Boolean);
  };

  useEffect(() => {
    const initializeData = async () => {
      if (!hasInitialized) {
        await fetchData();
      }

      if (!campaignId) {
        router.push("/admin/campaigns");
        return;
      }

      const foundCampaign = campaigns.find((c) => c._id === campaignId);
      if (foundCampaign) {
        setCampaign(foundCampaign);
        const assignedIds = getAssignedInfluencerIds(
          foundCampaign.assignedInfluencers
        );
        setSelectedInfluencers(new Set(assignedIds));
      } else if (hasInitialized && campaigns.length > 0) {
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

  useEffect(() => {
    if (!influencers || influencers.length === 0) {
      setFilteredInfluencers([]);
      return;
    }

    const convertedInfluencers: Influencer[] = influencers
      .filter((inf) => inf.status === "approved")
      .map((inf) => {
        const parseFollowers = (
          followers: string | number | undefined | null
        ): number => {
          if (!followers) return 0;
          if (typeof followers === "number") return followers;
          const parsed = parseInt(String(followers).replace(/,/g, ""));
          return isNaN(parsed) ? 0 : parsed;
        };

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
        const socialMediaAccounts: SocialMediaAccount[] = [];

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

        addPlatform("Instagram", inf.instagram);
        addPlatform("X", inf.twitter);
        addPlatform("TikTok", inf.tiktok);
        addPlatform("Youtube", inf.youtube);
        addPlatform("Facebook", inf.facebook);
        addPlatform("Linkedin", inf.linkedin);
        addPlatform("Discord", inf.discord);
        addPlatform("Threads", inf.threads);
        addPlatform("Snapchat", inf.snapchat);

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

    let filtered = convertedInfluencers.filter((influencer) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        influencer.firstName.toLowerCase().includes(searchLower) ||
        influencer.lastName.toLowerCase().includes(searchLower) ||
        influencer.email.toLowerCase().includes(searchLower) ||
        influencer.location.toLowerCase().includes(searchLower) ||
        influencer.niche.some((n) => n.toLowerCase().includes(searchLower));

      const matchesPlatform =
        platformFilter === "all" ||
        influencer.socialMediaAccounts.some(
          (account) =>
            account.platform.toLowerCase() === platformFilter.toLowerCase()
        );

      // Location filter with dropdowns
      let matchesLocation = true;
      if (locationCountry) {
        const country = countries.find((c) => c.isoCode === locationCountry);
        if (country) {
          matchesLocation = influencer.location
            .toLowerCase()
            .includes(country.name.toLowerCase());
        }
      }
      if (locationState && matchesLocation) {
        const state = locationStates.find((s) => s.isoCode === locationState);
        if (state) {
          matchesLocation = influencer.location
            .toLowerCase()
            .includes(state.name.toLowerCase());
        }
      }
      if (locationCity && matchesLocation) {
        matchesLocation = influencer.location
          .toLowerCase()
          .includes(locationCity.toLowerCase());
      }

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
        matchesNiche &&
        influencer.isActive
      );
    });

    filtered.sort((a, b) => {
      if (a.rating !== b.rating) return b.rating - a.rating;
      return b.totalFollowers - a.totalFollowers;
    });

    setFilteredInfluencers(filtered);
  }, [
    influencers,
    searchTerm,
    platformFilter,
    locationCountry,
    locationState,
    locationCity,
    followersFilter,
    nicheFilter,
    countries,
    locationStates,
  ]);

  const handleInfluencerSelect = (influencerId: string) => {
    const newSelected = new Set(selectedInfluencers);

    if (newSelected.has(influencerId)) {
      // Allow deselection
      newSelected.delete(influencerId);
    } else {
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
    if (!campaignId) return;

    const currentlyAssignedIds = getAssignedInfluencerIds(
      campaign?.assignedInfluencers
    );
    const selectedArray = Array.from(selectedInfluencers);
    const newInfluencerIds = selectedArray.filter(
      (id) => !currentlyAssignedIds.includes(id)
    );
    const removedInfluencerIds = currentlyAssignedIds.filter(
      (id) => !selectedArray.includes(id)
    );

    if (newInfluencerIds.length === 0 && removedInfluencerIds.length === 0) {
      showToast({
        type: "warning",
        title: "No Changes",
        message: "No changes detected in influencer assignments.",
        duration: 4000,
      });
      return;
    }

    const token = getAuthToken();
    if (!token) {
      showToast({
        type: "error",
        title: "Authentication Error",
        message: "Please log in to manage influencer assignments.",
        duration: 4000,
      });
      return;
    }

    setAssignLoading(true);
    try {
      // Handle additions
      if (newInfluencerIds.length > 0) {
        const addResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/campaigns/${campaignId}/assign`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ influencerIds: newInfluencerIds }),
          }
        );

        const addData = await addResponse.json();
        if (!addResponse.ok) {
          throw new Error(addData.message || "Failed to assign influencers");
        }
      }

      // Handle removals
      if (removedInfluencerIds.length > 0) {
        const removeResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/campaigns/${campaignId}/unassign`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ influencerIds: removedInfluencerIds }),
          }
        );

        const removeData = await removeResponse.json();
        if (!removeResponse.ok) {
          throw new Error(removeData.message || "Failed to remove influencers");
        }
      }

      let message = "";
      if (newInfluencerIds.length > 0 && removedInfluencerIds.length > 0) {
        message = `${newInfluencerIds.length} influencer(s) assigned and ${removedInfluencerIds.length} removed.`;
      } else if (newInfluencerIds.length > 0) {
        message = `${newInfluencerIds.length} new influencer(s) assigned.`;
      } else {
        message = `${removedInfluencerIds.length} influencer(s) removed.`;
      }

      showToast({
        type: "success",
        title: "Success!",
        message,
        duration: 6000,
      });

      await fetchData();
      router.push("/admin/campaigns");
    } catch (error: any) {
      console.error("Error managing influencer assignments:", error);
      showToast({
        type: "error",
        title: "Operation Failed",
        message:
          error.message || "Failed to update assignments. Please try again.",
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
        return <BsThreads className="text-white" />;
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

  const getAssignmentSummary = () => {
    const currentlyAssignedIds = getAssignedInfluencerIds(
      campaign?.assignedInfluencers
    );
    const selectedArray = Array.from(selectedInfluencers);
    const newSelections = selectedArray.filter(
      (id) => !currentlyAssignedIds.includes(id)
    );
    const removedSelections = currentlyAssignedIds.filter(
      (id) => !selectedArray.includes(id)
    );

    return {
      currentlyAssigned: currentlyAssignedIds.length,
      newSelections: newSelections.length,
      removedSelections: removedSelections.length,
      totalSelected: selectedInfluencers.size,
      totalAfterAssignment: selectedArray.length,
    };
  };

  if (loading || !hasInitialized) {
    return (
      <div className="min-h-screen bg-black p-6">
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
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-red-600 text-lg font-medium">
            Campaign not found
          </div>
          <button
            onClick={() => router.push("/admin/campaigns")}
            className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
          >
            Back to Campaigns
          </button>
        </div>
      </div>
    );
  }

  const assignmentSummary = getAssignmentSummary();
  const hasChanges =
    assignmentSummary.newSelections > 0 ||
    assignmentSummary.removedSelections > 0;

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push("/admin/campaigns")}
              className="p-2 hover:bg-gray-200/20 rounded-lg transition-colors"
            >
              <FaArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Assign Influencers
              </h1>
              <p className="text-white mt-1">
                Campaign:{" "}
                <span className="font-medium">{campaign.brandName}</span>
              </p>
            </div>
          </div>

          <div className="bg-slate-200/20 border-slate-200/10 rounded-lg p-6 shadow-sm mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
              <div>
                <span className="font-medium text-white">Location:</span>
                <div className="text-white">{campaign.location || "Any"}</div>
              </div>
              <div>
                <span className="font-medium text-white">
                  Required Influencers:
                </span>
                <div className="text-white">
                  {campaign.influencersMin} - {campaign.influencersMax}
                </div>
              </div>
              <div>
                <span className="font-medium text-white">
                  Currently Assigned:
                </span>
                <div className="text-white">
                  {assignmentSummary.currentlyAssigned}
                </div>
              </div>
              <div>
                <span className="font-medium text-white">Selected:</span>
                <div className="text-white">
                  {assignmentSummary.totalSelected}
                </div>
              </div>
              <div>
                <span className="font-medium text-white">Changes:</span>
                <div className="text-white">
                  {assignmentSummary.newSelections > 0 && (
                    <span className="text-green-400">
                      +{assignmentSummary.newSelections}
                    </span>
                  )}
                  {assignmentSummary.newSelections > 0 &&
                    assignmentSummary.removedSelections > 0 &&
                    " "}
                  {assignmentSummary.removedSelections > 0 && (
                    <span className="text-red-400">
                      -{assignmentSummary.removedSelections}
                    </span>
                  )}
                  {!hasChanges && <span>None</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-3 text-white w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search influencers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-slate-400 bg-slate-200/20 border border-gray-200/20 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 ${
                  showFilters
                    ? "bg-yellow-500 text-white"
                    : "bg-slate-200/20 text-white hover:bg-gray-50/10"
                }`}
              >
                <FaFilter className="w-4 h-4" />
                Filters
              </button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-slate-200/20 rounded-lg p-6 shadow-sm overflow-hidden"
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-1">
                          Platform
                        </label>
                        <select
                          value={platformFilter}
                          onChange={(e) => setPlatformFilter(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-200/20 border text-white border-gray-200/10 rounded-lg focus:ring-2 focus:ring-yellow-500"
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
                        <label className="block text-sm font-medium text-white mb-1">
                          Followers
                        </label>
                        <select
                          value={followersFilter}
                          onChange={(e) => setFollowersFilter(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-200/20 border text-white border-gray-200/10 rounded-lg focus:ring-2 focus:ring-yellow-500"
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
                        <label className="block text-sm font-medium text-white mb-1">
                          Niche
                        </label>
                        <select
                          value={nicheFilter}
                          onChange={(e) => setNicheFilter(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-200/20 border text-white border-gray-200/10 rounded-lg focus:ring-2 focus:ring-yellow-500"
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

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Location Filter
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">
                            Country
                          </label>
                          <select
                            value={locationCountry}
                            onChange={(e) =>
                              handleLocationCountryChange(e.target.value)
                            }
                            className="w-full px-3 py-2 bg-slate-200/20 border text-white border-gray-200/10 rounded-lg focus:ring-2 focus:ring-yellow-500"
                          >
                            <option value="">All Countries</option>
                            {countries.map((country) => (
                              <option
                                key={country.isoCode}
                                value={country.isoCode}
                              >
                                {country.flag} {country.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs text-gray-400 mb-1">
                            State/Province
                          </label>
                          <select
                            value={locationState}
                            onChange={(e) =>
                              handleLocationStateChange(e.target.value)
                            }
                            disabled={!locationCountry}
                            className="w-full px-3 py-2 bg-slate-200/20 border text-white border-gray-200/10 rounded-lg focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="">All States</option>
                            {locationStates.map((state) => (
                              <option key={state.isoCode} value={state.isoCode}>
                                {state.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs text-gray-400 mb-1">
                            City
                          </label>
                          <select
                            value={locationCity}
                            onChange={(e) => setLocationCity(e.target.value)}
                            disabled={!locationState}
                            className="w-full px-3 py-2 bg-slate-200/20 border text-white border-gray-200/10 rounded-lg focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="">All Cities</option>
                            {locationCities.map((city) => (
                              <option key={city.name} value={city.name}>
                                {city.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <p className="text-white">
            {filteredInfluencers.length} influencers found
          </p>
          {hasChanges && (
            <button
              onClick={handleAssignInfluencers}
              disabled={assignLoading}
              className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-400 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              {assignLoading ? "Saving..." : "Save Changes"}
            </button>
          )}
        </div>

        {hasChanges && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-800 text-sm">
              <div>
                {assignmentSummary.newSelections > 0 && (
                  <span className="font-medium">
                    {assignmentSummary.newSelections} new influencer(s) will be
                    added.
                  </span>
                )}
                {assignmentSummary.newSelections > 0 &&
                  assignmentSummary.removedSelections > 0 &&
                  " "}
                {assignmentSummary.removedSelections > 0 && (
                  <span className="font-medium">
                    {assignmentSummary.removedSelections} influencer(s) will be
                    removed.
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInfluencers.map((influencer) => {
            const isSelected = selectedInfluencers.has(influencer._id);
            const isAlreadyAssigned = getAssignedInfluencerIds(
              campaign?.assignedInfluencers
            ).includes(influencer._id);

            return (
              <div
                key={influencer._id}
                className={`bg-slate-200/20 border-slate-200/10 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer relative ${
                  isSelected ? "ring-2 ring-yellow-500 border-yellow-500" : ""
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
                          width={48}
                          height={48}
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
                        <h3 className="font-semibold text-white">
                          {influencer.firstName} {influencer.lastName}
                        </h3>
                        <p className="text-white text-sm">
                          {influencer.location}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`p-2 rounded-full ${
                        isSelected ? "bg-yellow-500" : "bg-gray-100"
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
                              <span className="text-white">
                                {formatFollowers(account.followerCount)}
                              </span>
                            </div>
                          ))}
                      </div>
                      <div className="text-sm text-white">
                        Total:{" "}
                        <span className="font-medium">
                          {formatFollowers(influencer.totalFollowers)} followers
                        </span>
                      </div>
                    </div>

                    {influencer.niche.length > 0 && (
                      <div>
                        <span className="text-white text-sm">Niches:</span>
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
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredInfluencers.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-white text-lg mb-2">No influencers found</div>
            <p className="text-gray-400">
              {influencers.length === 0
                ? "No influencers available in the system."
                : "Try adjusting your search criteria or filters."}
            </p>
            {influencers.length > 0 && (
              <p className="text-white text-sm mt-2">
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
