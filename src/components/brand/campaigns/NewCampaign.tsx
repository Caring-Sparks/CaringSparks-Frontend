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
import { City, Country, State } from "country-state-city";

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
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const { showToast } = useToast();
  const [additionalLocationCountry, setAdditionalLocationCountry] =
    useState("");
  const [additionalLocationState, setAdditionalLocationState] = useState("");
  const [additionalLocationStates, setAdditionalLocationStates] = useState<
    any[]
  >([]);
  const [additionalLocationCities, setAdditionalLocationCities] = useState<
    any[]
  >([]);
  const [customFrequency, setCustomFrequency] = useState(false);
  const [customFrequencyValues, setCustomFrequencyValues] = useState<any>({
    postsPerWeek: 1,
    weeks: 1,
  });

  // Add these handler functions
  const handleAdditionalCountryChange = (countryCode: string) => {
    setAdditionalLocationCountry(countryCode);
    setAdditionalLocationState("");

    if (countryCode) {
      const countryStates = State.getStatesOfCountry(countryCode);
      setAdditionalLocationStates(countryStates);
      setAdditionalLocationCities([]);
    } else {
      setAdditionalLocationStates([]);
      setAdditionalLocationCities([]);
    }
  };

  const handleAdditionalStateChange = (stateCode: string) => {
    setAdditionalLocationState(stateCode);

    if (stateCode && additionalLocationCountry) {
      const stateCities = City.getCitiesOfState(
        additionalLocationCountry,
        stateCode
      );
      setAdditionalLocationCities(stateCities);
    } else {
      setAdditionalLocationCities([]);
    }
  };

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

  const platforms = ["Instagram", "X", "TikTok", "Youtube", "Facebook"];
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
    "custom",
  ];
  const postDurations = ["1 day", "1 week", "2 weeks", "1 month"];

  const countries = Country.getAllCountries();

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
            "Content-Type": "application/json",
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

  const generateCustomFrequencyString = () => {
    const { postsPerWeek, weeks } = customFrequencyValues;
    const totalPosts = postsPerWeek * weeks;
    return `${postsPerWeek} time${
      postsPerWeek > 1 ? "s" : ""
    } per week for ${weeks} week${
      weeks > 1 ? "s" : ""
    } = ${totalPosts} posts in total`;
  };

  const onSubmit = async (values: any) => {
    try {
      const dataForBackend = {
        ...values,
        postFrequency: customFrequency
          ? generateCustomFrequencyString()
          : values.postFrequency,
      };
      const quotation = calculateBrandQuotation(values);

      const campaignData = {
        ...dataForBackend,
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
            className="relative w-[90%] lg:w-[70%] max-h-[90vh] no-scrollbar overflow-y-auto mx-auto bg-black rounded-xl shadow-lg border border-slate-200/10"
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
                    className="px-4 flex items-center gap-2 py-2 bg-slate-200/20 border border-slate-200/10 text-white rounded-lg hover:bg-gray-50/10 transition-colors"
                  >
                    <ArrowLeft /> Back
                  </button>
                </div>

                {/* Header */}
                <div className="text-center p-6 border-b border-gray-100">
                  <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                    <Buildings className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Create New Campaign
                  </h2>
                  <p className="text-white">
                    Connect with influencers and grow your brand reach
                  </p>
                </div>

                <div className="p-4">
                  <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={onSubmit}
                  >
                    {({ values, setFieldValue, errors, touched }) => {
                      const handleAdditionalCitySelect = (
                        cityName: string,
                        push: (value: string) => void
                      ) => {
                        const country = countries.find(
                          (c) => c.isoCode === additionalLocationCountry
                        );
                        const state = additionalLocationStates.find(
                          (s) => s.isoCode === additionalLocationState
                        );

                        const locationString = `${cityName}, ${
                          state?.name || ""
                        }, ${country?.name || ""}`;

                        // Check if location already exists
                        if (
                          !values.additionalLocations.includes(locationString)
                        ) {
                          push(locationString);
                        }

                        // Reset the additional location form
                        setAdditionalLocationCountry("");
                        setAdditionalLocationState("");
                        setAdditionalLocationStates([]);
                        setAdditionalLocationCities([]);
                      };
                      return (
                        <Form className="space-y-6">
                          {/* Role Selection */}
                          <div className="space-y-2 ">
                            <label className="text-sm font-medium text-white flex items-center gap-2">
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
                            <label className="text-sm font-medium text-white">
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
                                    checked={values.platforms.includes(
                                      platform
                                    )}
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
                                  <span className="text-sm text-white">
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
                            <label className="text-sm font-medium text-white flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              Number of influencers needed:
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-white">Minimum</label>
                                <Field
                                  name="influencersMin"
                                  type="number"
                                  min="1"
                                  placeholder="Minimum"
                                  className="frm"
                                />
                              </div>
                              <div>
                                <label className="text-white">Maximum</label>
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
                            <label className="text-sm font-medium text-white">
                              Preferred followers range:
                            </label>
                            <Field
                              as="select"
                              name="followersRange"
                              className="frm"
                            >
                              <option value="">
                                Select followers range...
                              </option>
                              {followerRanges.map((range) => (
                                <option key={range} value={range}>
                                  {range}
                                </option>
                              ))}
                            </Field>
                          </div>

                          {/* Location */}
                          <div className="space-y-4">
                            <label className="text-sm font-medium text-white flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              Target location: *
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
                                    handleStateChange(
                                      e.target.value,
                                      setFieldValue
                                    )
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
                                    handleCityChange(
                                      e.target.value,
                                      setFieldValue
                                    )
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
                            <FieldArray name="additionalLocations">
                              {({ push, remove }) => (
                                <div className="space-y-3">
                                  <label className="text-sm font-medium text-white">
                                    Additional Locations (Optional)
                                  </label>

                                  {/* Display added locations */}
                                  {values.additionalLocations.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                      {values.additionalLocations.map(
                                        (loc, index) => (
                                          <div
                                            key={`${loc}-${index}`}
                                            className="flex items-center gap-2 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-lg text-sm"
                                          >
                                            <span>{loc}</span>
                                            <button
                                              type="button"
                                              onClick={() => remove(index)}
                                              className="text-yellow-800 hover:text-yellow-900"
                                            >
                                              <X className="w-4 h-4" />
                                            </button>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  )}

                                  {/* Add new location form */}
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Country Dropdown */}
                                    <div className="space-y-2">
                                      <label className="text-xs font-medium text-gray-400">
                                        Country
                                      </label>
                                      <select
                                        value={additionalLocationCountry}
                                        onChange={(e) =>
                                          handleAdditionalCountryChange(
                                            e.target.value
                                          )
                                        }
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

                                    {/* State Dropdown */}
                                    <div className="space-y-2">
                                      <label className="text-xs font-medium text-gray-400">
                                        State/Province
                                      </label>
                                      <select
                                        value={additionalLocationState}
                                        onChange={(e) =>
                                          handleAdditionalStateChange(
                                            e.target.value
                                          )
                                        }
                                        disabled={!additionalLocationCountry}
                                        className="frm disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        <option value="">Select State</option>
                                        {additionalLocationStates.map(
                                          (state) => (
                                            <option
                                              key={state.isoCode}
                                              value={state.isoCode}
                                            >
                                              {state.name}
                                            </option>
                                          )
                                        )}
                                      </select>
                                    </div>

                                    {/* City Dropdown */}
                                    <div className="space-y-2">
                                      <label className="text-xs font-medium text-gray-400">
                                        City
                                      </label>
                                      <select
                                        onChange={(e) => {
                                          if (e.target.value) {
                                            handleAdditionalCitySelect(
                                              e.target.value,
                                              push
                                            );
                                            e.target.value = "";
                                          }
                                        }}
                                        disabled={!additionalLocationState}
                                        className="frm disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        <option value="">
                                          Select & Add City
                                        </option>
                                        {additionalLocationCities.map(
                                          (city) => (
                                            <option
                                              key={city.name}
                                              value={city.name}
                                            >
                                              {city.name}
                                            </option>
                                          )
                                        )}
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </FieldArray>
                          </div>

                          {/* Posting Frequency */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-white flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              Posting frequency:
                            </label>
                            <Field
                              as="select"
                              name="postFrequency"
                              className="frm"
                              onChange={(e: any) => {
                                const value = e.target.value;
                                setFieldValue("postFrequency", value);
                                setCustomFrequency(value === "custom");
                              }}
                            >
                              <option value="">
                                Select posting frequency...
                              </option>
                              {postFrequencies.map((freq) => (
                                <option key={freq} value={freq}>
                                  {freq === "custom"
                                    ? "Custom frequency"
                                    : freq}
                                </option>
                              ))}
                            </Field>

                            {customFrequency && (
                              <div className="mt-4 p-4 bg-slate-200/20 rounded-lg border border-slate-200/10">
                                <h4 className="text-sm font-medium text-white mb-3">
                                  Customize your posting schedule:
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-xs text-gray-400 mb-1 block">
                                      Posts per week
                                    </label>
                                    <input
                                      type="number"
                                      min="1"
                                      max="7"
                                      value={
                                        customFrequencyValues.postsPerWeek ?? ""
                                      }
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        const newValue =
                                          value === ""
                                            ? ""
                                            : Number.parseInt(value, 10);
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
                                            customFrequencyValues.weeks > 1
                                              ? "s"
                                              : ""
                                          } = ${
                                            newValue *
                                            customFrequencyValues.weeks
                                          } posts in total`;
                                          setFieldValue(
                                            "postFrequency",
                                            updatedFrequency
                                          );
                                        }
                                      }}
                                      className="w-full px-2 py-1 text-sm bg-slate-200/20 text-white rounded border border-slate-200/10 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-gray-400 mb-1 block">
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
                                          value === ""
                                            ? ""
                                            : Number.parseInt(value, 10);
                                        setCustomFrequencyValues({
                                          ...customFrequencyValues,
                                          weeks: newValue,
                                        });
                                        if (
                                          newValue !== "" &&
                                          customFrequencyValues.postsPerWeek !==
                                            ""
                                        ) {
                                          const updatedFrequency = `${
                                            customFrequencyValues.postsPerWeek
                                          } time${
                                            customFrequencyValues.postsPerWeek >
                                            1
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
                                      className="w-full px-2 py-1 text-sm bg-slate-200/20 text-white rounded border border-slate-200/10 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                    />
                                  </div>
                                </div>
                                <div className="mt-3 text-sm text-gray-400 bg-slate-200/20 p-2 rounded border border-slate-200/10">
                                  <strong>Preview:</strong>{" "}
                                  {generateCustomFrequencyString()}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Post Duration */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-white flex items-center gap-2">
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
                            <h3 className="text-lg font-semibold text-white">
                              Brand Information
                            </h3>

                            <div className="space-y-2">
                              <label className="text-sm font-medium text-white">
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
                              <label className="text-sm font-medium text-white flex items-center gap-2">
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
                      );
                    }}
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
