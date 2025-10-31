"use client";

import type React from "react";
import {
  Buildings,
  Envelope,
  Phone,
  Star,
  InstagramLogo,
  TwitterLogo,
  WhatsappLogo,
  CheckCircle,
  ArrowLeft,
  TiktokLogo,
  YoutubeLogo,
  User,
} from "phosphor-react";
import {
  calculateBrandQuotation,
  calculateInfluencerEarnings,
  type BrandData,
  type InfluencerData,
} from "@/utils/calculations";

type PlatformData = {
  followers: string;
  url: string;
  impressions: string;
  proof: File | null;
};

interface CampaignSummaryProps {
  data: BrandData | InfluencerData;
  type: "brand" | "influencer";
  onBack: () => void;
  login: () => void;
}

const allPlatforms = [
  { name: "Instagram", icon: InstagramLogo, key: "instagram" },
  { name: "Twitter / X", icon: TwitterLogo, key: "twitter" },
  { name: "TikTok", icon: TiktokLogo, key: "tiktok" },
  { name: "YouTube", icon: YoutubeLogo, key: "youtube" },
];

const CampaignSummary: React.FC<CampaignSummaryProps> = ({
  data,
  type,
  onBack,
  login,
}) => {
  const isBrandData = (data: object): data is BrandData => type === "brand";

  const quotation = isBrandData(data) ? calculateBrandQuotation(data) : null;
  const earnings = !isBrandData(data)
    ? calculateInfluencerEarnings(data)
    : null;

  return (
    <div className="w-full max-w-4xl mx-auto bg-black rounded-xl shadow-lg border border-slate-200/10">
      {/* Header */}
      <div className="text-center p-6 border-b border-slate-200/10">
        <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-6 h-6 text-yellow-600" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {type === "brand"
            ? "Campaign Summary & Quotation"
            : "Application Summary"}
        </h2>
        <p className="text-white">
          {type === "brand"
            ? "Review your campaign details and estimated costs"
            : "Your influencer application has been submitted successfully"}
        </p>
      </div>

      <div className="p-6 space-y-8">
        {/* Next Steps */}
        <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">
            Next Steps
          </h3>
          {type === "brand" ? (
            <div className="space-y-2 text-yellow-800">
              <p>
                • Your password and registration details have been sent to your
                email. You can use that to access your dashboard.
              </p>
              <p>• Our team will review your campaign requirements</p>
              <p>
                • We&apos;ll match you with suitable influencers within 24-48
                hours
              </p>
              <p>• You&apos;ll receive influencer profiles for approval</p>
              <p>• Campaign launch after final confirmation and payment</p>
            </div>
          ) : (
            <div className="space-y-2 text-yellow-800">
              <p>
                • Your password and registration details have been sent to your
                email. You can use that to access your dashboard.
              </p>
              <p>• Our team will review your application within 24-48 hours</p>
              <p>
                • We&apos;ll verify your social media accounts and audience data
              </p>
              <p>• You&apos;ll receive an email confirmation once approved</p>
              <p>
                • Start receiving campaign opportunities that match your profile
              </p>
            </div>
          )}
        </div>

        {/* Brand Summary */}
        {isBrandData(data) && (
          <>
            {/*Action Button */}
            <div className="grid lg:grid-cols-2 gap-3">
              <button
                onClick={onBack}
                className="px-4 py-2 border border-gray-200/20 text-white rounded-lg hover:bg-gray-50/10 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Form
              </button>
              <button
                onClick={login}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-700 rounded-lg text-white transition-colors flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                Login
              </button>
            </div>
            {/* Campaign Details */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Buildings className="w-5 h-5" />
                Campaign Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Brand Name
                    </label>
                    <p className="text-gray-900 font-medium">
                      {data.brandName}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Role
                    </label>
                    <p className="text-gray-900">{data.role}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Platforms
                    </label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {data.platforms.map((platform) => (
                        <span
                          key={platform}
                          className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Target Location
                    </label>
                    <p className="text-gray-900">{data.location}</p>
                    <p className="text-sm font-medium text-gray-600 mt-2">
                      Additional Locations
                    </p>
                    {data.additionalLocations.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {data.additionalLocations.map((loc, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-sm"
                          >
                            {loc}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Influencers Needed
                    </label>
                    <p className="text-gray-900">
                      {data.influencersMin} - {data.influencersMax} influencers
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Followers Range
                    </label>
                    <p className="text-gray-900">{data.followersRange}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Posting Frequency
                    </label>
                    <p className="text-gray-900">{data.postFrequency}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Post Duration
                    </label>
                    <p className="text-gray-900">{data.postDuration}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="text-base font-semibold text-gray-900 mb-3">
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Envelope className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900">{data.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900">{data.brandPhone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quotation */}
            {quotation && (
              <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                <h3 className="text-lg font-semibold text-yellow-900 mb-4">
                  Campaign Quotation
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="bg-white rounded-lg p-4">
                      <div className="text-2xl font-bold text-yellow-600">
                        {quotation.avgInfluencers}
                      </div>
                      <div className="text-sm text-gray-600">
                        Recommended no of Influencers
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <div className="text-2xl font-bold text-yellow-600">
                        {quotation.postCount}
                      </div>
                      <div className="text-sm text-gray-600">
                        Posts / Influencer
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <div className="text-2xl font-bold text-yellow-600">
                        ₦{quotation.costPerInfluencerPerPost.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        Per Influencer/Post
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 space-y-3">
                    <span className="text-gray-600">Base Campaign Cost: </span>
                    <div className="grid md:grid-cols-2 gap-2">
                      <small className="font-medium text-sm lg:whitespace-nowrap">
                        {quotation.avgInfluencers} influencers x{" "}
                        {quotation.postCount} posts / influencer x ₦
                        {quotation.costPerInfluencerPerPost.toLocaleString()}{" "}
                        per influencer / post:
                      </small>
                      <span className="font-medium grid md:place-items-end">
                        ₦{quotation.totalBaseCost.toLocaleString()}
                      </span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-2">
                      <span className="text-gray-600">Platform Fee (20%):</span>
                      <span className="font-medium grid md:place-items-end">
                        ₦{quotation.platformFee.toLocaleString()}
                      </span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="grid md:grid-cols-2 gap-2 text-lg font-bold">
                        <span className="text-gray-900">
                          Total Campaign Cost:
                        </span>
                        <span className="text-yellow-600 grid md:place-items-end">
                          ₦{quotation.totalCost.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 bg-white rounded-lg p-4">
                    <p className="font-medium mb-2">What&apos;s included:</p>
                    <ul className="space-y-1">
                      <li>• Influencer matching and outreach</li>
                      <li>• Campaign management and monitoring</li>
                      <li>• Content approval workflow</li>
                      <li>• Performance analytics and reporting</li>
                      <li>• Payment processing and protection</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Influencer Summary */}
        {!isBrandData(data) && (
          <>
            {/*Action Button */}
            <div className="grid lg:grid-cols-2 gap-3">
              <button
                onClick={onBack}
                className="px-4 py-2 border border-gray-200/20 text-white rounded-lg hover:bg-gray-50/10 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Form
              </button>
              <button
                onClick={login}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-white transition-colors flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                Login
              </button>
            </div>
            <div className="bg-slate-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5" />
                Influencer Profile
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Full Name
                    </label>
                    <p className="text-gray-900 font-medium">{data.name}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Location
                    </label>
                    <p className="text-gray-900">{data.location}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Content Niches
                    </label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {data.niches.map((niche) => (
                        <span
                          key={niche}
                          className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm"
                        >
                          {niche}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Audience Demographics
                    </label>
                    <p className="text-gray-900">{data.audienceLocation}</p>
                    {data.malePercentage && data.femalePercentage && (
                      <p className="text-sm text-gray-600 mt-1">
                        Male: {data.malePercentage}% | Female:{" "}
                        {data.femalePercentage}%
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {allPlatforms.map((platform) => {
                    const platformData = data[platform.key] as PlatformData;
                    if (platformData && platformData.followers) {
                      const Icon = platform.icon;
                      return (
                        <div key={platform.key}>
                          <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {platform.name}
                          </label>
                          <p className="text-gray-900">
                            {Number.parseInt(
                              platformData.followers
                            ).toLocaleString()}{" "}
                            followers
                          </p>
                          {platformData.impressions && (
                            <p className="text-sm text-gray-600">
                              {Number.parseInt(
                                platformData.impressions
                              ).toLocaleString()}{" "}
                              impressions (30 days)
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="text-base font-semibold text-gray-900 mb-3">
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Envelope className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900">{data.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900">{data.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <WhatsappLogo className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900">{data.whatsapp}</span>
                  </div>
                </div>
              </div>

              {earnings && (
                <div className="bg-yellow-50 rounded-lg p-6 mt-4 border border-yellow-200">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-4">
                    Estimated Earnings
                  </h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                      <div className="bg-white rounded-lg p-4">
                        <div className="text-2xl font-bold text-yellow-600">
                          ${earnings.earningsPerPost.toFixed(2)}
                        </div>
                        <div className="text-lg font-semibold text-gray-800">
                          ₦
                          {Math.round(
                            earnings.earningsPerPostNaira
                          ).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Per Post</div>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <div className="text-2xl font-bold text-yellow-600">
                          ${earnings.maxMonthlyEarnings.toFixed(2)}
                        </div>
                        <div className="text-lg font-semibold text-gray-800">
                          ₦
                          {Math.round(
                            earnings.maxMonthlyEarningsNaira
                          ).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          Monthly Potential (10 posts)
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 space-y-3">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Earnings Breakdown:
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-semibold text-yellow-600">
                            ${earnings.followerFee}
                          </div>
                          <div className="text-gray-600">Follower Fee</div>
                          <div className="text-xs text-gray-500">
                            {earnings.followersCount.toLocaleString()} followers
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-yellow-600">
                            ${earnings.impressionFee}
                          </div>
                          <div className="text-gray-600">Impression Fee</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-yellow-600">
                            ${earnings.locationFee}
                          </div>
                          <div className="text-gray-600">Location Fee</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-yellow-600">
                            ${earnings.nicheFee}
                          </div>
                          <div className="text-gray-600">Niche Fee</div>
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 bg-white rounded-lg p-4">
                      <p className="font-medium mb-2">Based on your profile:</p>
                      <ul className="space-y-1">
                        <li>
                          • You are likely to earn around ₦
                          {Math.round(
                            earnings.earningsPerPostNaira
                          ).toLocaleString()}{" "}
                          or ${earnings.earningsPerPost.toFixed(2)} per post
                        </li>
                        <li>• Potential for up to 10 gigs monthly</li>
                        <li>
                          • Earnings calculated based on followers, location,
                          and niche
                        </li>
                        <li>
                          • If you are open to work with us, your application
                          will be reviewed within 24-48 hours
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CampaignSummary;
