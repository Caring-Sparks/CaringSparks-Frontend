// utils/calculations.ts

export interface BrandData {
  role: string;
  platforms: string[];
  brandName: string;
  email?: string;
  brandPhone: string;
  influencersMin: number;
  influencersMax: number;
  followersRange: string;
  location: string;
  additionalLocations: string[];
  postFrequency: string;
  postDuration: string;
}

export interface InfluencerData {
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  location: string;
  niches: string[];
  audienceLocation: string;
  malePercentage: string;
  femalePercentage: string;
  audienceProof: File | null;
  [key: string]: string | string[] | File | null | PlatformData;
}

export type PlatformData = {
  followers: string;
  url: string;
  impressions: string;
  proof: File | null;
};

export interface BrandQuotation {
  avgInfluencers: number;
  postCount: number;
  costPerInfluencerPerPost: number;
  totalBaseCost: number;
  platformFee: number;
  totalCost: number;
}

export interface InfluencerEarnings {
  followerFee: number;
  impressionFee: number;
  locationFee: number;
  nicheFee: number;
  earningsPerPost: number;
  earningsPerPostNaira: number;
  maxMonthlyEarnings: number;
  maxMonthlyEarningsNaira: number;
  followersCount: number;
}

// Brand calculation function
export const calculateBrandQuotation = (brandData: BrandData): BrandQuotation => {
  const avgInfluencers = Math.ceil(
    (brandData.influencersMin + brandData.influencersMax) / 2
  );

  const postCount = brandData.postFrequency.includes("15 posts") ? 15 : 12;

  const followerPricing = {
    "1k-3k": 2,
    "3k-10k": 3,
    "10k-20k": 5,
    "20k-50k": 8,
    "50k & above": 10,
  };

  const durationPricing = {
    "1 day": 1,
    "1 week": 1.5,
    "2 weeks": 2,
    "1 month": 2.5,
  };

  const baseRate =
    followerPricing[brandData.followersRange as keyof typeof followerPricing] || 5;
  const durationMultiplier =
    durationPricing[brandData.postDuration as keyof typeof durationPricing] || 1.5;

  const costPerInfluencerPerPost = baseRate * durationMultiplier * 1000;
  const totalBaseCost = avgInfluencers * postCount * costPerInfluencerPerPost;
  const platformFee = totalBaseCost * 0.2;
  const totalCost = totalBaseCost + platformFee;

  return {
    avgInfluencers,
    postCount,
    costPerInfluencerPerPost,
    totalBaseCost,
    platformFee,
    totalCost,
  };
};

// Influencer calculation function
export const calculateInfluencerEarnings = (influencerData: InfluencerData): InfluencerEarnings => {
  // Get platform data for calculations
  const allPlatforms = [
    { name: "Instagram", key: "instagram" },
    { name: "Twitter / X", key: "twitter" },
    { name: "TikTok", key: "tiktok" },
    { name: "YouTube", key: "youtube" },
  ];

  // Dynamically get the first platform's followers count to calculate earnings
  const firstPlatformKey = Object.keys(influencerData).find((key) =>
    allPlatforms.some((p) => p.key === key)
  );

  // Fallback to 0 if no platform data exists
  const followersCount = firstPlatformKey
    ? Number.parseInt((influencerData[firstPlatformKey] as PlatformData).followers) || 0
    : 0;

  let followerFee = 2;
  if (followersCount >= 50000) {
    followerFee = 8;
  } else if (followersCount >= 20000) {
    followerFee = 7;
  } else if (followersCount >= 10000) {
    followerFee = 5;
  } else if (followersCount >= 3000) {
    followerFee = 4;
  } else if (followersCount >= 1000) {
    followerFee = 2;
  }

  const impressionFee = 1;

  const location = (influencerData.location || "").toLowerCase();
  const isAfricaOrAsia =
    location.includes("nigeria") ||
    location.includes("ghana") ||
    location.includes("kenya") ||
    location.includes("south africa") ||
    location.includes("africa") ||
    location.includes("egypt") ||
    location.includes("morocco") ||
    location.includes("china") ||
    location.includes("india") ||
    location.includes("japan") ||
    location.includes("korea") ||
    location.includes("thailand") ||
    location.includes("singapore") ||
    location.includes("malaysia") ||
    location.includes("indonesia") ||
    location.includes("philippines") ||
    location.includes("vietnam") ||
    location.includes("asia");

  const locationFee = isAfricaOrAsia ? 1.5 : 2.5;
  const nicheFee = 1.5;

  const earningsPerPost = followerFee * impressionFee * locationFee * nicheFee;
  const earningsPerPostNaira = earningsPerPost * 1485;
  const maxMonthlyEarnings = earningsPerPost * 10;
  const maxMonthlyEarningsNaira = maxMonthlyEarnings * 1485;

  return {
    followerFee,
    impressionFee,
    locationFee,
    nicheFee,
    earningsPerPost,
    earningsPerPostNaira,
    maxMonthlyEarnings,
    maxMonthlyEarningsNaira,
    followersCount,
  };
};