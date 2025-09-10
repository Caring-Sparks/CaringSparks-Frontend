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
import CampaignSummary from "../extras/CampaignSummary";
import { useAuth } from "@/hooks/useAuth";
import { calculateBrandQuotation, type BrandData } from "@/utils/calculations";

const validationSchema = Yup.object({
  role: Yup.string().required("Please select your role"),
  platforms: Yup.array().min(1, "Select at least one platform"),
  brandName: Yup.string().required("Brand name is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  brandPhone: Yup.string().required("Phone number is required"),
  influencersMin: Yup.number().min(1, "Minimum must be at least 1"),
  influencersMax: Yup.number().min(1, "Maximum must be at least 1"),
  location: Yup.string().required("Location is required"),
});

type formProps = {
  onBack: () => void;
  login: () => void;
};

const BrandForm: React.FC<formProps> = ({ onBack, login }) => {
  const [newLocation, setNewLocation] = useState("");
  const [submittedData, setSubmittedData] = useState<BrandData | null>(null);
  const [customFrequency, setCustomFrequency] = useState(false);
  const [customFrequencyValues, setCustomFrequencyValues] = useState<any>({
    postsPerWeek: 1,
    weeks: 1,
  });
  const [selectedCountryCode, setSelectedCountryCode] = useState("+234");
  const { registerBrand, loading } = useAuth();

  const initialValues: BrandData = {
    role: "",
    platforms: [],
    brandName: "",
    email: "",
    brandPhone: "",
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
    "1 time per week for 4 weeks = 4 posts in total",
    "3 times per month for 2 months = 6 posts in total",
    "custom", // Add custom option
  ];

  const postDurations = ["1 day", "1 week", "2 weeks", "1 month"];

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

  const generateCustomFrequencyString = () => {
    const { postsPerWeek, weeks } = customFrequencyValues;
    const totalPosts = postsPerWeek * weeks;
    return `${postsPerWeek} time${
      postsPerWeek > 1 ? "s" : ""
    } per week for ${weeks} week${
      weeks > 1 ? "s" : ""
    } = ${totalPosts} posts in total`;
  };

  return (
    <>
      <div className="w-full mx-auto bg-white rounded-xl shadow-lg border border-gray-200">
        {/* SUMMARY POPUP */}
        {submittedData ? (
          <CampaignSummary
            data={submittedData}
            onBack={() => {
              setSubmittedData(null);
            }}
            login={login}
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
                Brand Registration
              </h2>
              <p className="text-gray-600">
                Connect with influencers and grow your brand reach
              </p>
            </div>

            <div className="p-4">
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={async (values, { resetForm }) => {
                  // Combine country code with phone number for the full phone number
                  const fullPhoneNumber = `${selectedCountryCode}${values.brandPhone}`;

                  // Prepare data for backend - brandPhone will contain the full number including country code
                  const dataForBackend = {
                    ...values,
                    brandPhone: fullPhoneNumber, // Send complete phone number as string
                    postFrequency: customFrequency
                      ? generateCustomFrequencyString()
                      : values.postFrequency, // Ensure custom frequency is sent as string
                  };

                  const quotation = calculateBrandQuotation(dataForBackend);

                  const brandDataWithCalculations = {
                    ...dataForBackend,
                    avgInfluencers: quotation.avgInfluencers,
                    postCount: quotation.postCount,
                    costPerInfluencerPerPost:
                      quotation.costPerInfluencerPerPost,
                    totalBaseCost: quotation.totalBaseCost,
                    platformFee: quotation.platformFee,
                    totalCost: quotation.totalCost,
                  };

                  const res = await registerBrand(brandDataWithCalculations);
                  if (res) {
                    setSubmittedData(dataForBackend);
                    resetForm();
                  }
                }}
              >
                {({ values, setFieldValue, errors, touched }) => (
                  <Form className="space-y-6">
                    {/* Role Selection */}
                    <div className="space-y-2 ">
                      <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <User className="w-4 h-4" />I am a:
                      </label>
                      <Field
                        as="select"
                        name="role"
                        className={`w-full px-3 py-2 bg-gray-100 rounded-xl border border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
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
                              className="w-4 h-4 bg-gray-100 rounded-xl border border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-indigo-500"
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

                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Number of influencers needed:
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-gray-700">Minimum</label>
                          <Field
                            name="influencersMin"
                            type="number"
                            min="1"
                            placeholder="Minimum"
                            className="w-full px-3 py-2 bg-gray-100 rounded-xl border border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-gray-700">Maximum</label>
                          <Field
                            name="influencersMax"
                            type="number"
                            min="1"
                            placeholder="Maximum"
                            className="w-full px-3 py-2 bg-gray-100 rounded-xl border border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                        className="w-full mt-2 px-3 py-2 bg-gray-100 rounded-xl border border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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

                      {/* Additional Locations */}
                      <FieldArray name="additionalLocations">
                        {({ push, remove }) => (
                          <div className="space-y-2">
                            {values.additionalLocations.map((loc, index) => (
                              <div
                                key={`${loc}-${index}`}
                                className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg"
                              >
                                <span className="flex-1 text-sm">{loc}</span>
                                <button
                                  type="button"
                                  onClick={() => remove(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}

                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Add additional location"
                                value={newLocation}
                                onChange={(e) => setNewLocation(e.target.value)}
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
                                className="flex-1 px-3 py-2 bg-gray-100 rounded-xl border border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                                className="px-3 py-2 bg-gray-100 rounded-xl border border-gray-300 text-gray-800 placeholder-gray-400 hover:bg-gray-50"
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
                        className="w-full px-3 py-2 bg-gray-100 rounded-xl border border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        onChange={(e: any) => {
                          const value = e.target.value;
                          setFieldValue("postFrequency", value);
                          setCustomFrequency(value === "custom");
                        }}
                      >
                        <option value="">Select posting frequency...</option>
                        {postFrequencies.map((freq) => (
                          <option key={freq} value={freq}>
                            {freq === "custom" ? "Custom frequency" : freq}
                          </option>
                        ))}
                      </Field>

                      {/* Custom Frequency Options */}
                      {customFrequency && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">
                            Customize your posting schedule:
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            {/* Posts per week */}
                            <div>
                              <label className="text-xs text-gray-600 mb-1 block">
                                Posts per week
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="7"
                                value={customFrequencyValues.postsPerWeek ?? ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  const newValue =
                                    value === "" ? "" : parseInt(value, 10);

                                  setCustomFrequencyValues({
                                    ...customFrequencyValues,
                                    postsPerWeek: newValue,
                                  });

                                  if (
                                    newValue !== "" &&
                                    customFrequencyValues.weeks !== ""
                                  ) {
                                    const updatedFrequency = `${newValue} time${
                                      newValue > 1 ? "s" : ""
                                    } per week for ${
                                      customFrequencyValues.weeks
                                    } week${
                                      customFrequencyValues.weeks > 1 ? "s" : ""
                                    } = ${
                                      newValue * customFrequencyValues.weeks
                                    } posts in total`;

                                    setFieldValue(
                                      "postFrequency",
                                      updatedFrequency
                                    );
                                  }
                                }}
                                className="w-full px-2 py-1 text-sm bg-white rounded border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              />
                            </div>

                            {/* Number of weeks */}
                            <div>
                              <label className="text-xs text-gray-600 mb-1 block">
                                Number of weeks
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="52"
                                value={customFrequencyValues.weeks ?? ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  const newValue =
                                    value === "" ? "" : parseInt(value, 10);

                                  setCustomFrequencyValues({
                                    ...customFrequencyValues,
                                    weeks: newValue,
                                  });

                                  if (
                                    newValue !== "" &&
                                    customFrequencyValues.postsPerWeek !== ""
                                  ) {
                                    const updatedFrequency = `${
                                      customFrequencyValues.postsPerWeek
                                    } time${
                                      customFrequencyValues.postsPerWeek > 1
                                        ? "s"
                                        : ""
                                    } per week for ${newValue} week${
                                      newValue > 1 ? "s" : ""
                                    } = ${
                                      customFrequencyValues.postsPerWeek *
                                      newValue
                                    } posts in total`;

                                    setFieldValue(
                                      "postFrequency",
                                      updatedFrequency
                                    );
                                  }
                                }}
                                className="w-full px-2 py-1 text-sm bg-white rounded border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              />
                            </div>
                          </div>

                          <div className="mt-3 text-sm text-gray-600 bg-white p-2 rounded border">
                            <strong>Preview:</strong>{" "}
                            {generateCustomFrequencyString()}
                          </div>
                        </div>
                      )}
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
                        className="w-full px-3 py-2 bg-gray-100 rounded-xl border border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                      <h3 className="text-lg font-semibold text-gray-900">
                        Brand Information
                      </h3>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Brand name *
                        </label>
                        <Field
                          name="brandName"
                          type="text"
                          placeholder="Enter your brand name"
                          className={`w-full px-3 py-2 bg-gray-100 rounded-xl border border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
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
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Envelope className="w-4 h-4" />
                          Brand email *
                        </label>
                        <Field
                          name="email"
                          type="email"
                          placeholder="Enter your brand email"
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

                      {/* Enhanced Phone Number Field */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Brand phone number *
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={selectedCountryCode}
                            onChange={(e) =>
                              setSelectedCountryCode(e.target.value)
                            }
                            className="px-3 py-2 bg-gray-100 rounded-xl border border-gray-300 text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            style={{ minWidth: "140px" }}
                          >
                            {countryCodes.map((country) => (
                              <option key={country.code} value={country.code}>
                                {country.flag} {country.code} ({country.country}
                                )
                              </option>
                            ))}
                          </select>
                          <Field
                            name="brandPhone"
                            type="tel"
                            placeholder="Enter phone number"
                            className={`flex-1 px-3 py-2 bg-gray-100 rounded-xl border border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                              errors.brandPhone && touched.brandPhone
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          />
                        </div>
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
                        Submit & Get Quotation
                      </button>
                    )}
                  </Form>
                )}
              </Formik>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default BrandForm;
