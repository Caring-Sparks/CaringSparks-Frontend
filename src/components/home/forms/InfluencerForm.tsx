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
  Check,
  Plus,
  X,
} from "phosphor-react";
import { useState, useMemo, useCallback, useEffect } from "react";
import CampaignSummary from "../extras/CampaignSummary";
import { useAuth } from "@/hooks/useAuth";
import { calculateInfluencerEarnings } from "@/utils/calculations";
import { Country, State, City } from "country-state-city";

const countryCodes = [
  { code: "+1", country: "US/Canada", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+234", country: "Nigeria", flag: "🇳🇬" },
  { code: "+233", country: "Ghana", flag: "🇬🇭" },
  { code: "+27", country: "South Africa", flag: "🇿🇦" },
  { code: "+254", country: "Kenya", flag: "🇰🇪" },
  { code: "+256", country: "Uganda", flag: "🇺🇬" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+55", country: "Brazil", flag: "🇧🇷" },
  { code: "+52", country: "Mexico", flag: "🇲🇽" },
];

type PlatformData = {
  followers: string;
  url: string;
  impressions: string;
  proof: File | null;
};

interface InfluencerFormData {
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  location: string;
  niches: string[];
  audienceLocation: string;
  audienceLocations: string[];
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
  const [localNumber, setLocalNumber] = useState("");
  const [formattedDisplay, setFormattedDisplay] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  const phoneFormats: any = {
    "+1": {
      mask: "(###) ###-####",
      placeholder: "(555) 123-4567",
      maxLength: 10,
    },
    "+44": { mask: "#### ### ####", placeholder: "7700 900123", maxLength: 10 },
    "+234": {
      mask: "### ### ####",
      placeholder: "803 123 4567",
      maxLength: 10,
    },
    "+233": { mask: "### ### ####", placeholder: "244 123 456", maxLength: 9 },
    "+254": { mask: "### ######", placeholder: "712 123456", maxLength: 9 },
    "+256": { mask: "### ######", placeholder: "712 123456", maxLength: 9 },
    "+91": { mask: "##### #####", placeholder: "98765 43210", maxLength: 10 },
    "+86": {
      mask: "### #### ####",
      placeholder: "138 0013 8000",
      maxLength: 11,
    },
    "+81": { mask: "##-####-####", placeholder: "90-1234-5678", maxLength: 10 },
    "+49": { mask: "### ########", placeholder: "151 12345678", maxLength: 11 },
    "+33": {
      mask: "# ## ## ## ##",
      placeholder: "6 12 34 56 78",
      maxLength: 9,
    },
    "+61": { mask: "### ### ###", placeholder: "412 345 678", maxLength: 9 },
    "+27": { mask: "## ### ####", placeholder: "82 123 4567", maxLength: 9 },
    "+55": {
      mask: "(##) #####-####",
      placeholder: "(11) 98765-4321",
      maxLength: 11,
    },
    "+52": { mask: "### ### ####", placeholder: "222 123 4567", maxLength: 10 },
  };

  const formatPhoneNumber = (value: string, mask: any) => {
    const numbers = value.replace(/\D/g, "");
    let formatted = "";
    let numberIndex = 0;

    for (let i = 0; i < mask.length && numberIndex < numbers.length; i++) {
      if (mask[i] === "#") {
        formatted += numbers[numberIndex];
        numberIndex++;
      } else {
        formatted += mask[i];
      }
    }

    return formatted;
  };

  const validatePhoneNumber = (value: string, countryCode: string) => {
    const format = phoneFormats[countryCode];
    if (!format) return false;

    const numbers = value.replace(/\D/g, "");
    return numbers.length === format.maxLength;
  };

  const currentFormat = phoneFormats[selectedCountryCode];

  useEffect(() => {
    setLocalNumber(value || "");
  }, [value]);

  useEffect(() => {
    if (localNumber && currentFormat) {
      const formatted = formatPhoneNumber(localNumber, currentFormat.mask);
      setFormattedDisplay(formatted);
      setIsValid(validatePhoneNumber(localNumber, selectedCountryCode));
    } else {
      setFormattedDisplay("");
      setIsValid(false);
    }
  }, [localNumber, selectedCountryCode, currentFormat, validatePhoneNumber]);

  const handlePhoneChange = (e: any) => {
    const input = e.target.value;
    const numbers = input.replace(/\D/g, "");

    if (numbers.length <= currentFormat.maxLength) {
      setLocalNumber(numbers);
      setFieldValue(name, numbers);
    }
  };

  const handleCountryChange = (e: any) => {
    const newCode = e.target.value;
    setSelectedCountryCode(newCode);
    setLocalNumber("");
    setFormattedDisplay("");
    setFieldValue(name, "");
    setIsValid(false);
    setIsTouched(false);
  };

  const handleBlur = () => {
    setIsTouched(true);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-white flex items-center gap-2">
        <Icon className="w-4 h-4" />
        {placeholder} *
      </label>

      <div className="flex relative">
        <select
          value={selectedCountryCode}
          onChange={handleCountryChange}
          className="px-3 py-2 bg-slate-200/20 rounded-l-xl border border-r-0 border-slate-200/10 text-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all min-w-[140px]"
        >
          {countryCodes.map((country) => (
            <option key={country.code} value={country.code}>
              {country.flag} {country.code} ({country.country})
            </option>
          ))}
        </select>

        <div className="relative w-full">
          <input
            type="tel"
            placeholder={currentFormat.placeholder}
            value={formattedDisplay}
            onChange={handlePhoneChange}
            onBlur={handleBlur}
            className={`w-full px-3 py-2 bg-slate-200/20 rounded-r-xl border border-slate-200/10 border-l-1 text-gray-400 placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all ${
              (isTouched || touched[name]) && !isValid && localNumber
                ? "border-red-500 focus:ring-red-500"
                : (isTouched || touched[name]) && isValid
                ? "border-green-500 focus:ring-green-500"
                : "border-gray-300"
            }`}
          />
          {(isTouched || touched[name]) && isValid && (
            <Check className="w-5 h-5 text-green-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
          )}
        </div>
      </div>

      {(isTouched || touched[name]) && localNumber && !isValid && (
        <p className="text-sm text-red-600">
          Please enter a valid{" "}
          {countryCodes.find((c) => c.code === selectedCountryCode)?.country}{" "}
          phone number ({currentFormat.maxLength} digits)
        </p>
      )}

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
  const [phoneCountryCode, setPhoneCountryCode] = useState("+234");
  const [whatsappCountryCode, setWhatsappCountryCode] = useState("+234");

  // Location states
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  // Audience location states
  const [audienceCountry, setAudienceCountry] = useState("");
  const [audienceState, setAudienceState] = useState("");
  const [audienceStates, setAudienceStates] = useState<any[]>([]);
  const [audienceCities, setAudienceCities] = useState<any[]>([]);

  const allPlatforms = [
    { name: "Instagram", icon: InstagramLogo, key: "instagram" },
    { name: "Facebook", icon: FacebookLogo, key: "facebook" },
    { name: "Twitter / X", icon: TwitterLogo, key: "twitter" },
    { name: "TikTok", icon: TiktokLogo, key: "tiktok" },
    { name: "YouTube", icon: YoutubeLogo, key: "youtube" },
  ];

  const countries = Country.getAllCountries();

  // Location handlers
  const handleCountryChange = (countryCode: string, setFieldValue: any) => {
    setSelectedCountry(countryCode);
    setSelectedState("");
    setFieldValue("location", "");

    if (countryCode) {
      const countryStates = State.getStatesOfCountry(countryCode);
      setStates(countryStates);
      setCities([]);
    } else {
      setStates([]);
      setCities([]);
    }
  };

  const handleStateChange = (stateCode: string, setFieldValue: any) => {
    setSelectedState(stateCode);
    setFieldValue("location", "");

    if (stateCode && selectedCountry) {
      const stateCities = City.getCitiesOfState(selectedCountry, stateCode);
      setCities(stateCities);
    } else {
      setCities([]);
    }
  };

  const handleCityChange = (cityName: string, setFieldValue: any) => {
    const country = countries.find((c) => c.isoCode === selectedCountry);
    const state = states.find((s) => s.isoCode === selectedState);

    const locationString = `${cityName}, ${state?.name || ""}, ${
      country?.name || ""
    }`;
    setFieldValue("location", locationString);
  };

  // Audience location handlers
  const handleAudienceCountryChange = (countryCode: string) => {
    setAudienceCountry(countryCode);
    setAudienceState("");

    if (countryCode) {
      const countryStates = State.getStatesOfCountry(countryCode);
      setAudienceStates(countryStates);
      setAudienceCities([]);
    } else {
      setAudienceStates([]);
      setAudienceCities([]);
    }
  };

  const handleAudienceStateChange = (stateCode: string) => {
    setAudienceState(stateCode);

    if (stateCode && audienceCountry) {
      const stateCities = City.getCitiesOfState(audienceCountry, stateCode);
      setAudienceCities(stateCities);
    } else {
      setAudienceCities([]);
    }
  };

  const handleAudienceCityAdd = (
    cityName: string,
    setFieldValue: any,
    currentLocations: string[]
  ) => {
    const country = countries.find((c) => c.isoCode === audienceCountry);
    const state = audienceStates.find((s) => s.isoCode === audienceState);

    const locationString = `${cityName}, ${state?.name || ""}, ${
      country?.name || ""
    }`;

    if (!currentLocations.includes(locationString)) {
      const newLocations = [...currentLocations, locationString];
      setFieldValue("audienceLocations", newLocations);

      // Update the audienceLocation field as comma-separated string
      setFieldValue("audienceLocation", newLocations.join("; "));
    }

    // Reset dropdowns
    setAudienceCountry("");
    setAudienceState("");
    setAudienceStates([]);
    setAudienceCities([]);
  };

  const { initialValues, validationSchema } = useMemo(() => {
    const coreInitialValues: InfluencerFormData = {
      name: formValues?.name || "",
      email: formValues?.email || "",
      phone: formValues?.phone || "",
      whatsapp: formValues?.whatsapp || "",
      location: formValues?.location || "",
      niches: formValues?.niches || [],
      audienceLocation: formValues?.audienceLocation || "",
      audienceLocations: formValues?.audienceLocations || [],
      malePercentage: formValues?.malePercentage || "",
      femalePercentage: formValues?.femalePercentage || "",
      audienceProof: formValues?.audienceProof || null,
    };

    const coreSchemaFields: Record<string, Yup.AnySchema> = {
      name: Yup.string().required("Full name is required"),
      email: Yup.string()
        .email("Invalid email format")
        .required("Email is required"),
      phone: Yup.string().required("Phone number is required"),
      whatsapp: Yup.string().required("WhatsApp number is required"),
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
    "Automobile",
    "Fashion and Beauty",
    "Business",
    "Consumer electronics",
    "Entertainment and Pop Culture",
    "Fitness",
    "Sport",
    "Food and Beverages",
    "Health and Wellness",
    "Home goods",
    "Lifestyle and influencer lifestyle",
    "Moms, kids, babies",
    "Non profit",
    "Pets",
    "Retail",
    "Toys and hobbies",
    "Travel and hospitality",
    "Relationships & Advice",
    "Politics & Social Commentary",
    "Real Estate & Interior Design",
    "Tech & Gadgets",
    "AI & Innovation",
    "Gaming & Esports",
    "Finance & Investing",
    "Sustainability & Eco-Living",
    "Education & EdTech",
    "Self-Development & Mental Health",
    "Art & Design",
    "DIY & Crafts",
    "OTHERS",
  ];

  const calculateProgress = (values: InfluencerFormData) => {
    const requiredFields = ["name", "email", "phone", "whatsapp", "location"];
    const filledFields = requiredFields.filter(
      (field) => values[field as keyof InfluencerFormData]
    );

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
        <div className="w-full max-w-4xl mx-auto bg-black rounded-xl shadow-lg border border-slate-200/10">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={async (values, { resetForm }) => {
              const earnings = calculateInfluencerEarnings(values);

              const formData = new FormData();

              formData.append("name", values.name);
              formData.append("email", values.email);
              formData.append("phone", `${phoneCountryCode}${values.phone}`);
              formData.append(
                "whatsapp",
                `${whatsappCountryCode}${values.whatsapp}`
              );
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

              values.niches.forEach((niche) => {
                formData.append("niches[]", niche);
              });
              if (values.audienceProof) {
                formData.append("audienceProof", values.audienceProof);
              }
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
                  <div className="p-6">
                    <button
                      type="button"
                      onClick={onBack}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-200/20 border border-slate-200/10 text-white rounded-lg hover:bg-gray-50/10 transition-colors"
                    >
                      <ArrowLeft /> Back
                    </button>
                  </div>

                  <div className="text-center p-6 border-b border-gray-100">
                    <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                      <Star className="w-6 h-6 text-yellow-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Join as an Influencer
                    </h2>
                    <p className="text-white mb-4">
                      Get a side income and feel good promoting startups
                    </p>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-white">
                        <span>Profile Completion</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-slate-200/10 rounded-full h-2">
                        <div
                          className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <Form className="space-y-8">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                          <Camera className="w-5 h-5" />
                          Social Media Accounts
                        </h3>
                        <p className="text-white text-sm">
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
                                  ? "bg-yellow-50 border-yellow-400 text-yellow-700"
                                  : "bg-slate-200/20 border-slate-200/10 text-white hover:bg-gray-50/10"
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
                            <h4 className="text-base font-semibold text-white flex items-center gap-2">
                              <Icon className="w-5 h-5" />
                              {platform.name} Account Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-white">
                                  {getFollowersLabel(platformKey)}
                                </label>
                                <Field
                                  name={`${platformKey}.followers`}
                                  type="number"
                                  min="0"
                                  placeholder="e.g., 10000"
                                  className="frm"
                                />
                                <ErrorMessage
                                  name={`${platformKey}.followers`}
                                  component="p"
                                  className="text-sm text-red-600"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-white">
                                  Account URL *
                                </label>
                                <Field
                                  name={`${platformKey}.url`}
                                  type="url"
                                  placeholder={getUrlPlaceholder(platformKey)}
                                  className="frm"
                                />
                                <ErrorMessage
                                  name={`${platformKey}.url`}
                                  component="p"
                                  className="text-sm text-red-600"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-white">
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
                                className="frm"
                              />
                              <ErrorMessage
                                name={`${platformKey}.impressions`}
                                component="p"
                                className="text-sm text-red-600"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-white flex items-center gap-2">
                                <Upload className="w-4 h-4" />
                                {platformKey === "discord"
                                  ? "Proof of last 30 days message interactions *"
                                  : "Proof of last 30 days impressions *"}
                              </label>
                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-yellow-400 transition-colors">
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
                                  <p className="text-sm text-white">
                                    Click to upload or drag and drop
                                  </p>
                                  <p className="text-xs text-white mt-1">
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
                                  <div className="bg-yellow-50 text-yellow-700 px-3 py-2 rounded-lg text-sm">
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

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-white flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-500" />I post
                          content about:
                        </label>
                        <Field
                          as="select"
                          name="niches"
                          multiple
                          className="w-full h-[500px] px-4 py-2 rounded-xl border border-slate-200/10 text-gray-400 placeholder-gray-400 shadow-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors bg-slate-200/20 hover:border-yellow-400"
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
                              className="py-1 px-2 hover:bg-yellow-50 cursor-pointer"
                            >
                              {niche}
                            </option>
                          ))}
                        </Field>

                        <p className="text-xs text-white">
                          Hold{" "}
                          <kbd className="px-1 py-0.5 bg-slate-200/20 border border-slate-200/10 rounded">
                            Ctrl
                          </kbd>{" "}
                          (or{" "}
                          <kbd className="px-1 py-0.5 bg-slate-200/20 border border-slate-200/10 rounded">
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

                      <div className="space-y-4">
                        <label className="text-sm font-medium text-white flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          My location: *
                        </label>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-400">
                              Country
                            </label>
                            <select
                              onChange={(e) =>
                                handleCountryChange(
                                  e.target.value,
                                  setFieldValue
                                )
                              }
                              value={selectedCountry}
                              className="frm"
                            >
                              <option value="">Select Country</option>
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

                          <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-400">
                              State/Province
                            </label>
                            <select
                              onChange={(e) =>
                                handleStateChange(e.target.value, setFieldValue)
                              }
                              value={selectedState}
                              disabled={!selectedCountry}
                              className="frm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <option value="">Select State</option>
                              {states.map((state) => (
                                <option
                                  key={state.isoCode}
                                  value={state.isoCode}
                                >
                                  {state.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-400">
                              City
                            </label>
                            <select
                              onChange={(e) =>
                                handleCityChange(e.target.value, setFieldValue)
                              }
                              disabled={!selectedState}
                              className="frm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <option value="">Select City</option>
                              {cities.map((city) => (
                                <option key={city.name} value={city.name}>
                                  {city.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <Field name="location" type="hidden" />

                        {values.location && (
                          <div className="bg-yellow-50 text-yellow-700 px-3 py-2 rounded-lg text-sm">
                            Selected: {values.location}
                          </div>
                        )}

                        <ErrorMessage
                          name="location"
                          component="p"
                          className="text-sm text-red-600"
                        />
                      </div>

                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          Audience Demographics
                        </h3>

                        <div className="space-y-4">
                          <label className="text-sm font-medium text-white">
                            Most of my audience are in:
                          </label>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <label className="text-xs font-medium text-gray-400">
                                Country
                              </label>
                              <select
                                onChange={(e) =>
                                  handleAudienceCountryChange(e.target.value)
                                }
                                value={audienceCountry}
                                className="frm"
                              >
                                <option value="">Select Country</option>
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

                            <div className="space-y-2">
                              <label className="text-xs font-medium text-gray-400">
                                State/Province
                              </label>
                              <select
                                onChange={(e) =>
                                  handleAudienceStateChange(e.target.value)
                                }
                                value={audienceState}
                                disabled={!audienceCountry}
                                className="frm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <option value="">Select State</option>
                                {audienceStates.map((state) => (
                                  <option
                                    key={state.isoCode}
                                    value={state.isoCode}
                                  >
                                    {state.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs font-medium text-gray-400">
                                City
                              </label>
                              <div className="flex gap-2">
                                <select
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      handleAudienceCityAdd(
                                        e.target.value,
                                        setFieldValue,
                                        values.audienceLocations
                                      );
                                      e.target.value = "";
                                    }
                                  }}
                                  disabled={!audienceState}
                                  className="frm disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                                >
                                  <option value="">Select & Add City</option>
                                  {audienceCities.map((city) => (
                                    <option key={city.name} value={city.name}>
                                      {city.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>

                          {values.audienceLocations &&
                            values.audienceLocations.length > 0 && (
                              <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-400">
                                  Selected Audience Locations:
                                </label>
                                <div className="flex flex-wrap gap-2">
                                  {values.audienceLocations.map(
                                    (location, index) => (
                                      <div
                                        key={index}
                                        className="flex items-center gap-2 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-lg text-sm"
                                      >
                                        <span>{location}</span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newLocations =
                                              values.audienceLocations.filter(
                                                (_, i) => i !== index
                                              );
                                            setFieldValue(
                                              "audienceLocations",
                                              newLocations
                                            );
                                            setFieldValue(
                                              "audienceLocation",
                                              newLocations.join("; ")
                                            );
                                          }}
                                          className="text-yellow-800 hover:text-yellow-900"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                          <Field name="audienceLocation" type="hidden" />
                        </div>

                        <div className="space-y-3">
                          <label className="text-sm font-medium text-white">
                            My gender audience for last 30 days:
                          </label>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm text-white">
                                Male %
                              </label>
                              <Field
                                name="malePercentage"
                                type="number"
                                min="0"
                                max="100"
                                placeholder="e.g., 45"
                                className="frm"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm text-white">
                                Female %
                              </label>
                              <Field
                                name="femalePercentage"
                                type="number"
                                min="0"
                                max="100"
                                placeholder="e.g., 55"
                                className="frm"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-white flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            Upload proof of audience data
                          </label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-yellow-400 transition-colors">
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
                              <p className="text-sm text-white">
                                Click to upload or drag and drop
                              </p>
                              <p className="text-xs text-white mt-1">
                                PNG, JPG or PDF (max 10MB)
                              </p>
                            </label>
                          </div>
                          {values.audienceProof && (
                            <div className="bg-yellow-50 text-yellow-700 px-3 py-2 rounded-lg text-sm">
                              File uploaded: {values.audienceProof.name}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                          <User className="w-5 h-5" />
                          Contact Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-white">
                              Full name *
                            </label>
                            <Field
                              name="name"
                              type="text"
                              placeholder="Enter your full name"
                              className={`frm ${
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
                            <label className="text-sm font-medium text-white flex items-center gap-2">
                              <Envelope className="w-4 h-4" />
                              Email address *
                            </label>
                            <Field
                              name="email"
                              type="email"
                              placeholder="Enter your email"
                              className={`frm ${
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
                          className="w-full flex justify-center px-4 py-2 bg-yellow-600 opacity-50 text-white rounded-xl hover:cursor-not-allowed"
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
                          className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-700 transition-colors"
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
