"use client";

import type React from "react";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import * as Yup from "yup";
import {
  ArrowLeft,
  Buildings,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Plus,
  User,
  Users,
  X,
} from "phosphor-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CampaignSummary from "./CampaignSummary";
import { calculateBrandQuotation, type BrandData } from "@/utils/calculations";
import { useBrandStore } from "@/stores/brandStore";
import { useToast } from "@/utils/ToastNotification";

// Campaign interface
interface Campaign {
  _id?: string;
  role: "Brand" | "Business" | "Person" | "Movie" | "Music" | "Other";
  platforms: string[];
  brandName: string;
  email: string;
  brandPhone: string;
  influencersMin: number;
  influencersMax: number;
  followersRange?:
    | ""
    | "1k-3k"
    | "3k-10k"
    | "10k-20k"
    | "20k-50k"
    | "50k & above";
  location: string;
  additionalLocations?: string[];
  postFrequency?: string;
  postDuration?: string;
  avgInfluencers?: number;
  postCount?: number;
  costPerInfluencerPerPost?: number;
  totalBaseCost?: number;
  platformFee?: number;
  totalCost?: number;
  hasPaid?: boolean;
  isValidated?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const validationSchema = Yup.object({
  role: Yup.string().required("Please select your role"),
  platforms: Yup.array().min(1, "Select at least one platform"),
  brandName: Yup.string().required("Brand name is required"),
  brandPhone: Yup.string().required("Phone number is required"),
  influencersMin: Yup.number().min(1, "Minimum must be at least 1"),
  influencersMax: Yup.number().min(1, "Maximum must be at least 1"),
  location: Yup.string().required("Location is required"),
});

type EditCampaignProps = {
  onBack: () => void;
  campaignData: Campaign;
};

const EditCampaign: React.FC<EditCampaignProps> = ({
  onBack,
  campaignData,
}) => {
  const [newLocation, setNewLocation] = useState("");
  const [submittedData, setSubmittedData] = useState<BrandData | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, fetchCampaignsByEmail } = useBrandStore();
  const { showToast } = useToast();

  // Initial values from the campaign data
  const initialValues: BrandData = {
    role: campaignData.role,
    platforms: campaignData.platforms,
    brandName: campaignData.brandName,
    brandPhone: campaignData.brandPhone,
    influencersMin: campaignData.influencersMin,
    influencersMax: campaignData.influencersMax,
    followersRange: campaignData.followersRange || "",
    location: campaignData.location,
    additionalLocations: campaignData.additionalLocations || [],
    postFrequency: campaignData.postFrequency || "",
    postDuration: campaignData.postDuration || "",
  };

  const platforms = ["Instagram", "X", "TikTok"];
  const roles = ["Brand", "Business", "Person", "Movie", "Music", "Other"];
  const followerRanges = [
    "1k-3k",
    "3k-10k",
    "10k-20k",
    "20k-50k",
    "50k & above",
  ];
  const postFrequencies = [
    "5 times per week for 3 weeks = 15 posts in total",
    "3 times per week for 4 weeks = 12 posts in total",
    "2 times per week for 6 weeks = 12 posts in total",
  ];
  const postDurations = ["1 day", "1 week", "2 weeks", "1 month"];

  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          const token = user?.data?.token || user?.token || null;
          return token;
        }
      } catch (err) {
        console.error("Error parsing user token:", err);
      }
    }
    return null;
  };

  const updateCampaign = async (updatedData: any) => {
    if (!campaignData._id) {
      throw new Error("Campaign ID is required for updates");
    }

    try {
      setLoading(true);
      const token = getAuthToken();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/campaigns/${campaignData._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP Error: ${response.status}`);
      }

      showToast({
        type: "success",
        title: "Success!",
        message: "Your campaign has been updated!",
        duration: 6000,
      });

      onBack();
      if (user?.email) {
        fetchCampaignsByEmail(user.email);
      }
      return result;
    } catch (error: any) {
      console.error("Campaign update error:", error);

      let errorMessage =
        "We could not update your campaign. Please try again later.";

      if (
        error.message.includes("401") ||
        error.message.includes("Authentication")
      ) {
        errorMessage = "Please log in to update the campaign.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      showToast({
        type: "error",
        title: "Error!",
        message: errorMessage,
        duration: 6000,
      });

      throw error;
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: any) => {
    try {
      const quotation = calculateBrandQuotation(values);

      const updatedCampaignData = {
        ...values,
        _id: campaignData._id,
        email: campaignData.email, // Preserve email from original
        avgInfluencers: quotation.avgInfluencers,
        postCount: quotation.postCount,
        costPerInfluencerPerPost: quotation.costPerInfluencerPerPost,
        totalBaseCost: quotation.totalBaseCost,
        platformFee: quotation.platformFee,
        totalCost: quotation.totalCost,
        // Preserve existing status fields
        hasPaid: campaignData.hasPaid,
        isValidated: campaignData.isValidated,
        createdAt: campaignData.createdAt,
      };

      const result = await updateCampaign(updatedCampaignData);

      if (result.success) {
        setSubmittedData(values);
      }
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          className="z-50 fixed inset-0 bg-slate-200/20 backdrop-blur-md flex justify-center items-center p-4 lg:p-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onBack}
        >
          <motion.div
            className="relative w-[90%] lg:w-[80%] max-h-[90vh] overflow-y-auto mx-auto bg-white rounded-xl shadow-lg border border-gray-200"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* SUMMARY POPUP */}
            {submittedData ? (
              <CampaignSummary
                data={submittedData}
                onBack={onBack}
                type="brand"
              />
            ) : (
              <>
                {/* Action Buttons */}
                <div className="p-6">
                  <button
                    type="button"
                    onClick={onBack}
                    className="px-4 flex items-center gap-2 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft /> Back
                  </button>
                </div>

                {/* Header */}
                <div className="text-center p-6 border-b border-gray-100">
                  <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                    <Buildings className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Edit Campaign
                  </h2>
                  <p className="text-gray-600">Update your campaign details</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Campaign: {campaignData.brandName}
                  </p>
                </div>

                <div className="p-4">
                  <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={onSubmit}
                    enableReinitialize={true}
                  >
                    {({ values, setFieldValue, errors, touched }) => (
                      <Form className="space-y-6">
                        {/* Role Selection */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <User className="w-4 h-4" />I am a:
                          </label>
                          <Field
                            as="select"
                            name="role"
                            className={`w-full px-3 py-2 bg-gray-100 rounded-xl border border-gray-300 text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                              errors.role && touched.role
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          >
                            <option value="">Select your role...</option>
                            {roles.map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </Field>
                          <ErrorMessage
                            name="role"
                            component="p"
                            className="text-sm text-red-600"
                          />
                        </div>

                        {/* Platform Selection */}
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-gray-700">
                            I want to advertise & promote my brand on:
                          </label>
                          <div className="mt-2 flex items-center gap-4 flex-wrap">
                            {platforms.map((platform) => (
                              <label
                                key={platform}
                                className="flex items-center space-x-3 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={values.platforms.includes(platform)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFieldValue("platforms", [
                                        ...values.platforms,
                                        platform,
                                      ]);
                                    } else {
                                      setFieldValue(
                                        "platforms",
                                        values.platforms.filter(
                                          (p) => p !== platform
                                        )
                                      );
                                    }
                                  }}
                                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <span className="text-sm text-gray-700">
                                  {platform}
                                </span>
                              </label>
                            ))}
                          </div>
                          <ErrorMessage
                            name="platforms"
                            component="p"
                            className="text-sm text-red-600"
                          />
                        </div>

                        {/* Number of Influencers */}
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Number of influencers needed:
                          </label>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm text-gray-600 mb-1">
                                Minimum
                              </label>
                              <Field name="influencersMin">
                                {({ field, meta }: any) => (
                                  <input
                                    {...field}
                                    type="number"
                                    min="1"
                                    step="1"
                                    placeholder="Minimum"
                                    value={field.value || ""}
                                    onChange={(e) => {
                                      const value =
                                        e.target.value === ""
                                          ? ""
                                          : Number(e.target.value);
                                      setFieldValue("influencersMin", value);
                                    }}
                                    className={`w-full px-3 py-2 bg-gray-100 rounded-xl border border-gray-300 text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                      meta.touched && meta.error
                                        ? "border-red-500"
                                        : "border-gray-300"
                                    }`}
                                  />
                                )}
                              </Field>
                              <ErrorMessage
                                name="influencersMin"
                                component="p"
                                className="text-xs text-red-600 mt-1"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600 mb-1">
                                Maximum
                              </label>
                              <Field name="influencersMax">
                                {({ field, meta }: any) => (
                                  <input
                                    {...field}
                                    type="number"
                                    min="1"
                                    step="1"
                                    placeholder="Maximum"
                                    value={field.value || ""}
                                    onChange={(e) => {
                                      const value =
                                        e.target.value === ""
                                          ? ""
                                          : Number(e.target.value);
                                      setFieldValue("influencersMax", value);
                                    }}
                                    className={`w-full px-3 py-2 bg-gray-100 rounded-xl border border-gray-300 text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                      meta.touched && meta.error
                                        ? "border-red-500"
                                        : "border-gray-300"
                                    }`}
                                  />
                                )}
                              </Field>
                              <ErrorMessage
                                name="influencersMax"
                                component="p"
                                className="text-xs text-red-600 mt-1"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Followers Range */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Preferred followers range:
                          </label>
                          <Field
                            as="select"
                            name="followersRange"
                            className="w-full px-3 py-2 bg-gray-100 rounded-xl border border-gray-300 text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="">Select followers range...</option>
                            {followerRanges.map((range) => (
                              <option key={range} value={range}>
                                {range}
                              </option>
                            ))}
                          </Field>
                        </div>

                        {/* Location */}
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Target location:
                          </label>
                          <Field
                            name="location"
                            type="text"
                            placeholder="e.g., Ikeja, Lagos, Nigeria"
                            className={`w-full px-3 py-2 bg-gray-100 rounded-xl border border-gray-300 text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
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

                          {/* Additional Locations */}
                          <FieldArray name="additionalLocations">
                            {({ push, remove }) => (
                              <div className="space-y-2">
                                {values.additionalLocations &&
                                  values.additionalLocations.map(
                                    (loc, index) => (
                                      <div
                                        key={`${loc}-${index}`}
                                        className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg"
                                      >
                                        <span className="flex-1 text-sm">
                                          {loc}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => remove(index)}
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                    )
                                  )}

                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="Add additional location"
                                    value={newLocation}
                                    onChange={(e) =>
                                      setNewLocation(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        const trimmed = newLocation.trim();
                                        if (trimmed) {
                                          push(trimmed);
                                          setNewLocation("");
                                        }
                                      }
                                    }}
                                    className="flex-1 px-3 py-2 bg-gray-100 rounded-xl border border-gray-300 text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const trimmed = newLocation.trim();
                                      if (trimmed) {
                                        push(trimmed);
                                        setNewLocation("");
                                      }
                                    }}
                                    className="px-3 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-xl border border-gray-300 transition-colors"
                                    aria-label="Add location"
                                    title="Add location"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </FieldArray>
                        </div>

                        {/* Posting Frequency */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Posting frequency:
                          </label>
                          <Field
                            as="select"
                            name="postFrequency"
                            className="w-full px-3 py-2 bg-gray-100 rounded-xl border border-gray-300 text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="">
                              Select posting frequency...
                            </option>
                            {postFrequencies.map((freq) => (
                              <option key={freq} value={freq}>
                                {freq}
                              </option>
                            ))}
                          </Field>
                        </div>

                        {/* Post Duration */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Post stays on page for:
                          </label>
                          <Field
                            as="select"
                            name="postDuration"
                            className="w-full px-3 py-2 bg-gray-100 rounded-xl border border-gray-300 text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="">Select duration...</option>
                            {postDurations.map((duration) => (
                              <option key={duration} value={duration}>
                                {duration}
                              </option>
                            ))}
                          </Field>
                        </div>

                        {/* Brand Information - Read Only */}
                        <div className="space-y-4 pt-4 border-t border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Brand Information
                          </h3>
                          <p className="text-sm text-gray-600">
                            Brand information cannot be changed during campaign
                            editing.
                          </p>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                              Brand name
                            </label>
                            <Field
                              name="brandName"
                              type="text"
                              disabled
                              className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-gray-600 cursor-not-allowed"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              Brand phone number
                            </label>
                            <Field
                              name="brandPhone"
                              type="tel"
                              disabled
                              className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-gray-600 cursor-not-allowed"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                            loading
                              ? "bg-indigo-400 cursor-not-allowed"
                              : "bg-indigo-600 hover:bg-indigo-700"
                          } text-white`}
                        >
                          {loading ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Updating Campaign...
                            </div>
                          ) : (
                            "Update Campaign & Recalculate Quotation"
                          )}
                        </button>
                      </Form>
                    )}
                  </Formik>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default EditCampaign;
