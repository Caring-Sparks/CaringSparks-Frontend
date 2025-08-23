"use client";

import type React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useToast } from "@/utils/ToastNotification";
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
} from "phosphor-react";
import { useState, useMemo, useCallback } from "react";
import CampaignSummary from "../extras/CampaignSummary";
import { useAuth } from "@/hooks/useAuth";
import {
  calculateInfluencerEarnings,
  type InfluencerData,
} from "@/utils/calculations";

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

const Influencerform: React.FC<influencerProps> = ({ onBack, login }) => {
  const { registerInfluencer, loading } = useAuth();

  const [submittedData, setSubmittedData] = useState<InfluencerFormData | null>(
    null
  );
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [formValues, setFormValues] = useState<InfluencerFormData | null>(null);

  const allPlatforms = [
    { name: "Instagram", icon: InstagramLogo, key: "instagram" },
    { name: "Facebook", icon: FacebookLogo, key: "facebook" },
    { name: "Twitter / X", icon: TwitterLogo, key: "twitter" },
    { name: "TikTok", icon: TiktokLogo, key: "tiktok" },
    { name: "YouTube", icon: YoutubeLogo, key: "youtube" },
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

    const coreSchemaFields: Record<string, any> = {
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
          onNewSubmission={() => {}}
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

              // Append platform data dynamically - Updated to include Facebook
              ["instagram", "facebook", "twitter", "tiktok", "youtube"].forEach(
                (platform) => {
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
                }
              );
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
              const isFormValid =
                Object.keys(errors).length === 0 &&
                Object.keys(touched).length > 0;

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

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <WhatsappLogo className="w-4 h-4" />
                              WhatsApp number *
                            </label>
                            <Field
                              name="whatsapp"
                              type="tel"
                              placeholder="Enter WhatsApp number"
                              className={`w-full px-3 py-2 bg-gray-100 rounded-xl border border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                errors.whatsapp && touched.whatsapp
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                            <ErrorMessage
                              name="whatsapp"
                              component="p"
                              className="text-sm text-red-600"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              Phone number *
                            </label>
                            <Field
                              name="phone"
                              type="tel"
                              placeholder="Enter phone number"
                              className={`w-full px-3 py-2 bg-gray-100 rounded-xl border border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                errors.phone && touched.phone
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                            <ErrorMessage
                              name="phone"
                              component="p"
                              className="text-sm text-red-600"
                            />
                          </div>
                        </div>
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

                      {/* Social Media Accounts Selection */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <Camera className="w-5 h-5" />
                          Social Media Accounts
                        </h3>
                        <p className="text-gray-500 text-sm">
                          Which social media accounts do you have?
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
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
                                  {platformKey === "facebook"
                                    ? "Followers/Likes count *"
                                    : "Followers count *"}
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
                                  placeholder={
                                    platformKey === "facebook"
                                      ? `https://facebook.com/username`
                                      : `https://${platformKey}.com/username`
                                  }
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
                                Last 30 days impressions *
                              </label>
                              <Field
                                name={`${platformKey}.impressions`}
                                type="number"
                                min="0"
                                placeholder="Total impressions in the last 30 days"
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
                                Proof of last 30 days impressions *
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
