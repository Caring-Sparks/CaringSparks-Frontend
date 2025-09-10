"use client";

import type React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  ArrowLeft,
  Camera,
  Envelope,
  FileText,
  InstagramLogo,
  MapPin,
  Phone,
  Star,
  TwitterLogo,
  Upload,
  User,
  Users,
  WhatsappLogo,
  TiktokLogo,
  YoutubeLogo,
  FacebookLogo,
  LinkedinLogo,
  DiscordLogo,
  SnapchatLogo,
} from "phosphor-react";
import { useState, useMemo, useCallback } from "react";
import CampaignSummary from "../extras/CampaignSummary";
import { useAuth } from "@/hooks/useAuth";
import { calculateInfluencerEarnings } from "@/utils/calculations";
import { BsThreads } from "react-icons/bs";

// Country codes data
const countryCodes = [
  { code: "+1", country: "US/CA", flag: "🇺🇸" },
  { code: "+7", country: "RU", flag: "🇷🇺" },
  { code: "+20", country: "EG", flag: "🇪🇬" },
  { code: "+27", country: "ZA", flag: "🇿🇦" },
  { code: "+30", country: "GR", flag: "🇬🇷" },
  { code: "+31", country: "NL", flag: "🇳🇱" },
  { code: "+32", country: "BE", flag: "🇧🇪" },
  { code: "+33", country: "FR", flag: "🇫🇷" },
  { code: "+34", country: "ES", flag: "🇪🇸" },
  { code: "+36", country: "HU", flag: "🇭🇺" },
  { code: "+39", country: "IT", flag: "🇮🇹" },
  { code: "+40", country: "RO", flag: "🇷🇴" },
  { code: "+41", country: "CH", flag: "🇨🇭" },
  { code: "+43", country: "AT", flag: "🇦🇹" },
  { code: "+44", country: "GB", flag: "🇬🇧" },
  { code: "+45", country: "DK", flag: "🇩🇰" },
  { code: "+46", country: "SE", flag: "🇸🇪" },
  { code: "+47", country: "NO", flag: "🇳🇴" },
  { code: "+48", country: "PL", flag: "🇵🇱" },
  { code: "+49", country: "DE", flag: "🇩🇪" },
  { code: "+51", country: "PE", flag: "🇵🇪" },
  { code: "+52", country: "MX", flag: "🇲🇽" },
  { code: "+53", country: "CU", flag: "🇨🇺" },
  { code: "+54", country: "AR", flag: "🇦🇷" },
  { code: "+55", country: "BR", flag: "🇧🇷" },
  { code: "+56", country: "CL", flag: "🇨🇱" },
  { code: "+57", country: "CO", flag: "🇨🇴" },
  { code: "+58", country: "VE", flag: "🇻🇪" },
  { code: "+60", country: "MY", flag: "🇲🇾" },
  { code: "+61", country: "AU", flag: "🇦🇺" },
  { code: "+62", country: "ID", flag: "🇮🇩" },
  { code: "+63", country: "PH", flag: "🇵🇭" },
  { code: "+64", country: "NZ", flag: "🇳🇿" },
  { code: "+65", country: "SG", flag: "🇸🇬" },
  { code: "+66", country: "TH", flag: "🇹🇭" },
  { code: "+81", country: "JP", flag: "🇯🇵" },
  { code: "+82", country: "KR", flag: "🇰🇷" },
  { code: "+84", country: "VN", flag: "🇻🇳" },
  { code: "+86", country: "CN", flag: "🇨🇳" },
  { code: "+90", country: "TR", flag: "🇹🇷" },
  { code: "+91", country: "IN", flag: "🇮🇳" },
  { code: "+92", country: "PK", flag: "🇵🇰" },
  { code: "+93", country: "AF", flag: "🇦🇫" },
  { code: "+94", country: "LK", flag: "🇱🇰" },
  { code: "+95", country: "MM", flag: "🇲🇲" },
  { code: "+98", country: "IR", flag: "🇮🇷" },
  { code: "+212", country: "MA", flag: "🇲🇦" },
  { code: "+213", country: "DZ", flag: "🇩🇿" },
  { code: "+216", country: "TN", flag: "🇹🇳" },
  { code: "+218", country: "LY", flag: "🇱🇾" },
  { code: "+220", country: "GM", flag: "🇬🇲" },
  { code: "+221", country: "SN", flag: "🇸🇳" },
  { code: "+222", country: "MR", flag: "🇲🇷" },
  { code: "+223", country: "ML", flag: "🇲🇱" },
  { code: "+224", country: "GN", flag: "🇬🇳" },
  { code: "+225", country: "CI", flag: "🇨🇮" },
  { code: "+226", country: "BF", flag: "🇧🇫" },
  { code: "+227", country: "NE", flag: "🇳🇪" },
  { code: "+228", country: "TG", flag: "🇹🇬" },
  { code: "+229", country: "BJ", flag: "🇧🇯" },
  { code: "+230", country: "MU", flag: "🇲🇺" },
  { code: "+231", country: "LR", flag: "🇱🇷" },
  { code: "+232", country: "SL", flag: "🇸🇱" },
  { code: "+233", country: "GH", flag: "🇬🇭" },
  { code: "+234", country: "NG", flag: "🇳🇬" },
  { code: "+235", country: "TD", flag: "🇹🇩" },
  { code: "+236", country: "CF", flag: "🇨🇫" },
  { code: "+237", country: "CM", flag: "🇨🇲" },
  { code: "+238", country: "CV", flag: "🇨🇻" },
  { code: "+239", country: "ST", flag: "🇸🇹" },
  { code: "+240", country: "GQ", flag: "🇬🇶" },
  { code: "+241", country: "GA", flag: "🇬🇦" },
  { code: "+242", country: "CG", flag: "🇨🇬" },
  { code: "+243", country: "CD", flag: "🇨🇩" },
  { code: "+244", country: "AO", flag: "🇦🇴" },
  { code: "+245", country: "GW", flag: "🇬🇼" },
  { code: "+246", country: "IO", flag: "🇮🇴" },
  { code: "+248", country: "SC", flag: "🇸🇨" },
  { code: "+249", country: "SD", flag: "🇸🇩" },
  { code: "+250", country: "RW", flag: "🇷🇼" },
  { code: "+251", country: "ET", flag: "🇪🇹" },
  { code: "+252", country: "SO", flag: "🇸🇴" },
  { code: "+253", country: "DJ", flag: "🇩🇯" },
  { code: "+254", country: "KE", flag: "🇰🇪" },
  { code: "+255", country: "TZ", flag: "🇹🇿" },
  { code: "+256", country: "UG", flag: "🇺🇬" },
  { code: "+257", country: "BI", flag: "🇧🇮" },
  { code: "+258", country: "MZ", flag: "🇲🇿" },
  { code: "+260", country: "ZM", flag: "🇿🇲" },
  { code: "+261", country: "MG", flag: "🇲🇬" },
  { code: "+262", country: "RE", flag: "🇷🇪" },
  { code: "+263", country: "ZW", flag: "🇿🇼" },
  { code: "+264", country: "NA", flag: "🇳🇦" },
  { code: "+265", country: "MW", flag: "🇲🇼" },
  { code: "+266", country: "LS", flag: "🇱🇸" },
  { code: "+267", country: "BW", flag: "🇧🇼" },
  { code: "+268", country: "SZ", flag: "🇸🇿" },
  { code: "+269", country: "KM", flag: "🇰🇲" },
];

// Define a type for a social media platform's data
type PlatformData = {
  followers: string;
  url: string;
  impressions: string;
  proof: File | null;
};

// Define the full form data structure
interface InfluencerFormData {
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

type influencerProps = {
  onBack: () => void;
  login: () => void;
};

const PhoneNumberInput: React.FC<{
  name: string;
  placeholder: string;
  icon: React.ComponentType<any>;
  selectedCountryCode: string;
  setSelectedCountryCode: (code: string) => void;
  setFieldValue: (field: string, value: any) => void;
  value: string;
  errors: any;
  touched: any;
}> = ({
  name,
  placeholder,
  icon: Icon,
  selectedCountryCode,
  setSelectedCountryCode,
  setFieldValue,
  value,
  errors,
  touched,
}) => {
  // Extract the number part (strip out country code)
  const localPart = value.startsWith(selectedCountryCode)
    ? value.slice(selectedCountryCode.length)
    : "";

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <Icon className="w-4 h-4" />
        {placeholder} *
      </label>
      <div className="flex">
        <select
          value={selectedCountryCode}
          onChange={(e) => {
            const newCode = e.target.value;
            setSelectedCountryCode(newCode);
            setFieldValue(name, `${newCode}${localPart}`);
          }}
          className="px-3 py-2 bg-gray-100 rounded-l-xl border border-r-0 border-gray-300 text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-w-[100px]"
        >
          {countryCodes.map((country) => (
            <option key={country.code} value={country.code}>
              {country.flag} {country.code}
            </option>
          ))}
        </select>

        <input
          type="tel"
          placeholder="1234567890"
          value={localPart}
          onChange={(e) => {
            const newLocal = e.target.value;
            setFieldValue(name, `${selectedCountryCode}${newLocal}`);
          }}
          className={`flex-1 px-3 py-2 bg-gray-100 rounded-r-xl border border-l-0 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 ${
            errors[name] && touched[name] ? "border-red-500" : "border-gray-300"
          }`}
        />
      </div>
      <ErrorMessage
        name={name}
        component="p"
        className="text-sm text-red-600"
      />
    </div>
  );
};

const Influencerform: React.FC<influencerProps> = ({ onBack, login }) => {
  const { registerInfluencer, loading } = useAuth();

  const [submittedData, setSubmittedData] = useState<InfluencerFormData | null>(
    null
  );
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [formValues, setFormValues] = useState<InfluencerFormData | null>(null);

  // Country code states for phone inputs
  const [phoneCountryCode, setPhoneCountryCode] = useState("+234");
  const [whatsappCountryCode, setWhatsappCountryCode] = useState("+234");

  // Phone number states (without country codes)
  const [phoneNumber, setPhoneNumber] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  const allPlatforms = [
    { name: "Instagram", icon: InstagramLogo, key: "instagram" },
    { name: "Facebook", icon: FacebookLogo, key: "facebook" },
    { name: "Twitter / X", icon: TwitterLogo, key: "twitter" },
    { name: "TikTok", icon: TiktokLogo, key: "tiktok" },
    { name: "YouTube", icon: YoutubeLogo, key: "youtube" },
    { name: "LinkedIn", icon: LinkedinLogo, key: "linkedin" },
    { name: "Discord", icon: DiscordLogo, key: "discord" },
    { name: "Snapchat", icon: SnapchatLogo, key: "snapchat" },
    { name: "Threads", icon: BsThreads, key: "threads" },
  ];

  const { initialValues, validationSchema } = useMemo(() => {
    const coreInitialValues: InfluencerFormData = {
      name: formValues?.name || "",
      email: formValues?.email || "",
      phone: formValues?.phone || "",
      whatsapp: formValues?.whatsapp || "",
      location: formValues?.location || "",
      niches: formValues?.niches || [],
      audienceLocation: formValues?.audienceLocation || "",
      malePercentage: formValues?.malePercentage || "",
      femalePercentage: formValues?.femalePercentage || "",
      audienceProof: formValues?.audienceProof || null,
    };

    const coreSchemaFields: Record<string, Yup.AnySchema> = {
      name: Yup.string().required("Full name is required"),
      email: Yup.string()
        .email("Invalid email format")
        .required("Email is required"),
      phone: Yup.string()
        .matches(/^\+[1-9]\d{1,14}$/, "Invalid phone number format")
        .required("Phone number is required"),
      whatsapp: Yup.string()
        .matches(/^\+[1-9]\d{1,14}$/, "Invalid WhatsApp number format")
        .required("WhatsApp number is required"),
      location: Yup.string().required("Location is required"),
      niches: Yup.array().min(1, "Select at least one niche"),
    };

    const dynamicInitialValues = { ...coreInitialValues };
    const dynamicSchemaFields = { ...coreSchemaFields };

    selectedPlatforms.forEach((platformKey) => {
      const existingPlatformData = formValues?.[platformKey] as PlatformData;
      dynamicInitialValues[platformKey] = existingPlatformData || {
        followers: "",
        url: "",
        impressions: "",
        proof: null,
      };

      dynamicSchemaFields[platformKey] = Yup.object().shape({
        followers: Yup.string().required("Followers count is required"),
        url: Yup.string()
          .url("Invalid URL")
          .required("Account URL is required"),
        impressions: Yup.string().required("Impressions count is required"),
        proof: Yup.mixed().required("Proof is required"),
      });
    });

    const validationSchema = Yup.object(dynamicSchemaFields);

    return { initialValues: dynamicInitialValues, validationSchema };
  }, [selectedPlatforms, formValues]);

  const handlePlatformToggle = useCallback(
    (platformKey: string, currentValues: InfluencerFormData) => {
      // Preserve current form values
      setFormValues(currentValues);

      setSelectedPlatforms((prev) =>
        prev.includes(platformKey)
          ? prev.filter((p) => p !== platformKey)
          : [...prev, platformKey]
      );
    },
    []
  );

  const niches = [
    "Fashion and Lifestyle",
    "Lifestyle",
    "Tech",
    "Food",
    "Travel",
    "Fitness",
    "Beauty",
    "Gaming",
    "Music",
    "Art",
  ];

  const calculateProgress = (values: InfluencerFormData) => {
    const requiredFields = ["name", "email", "phone", "whatsapp", "location"];
    const filledFields = requiredFields.filter(
      (field) => values[field as keyof InfluencerFormData]
    );

    // Use optional chaining `?.` to safely access nested properties
    const filledPlatformFields = selectedPlatforms.filter((key) => {
      const platformData = values[key] as PlatformData;
      return (
        platformData?.followers &&
        platformData?.url &&
        platformData?.impressions &&
        platformData?.proof
      );
    });

    const totalRequired = requiredFields.length + selectedPlatforms.length * 4;
    const totalFilled = filledFields.length + filledPlatformFields.length * 4;

    return (totalFilled / totalRequired) * 100;
  };

  const getFollowersLabel = (platformKey: string) => {
    switch (platformKey) {
      case "facebook":
        return "Followers/Likes count *";
      case "discord":
        return "Server members count *";
      case "linkedin":
        return "Connections/Followers count *";
      default:
        return "Followers count *";
    }
  };

  const getUrlPlaceholder = (platformKey: string) => {
    switch (platformKey) {
      case "facebook":
        return "https://facebook.com/username";
      case "linkedin":
        return "https://linkedin.com/in/username";
      case "discord":
        return "https://discord.gg/serverinvite";
      case "threads":
        return "https://threads.net/@username";
      case "snapchat":
        return "https://snapchat.com/add/username";
      default:
        return `https://${platformKey}.com/username`;
    }
  };

  return (
    <>
      {submittedData ? (
        <CampaignSummary
          data={submittedData}
          onBack={() => {
            setSubmittedData(null);
          }}
          login={login}
          type="influencer"
        />
      ) : (
        <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={async (values, { resetForm }) => {
              const earnings = calculateInfluencerEarnings(values);

              const formData = new FormData();

              formData.append("name", values.name);
              formData.append("email", values.email);
              formData.append("phone", values.phone);
              formData.append("whatsapp", values.whatsapp);
              formData.append("location", values.location);
              formData.append("audienceLocation", values.audienceLocation);
              formData.append(
                "malePercentage",
                values.malePercentage.toString()
              );
              formData.append(
                "femalePercentage",
                values.femalePercentage.toString()
              );

              formData.append("followerFee", earnings.followerFee.toString());
              formData.append(
                "impressionFee",
                earnings.impressionFee.toString()
              );
              formData.append("locationFee", earnings.locationFee.toString());
              formData.append("nicheFee", earnings.nicheFee.toString());
              formData.append(
                "earningsPerPost",
                earnings.earningsPerPost.toString()
              );
              formData.append(
                "earningsPerPostNaira",
                earnings.earningsPerPostNaira.toString()
              );
              formData.append(
                "maxMonthlyEarnings",
                earnings.maxMonthlyEarnings.toString()
              );
              formData.append(
                "maxMonthlyEarningsNaira",
                earnings.maxMonthlyEarningsNaira.toString()
              );
              formData.append(
                "followersCount",
                earnings.followersCount.toString()
              );

              // Append niches (array)
              values.niches.forEach((niche) => {
                formData.append("niches[]", niche);
              });

              // Append audience proof file
              if (values.audienceProof) {
                formData.append("audienceProof", values.audienceProof);
              }

              // Append platform data dynamically - Updated to include all platforms
              [
                "instagram",
                "facebook",
                "twitter",
                "tiktok",
                "youtube",
                "linkedin",
                "discord",
                "snapchat",
                "threads",
              ].forEach((platform) => {
                if (values[platform]) {
                  const platformData = values[platform] as PlatformData;
                  formData.append(
                    `${platform}[followers]`,
                    platformData.followers
                  );
                  formData.append(`${platform}[url]`, platformData.url);
                  formData.append(
                    `${platform}[impressions]`,
                    platformData.impressions
                  );
                  if (platformData.proof) {
                    formData.append(`${platform}[proof]`, platformData.proof);
                  }
                }
              });
              const res = await registerInfluencer(formData);

              if (res) {
                setSubmittedData(values);
                resetForm();
              }
            }}
            enableReinitialize={true}
          >
            {({ values, setFieldValue, errors, touched }) => {
              const progress = calculateProgress(values);

              return (
                <>
                  {/* Action Buttons */}
                  <div className="p-6">
                    <button
                      type="button"
                      onClick={onBack}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <ArrowLeft /> Back
                    </button>
                  </div>

                  {/* Header */}
                  <div className="text-center p-6 border-b border-gray-100">
                    <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                      <Star className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Join as an Influencer
                    </h2>
                    <p className="text-gray-600 mb-4">
                      Get a side income and feel good promoting startups
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Profile Completion</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <Form className="space-y-8">
                      {/* Social Media Accounts Selection */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <Camera className="w-5 h-5" />
                          Social Media Accounts
                        </h3>
                        <p className="text-gray-500 text-sm">
                          Which social media accounts do you have?
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {allPlatforms.map(({ name, icon: Icon, key }) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => handlePlatformToggle(key, values)}
                              className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-all ${
                                selectedPlatforms.includes(key)
                                  ? "bg-indigo-50 border-indigo-400 text-indigo-700"
                                  : "bg-gray-50 border-gray-300 text-gray-500 hover:bg-gray-100"
                              }`}
                            >
                              <Icon className="w-8 h-8 mb-2" />
                              <span className="text-sm font-medium">
                                {name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Dynamically Generated Platform Forms */}
                      {selectedPlatforms.map((platformKey) => {
                        const platform = allPlatforms.find(
                          (p) => p.key === platformKey
                        );
                        if (!platform) return null;
                        const Icon = platform.icon;

                        return (
                          <div
                            key={platformKey}
                            className="border border-gray-200 rounded-lg p-6 space-y-4"
                          >
                            <h4 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                              <Icon className="w-5 h-5" />
                              {platform.name} Account Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                  {getFollowersLabel(platformKey)}
                                </label>
                                <Field
                                  name={`${platformKey}.followers`}
                                  type="number"
                                  min="0"
                                  placeholder="e.g., 10000"
                                  className="w-full px-3 py-2 bg-gray-100 rounded-xl border border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <ErrorMessage
                                  name={`${platformKey}.followers`}
                                  component="p"
                                  className="text-sm text-red-600"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                  Account URL *
                                </label>
                                <Field
                                  name={`${platformKey}.url`}
                                  type="url"
                                  placeholder={getUrlPlaceholder(platformKey)}
                                  className="w-full px-3 py-2 bg-gray-100 rounded-xl border border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <ErrorMessage
                                  name={`${platformKey}.url`}
                                  component="p"
                                  className="text-sm text-red-600"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">
                                {platformKey === "discord"
                                  ? "Last 30 days message interactions *"
                                  : "Last 30 days impressions *"}
                              </label>
                              <Field
                                name={`${platformKey}.impressions`}
                                type="number"
                                min="0"
                                placeholder={
                                  platformKey === "discord"
                                    ? "Total message interactions in the last 30 days"
                                    : "Total impressions in the last 30 days"
                                }
                                className="w-full px-3 py-2 bg-gray-100 rounded-xl border border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              />
                              <ErrorMessage
                                name={`${platformKey}.impressions`}
                                component="p"
                                className="text-sm text-red-600"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Upload className="w-4 h-4" />
                                {platformKey === "discord"
                                  ? "Proof of last 30 days message interactions *"
                                  : "Proof of last 30 days impressions *"}
                              </label>
                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
                                <input
                                  type="file"
                                  accept="image/*,application/pdf"
                                  className="hidden"
                                  id={`${platformKey}-proof`}
                                  onChange={(e) =>
                                    setFieldValue(
                                      `${platformKey}.proof`,
                                      e.target.files?.[0] || null
                                    )
                                  }
                                />
                                <label
                                  htmlFor={`${platformKey}-proof`}
                                  className="cursor-pointer"
                                >
                                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                  <p className="text-sm text-gray-600">
                                    Click to upload or drag and drop
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    PNG, JPG or PDF (max 10MB)
                                  </p>
                                </label>
                              </div>
                              {(() => {
                                const platformData = values[platformKey] as
                                  | PlatformData
                                  | undefined;
                                const proofFile = platformData?.proof;
                                return proofFile ? (
                                  <div className="bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg text-sm">
                                    File uploaded: {proofFile.name}
                                  </div>
                                ) : null;
                              })()}
                              <ErrorMessage
                                name={`${platformKey}.proof`}
                                component="p"
                                className="text-sm text-red-600"
                              />
                            </div>
                          </div>
                        );
                      })}

                      {/* Content Niche */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-500" />I post
                          content about:
                        </label>
                        <Field
                          as="select"
                          name="niches"
                          multiple
                          className="w-full px-4 py-2 rounded-xl border border-gray-300 text-gray-800 placeholder-gray-400 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white hover:border-indigo-400"
                          onChange={(
                            e: React.ChangeEvent<HTMLSelectElement>
                          ) => {
                            const selectedOptions = Array.from(
                              e.target.selectedOptions,
                              (option) => option.value
                            );
                            setFieldValue("niches", selectedOptions);
                          }}
                        >
                          {niches.map((niche) => (
                            <option
                              key={niche}
                              value={niche}
                              className="py-1 px-2 hover:bg-indigo-50 cursor-pointer"
                            >
                              {niche}
                            </option>
                          ))}
                        </Field>

                        <p className="text-xs text-gray-500">
                          Hold{" "}
                          <kbd className="px-1 py-0.5 bg-gray-200 rounded">
                            Ctrl
                          </kbd>{" "}
                          (or{" "}
                          <kbd className="px-1 py-0.5 bg-gray-200 rounded">
                            Cmd
                          </kbd>{" "}
                          on Mac) to select multiple.
                        </p>

                        <ErrorMessage
                          name="niches"
                          component="p"
                          className="text-sm text-red-600"
                        />
                      </div>

                      {/* Location */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          My location: *
                        </label>
                        <Field
                          name="location"
                          type="text"
                          placeholder="City, State, Country"
                          className={`w-full px-3 py-2 bg-gray-100 rounded-xl border border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                            errors.location && touched.location
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                        <ErrorMessage
                          name="location"
                          component="p"
                          className="text-sm text-red-600"
                        />
                      </div>

                      {/* Audience Demographics */}
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          Audience Demographics
                        </h3>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Most of my audience are in:
                          </label>
                          <Field
                            as="textarea"
                            name="audienceLocation"
                            placeholder="Top 3 countries, top 3 towns/cities, top 3 age ranges"
                            rows={4}
                            className="w-full px-3 py-2 bg-gray-100 rounded-xl border border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="text-sm font-medium text-gray-700">
                            My gender audience for last 30 days:
                          </label>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm text-gray-600">
                                Male %
                              </label>
                              <Field
                                name="malePercentage"
                                type="number"
                                min="0"
                                max="100"
                                placeholder="e.g., 45"
                                className="w-full px-3 py-2 bg-gray-100 rounded-xl border border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm text-gray-600">
                                Female %
                              </label>
                              <Field
                                name="femalePercentage"
                                type="number"
                                min="0"
                                max="100"
                                placeholder="e.g., 55"
                                className="w-full px-3 py-2 bg-gray-100 rounded-xl border border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            Upload proof of audience data
                          </label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              className="hidden"
                              id="audience-proof"
                              onChange={(e) =>
                                setFieldValue(
                                  "audienceProof",
                                  e.target.files?.[0] || null
                                )
                              }
                            />
                            <label
                              htmlFor="audience-proof"
                              className="cursor-pointer"
                            >
                              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                              <p className="text-sm text-gray-600">
                                Click to upload or drag and drop
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                PNG, JPG or PDF (max 10MB)
                              </p>
                            </label>
                          </div>
                          {values.audienceProof && (
                            <div className="bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg text-sm">
                              File uploaded: {values.audienceProof.name}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <User className="w-5 h-5" />
                          Contact Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                              Full name *
                            </label>
                            <Field
                              name="name"
                              type="text"
                              placeholder="Enter your full name"
                              className={`w-full px-3 py-2 bg-gray-100 rounded-xl border border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                errors.name && touched.name
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                            <ErrorMessage
                              name="name"
                              component="p"
                              className="text-sm text-red-600"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <Envelope className="w-4 h-4" />
                              Email address *
                            </label>
                            <Field
                              name="email"
                              type="email"
                              placeholder="Enter your email"
                              className={`w-full px-3 py-2 bg-gray-100 rounded-xl border border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                errors.email && touched.email
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                            <ErrorMessage
                              name="email"
                              component="p"
                              className="text-sm text-red-600"
                            />
                          </div>

                          <PhoneNumberInput
                            name="phone"
                            placeholder="Phone Number"
                            icon={Phone}
                            selectedCountryCode={phoneCountryCode}
                            setSelectedCountryCode={setPhoneCountryCode}
                            setFieldValue={setFieldValue}
                            value={values.phone}
                            errors={errors}
                            touched={touched}
                          />

                          <PhoneNumberInput
                            name="whatsapp"
                            placeholder="WhatsApp Number"
                            icon={WhatsappLogo}
                            selectedCountryCode={whatsappCountryCode}
                            setSelectedCountryCode={setWhatsappCountryCode}
                            setFieldValue={setFieldValue}
                            value={values.whatsapp}
                            errors={errors}
                            touched={touched}
                          />
                        </div>
                      </div>

                      {loading ? (
                        <button
                          disabled
                          className="w-full flex justify-center px-4 py-2 bg-indigo-600 opacity-50 text-white rounded-xl hover:cursor-not-allowed"
                        >
                          <div className="loader">
                            <span className="bar"></span>
                            <span className="bar"></span>
                            <span className="bar"></span>
                          </div>
                        </button>
                      ) : (
                        <button
                          type="submit"
                          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Submit Application
                        </button>
                      )}
                    </Form>
                  </div>
                </>
              );
            }}
          </Formik>
        </div>
      )}
    </>
  );
};

export default Influencerform;
