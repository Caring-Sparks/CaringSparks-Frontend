"use client";

import type React from "react";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import * as Yup from "yup";
import {
  ArrowLeft,
  Buildings,
  Calendar,
  Clock,
  Envelope,
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

const validationSchema = Yup.object({
  role: Yup.string().required("Please select your role"),
  platforms: Yup.array().min(1, "Select at least one platform"),
  brandName: Yup.string().required("Brand name is required"),
  brandPhone: Yup.string().required("Phone number is required"),
  influencersMin: Yup.number().min(1, "Minimum must be at least 1"),
  influencersMax: Yup.number().min(1, "Maximum must be at least 1"),
  location: Yup.string().required("Location is required"),
});

type formProps = {
  onBack: () => void;
};

const NewCampaign: React.FC<formProps> = ({ onBack }) => {
  const [newLocation, setNewLocation] = useState("");
  const [submittedData, setSubmittedData] = useState<BrandData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, fetchCampaignsByEmail } = useBrandStore();
  const { showToast } = useToast();

  const initialValues: BrandData = {
    role: "",
    platforms: [],
    brandName: user?.brandName || "",
    brandPhone: user?.brandPhone || "",
    influencersMin: 1,
    influencersMax: 1,
    followersRange: "",
    location: "",
    additionalLocations: [],
    postFrequency: "",
    postDuration: "",
  };

  const platforms = [
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
  const token = getAuthToken();

  const createCampaign = async (campaignData: BrandData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/campaigns/newCampaign`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // Add this line
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(campaignData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP Error: ${response.status}`);
      }

      showToast({
        type: "success",
        title: "Success!",
        message: "Your new campaign has been created!",
        duration: 6000,
      });

      onBack();
      fetchCampaignsByEmail(user?.email ?? "");
      return result;
    } catch (error: any) {
      console.error("Campaign creation error:", error);

      let errorMessage =
        "We could not create your new campaign. Please try again later.";

      if (
        error.message.includes("401") ||
        error.message.includes("Authentication")
      ) {
        errorMessage = "Please log in to create a campaign.";
        // router.push('/');
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

      const campaignData = {
        ...values,
        avgInfluencers: quotation.avgInfluencers,
        postCount: quotation.postCount,
        costPerInfluencerPerPost: quotation.costPerInfluencerPerPost,
        totalBaseCost: quotation.totalBaseCost,
        platformFee: quotation.platformFee,
        totalCost: quotation.totalCost,
        hasPaid: false,
        isValidated: false,
      };

      const result = await createCampaign(campaignData);

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
          className="z-50 fixed inset-0 bg-black/40 backdrop-blur-2xl flex justify-center items-center p-4 lg:p-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onBack}
        >
          <motion.div
            className="relative w-[90%] lg:w-[80%] max-h-[90vh] overflow-y-auto mx-auto bg-black rounded-xl shadow-lg border border-slate-200/10"
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
                    className="px-4 flex items-center gap-2 py-2 bg-slate-200/20 border border-slate-200/10 text-gray-400 rounded-lg hover:bg-gray-50/10 transition-colors"
                  >
                    <ArrowLeft /> Back
                  </button>
                </div>

                {/* Header */}
                <div className="text-center p-6 border-b border-gray-100">
                  <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                    <Buildings className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-400 mb-2">
                    Create New Campaign
                  </h2>
                  <p className="text-gray-600">
                    Connect with influencers and grow your brand reach
                  </p>
                </div>

                <div className="p-4">
                  <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={onSubmit}
                  >
                    {({ values, setFieldValue, errors, touched }) => (
                      <Form className="space-y-6">
                        {/* Role Selection */}
                        <div className="space-y-2 ">
                          <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                            <User className="w-4 h-4" />I am a:
                          </label>
                          <Field
                            as="select"
                            name="role"
                            className={`frm ${
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
                          <label className="text-sm font-medium text-gray-400">
                            I want to advertise & promote my brand on:
                          </label>
                          <div className="mt-2 flex flex-wrap items-center gap-4">
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
                                  className="w-4 h-4 bg-gray-100 rounded-xl border border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-yellow-500"
                                />
                                <span className="text-sm text-gray-400">
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

                        <div className="space-y-3">
                          <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Number of influencers needed:
                          </label>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-gray-400">Minimum</label>
                              <Field
                                name="influencersMin"
                                type="number"
                                min="1"
                                placeholder="Minimum"
                                className="frm"
                              />
                            </div>
                            <div>
                              <label className="text-gray-400">Maximum</label>
                              <Field
                                name="influencersMax"
                                type="number"
                                min="1"
                                placeholder="Maximum"
                                className="frm"
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
                            className="frm"
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
                          <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Target location:
                          </label>
                          <Field
                            name="location"
                            type="text"
                            placeholder="e.g., Ikeja, Lagos, Nigeria"
                            className={`frm ${
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
                                {values.additionalLocations.map(
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
                                    className="frm"
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
                                    className="px-3 py-2 bg-yellow-100 rounded-xl border border-yellow-300 text-yellow-800 placeholder-yellow-400 hover:bg-yellow-50"
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
                          <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Posting frequency:
                          </label>
                          <Field
                            as="select"
                            name="postFrequency"
                            className="frm"
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
                          <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Post stays on page for:
                          </label>
                          <Field
                            as="select"
                            name="postDuration"
                            className="frm"
                          >
                            <option value="">Select duration...</option>
                            {postDurations.map((duration) => (
                              <option key={duration} value={duration}>
                                {duration}
                              </option>
                            ))}
                          </Field>
                        </div>

                        {/* Brand Information */}
                        <div className="space-y-4 pt-4 border-t border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-400">
                            Brand Information
                          </h3>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">
                              Brand name *
                            </label>
                            <Field
                              name="brandName"
                              type="text"
                              disabled
                              placeholder="Enter your brand name"
                              className={`frm ${
                                errors.brandName && touched.brandName
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                            <ErrorMessage
                              name="brandName"
                              component="p"
                              className="text-sm text-red-600"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              Brand phone number *
                            </label>
                            <Field
                              name="brandPhone"
                              type="tel"
                              disabled
                              placeholder="Enter your phone number"
                              className={`frm ${
                                errors.brandPhone && touched.brandPhone
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                            <ErrorMessage
                              name="brandPhone"
                              component="p"
                              className="text-sm text-red-600"
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
                            className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                          >
                            Create Campaign & Get Quotation
                          </button>
                        )}
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

export default NewCampaign;
