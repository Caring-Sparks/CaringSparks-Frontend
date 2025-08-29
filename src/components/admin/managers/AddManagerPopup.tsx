"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import { useToast } from "@/utils/ToastNotification";
import { Phone, Plus, User, X, PencilSimple } from "phosphor-react";
import { MdMail } from "react-icons/md";
import { useInitializeAdminData } from "@/stores/adminStore";
import { AnimatePresence, motion } from "framer-motion";

interface ManagerFormData {
  name: string;
  email: string;
  phoneNumber: string;
}

interface Manager {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
}

interface AddEditManagerPopupProps {
  isOpen: boolean;
  onClose: () => void;
  managerId?: string;
  onSuccess?: (result: any) => void;
}

interface ApiResponse {
  success: boolean;
  data?: any;
  message?: string;
}

const AddEditManagerPopup: React.FC<AddEditManagerPopupProps> = ({
  isOpen,
  onClose,
  managerId,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [initialValues, setInitialValues] = useState<ManagerFormData>({
    name: "",
    email: "",
    phoneNumber: "",
  });
  const { showToast } = useToast();
  const { fetchAdmins } = useInitializeAdminData();

  const isEditMode = !!managerId;

  // Validation schema using Yup
  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required("Full name is required")
      .min(2, "Full name must be at least 2 characters")
      .max(50, "Full name must not exceed 50 characters")
      .matches(
        /^[a-zA-Z\s]+$/,
        "Full name can only contain letters and spaces"
      ),
    email: Yup.string()
      .required("Email is required")
      .email("Please enter a valid email address")
      .max(100, "Email must not exceed 100 characters"),
    phoneNumber: Yup.string()
      .required("Phone number is required")
      .min(10, "Phone number must be at least 10 digits")
      .max(15, "Phone number must not exceed 15 digits"),
  });

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
  const token = getAuthToken();

  const fetchManagerData = useCallback(
    async (id: string): Promise<Manager | null> => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admins/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result.data || result;
      } catch (error) {
        console.error("Error fetching manager data:", error);
        showToast({
          type: "error",
          title: "Failed to Load Manager Data",
          message: "Could not fetch manager details. Please try again.",
          duration: 5000,
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [token, showToast] // dependencies
  );

  // Load manager data when in edit mode
  useEffect(() => {
    if (isOpen && isEditMode && managerId) {
      fetchManagerData(managerId).then((manager) => {
        if (manager) {
          setInitialValues({
            name: manager.name || "",
            email: manager.email || "",
            phoneNumber: manager.phoneNumber || "",
          });
        }
      });
    } else if (isOpen && !isEditMode) {
      // Reset form for add mode
      setInitialValues({
        name: "",
        email: "",
        phoneNumber: "",
      });
    }
  }, [isOpen, isEditMode, managerId, fetchManagerData]);

  // API call function for create/update
  const submitManagerData = async (
    managerData: ManagerFormData
  ): Promise<ApiResponse> => {
    try {
      if (!token) {
        showToast({
          type: "error",
          title: "Authentication Required",
          message: "Please log in to continue.",
          duration: 5000,
        });
        return {
          success: false,
          message: "Authentication token not found",
        };
      }

      const url = isEditMode
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/admins/update/${managerId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/admins/createAdmin`;

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(managerData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || `HTTP error! status: ${response.status}`
        );
      }

      return { success: true, data: result };
    } catch (error) {
      console.error("Error submitting manager data:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      };
    }
  };

  // Form submission handler
  const handleSubmit = async (
    values: ManagerFormData,
    { setSubmitting, resetForm }: FormikHelpers<ManagerFormData>
  ) => {
    setIsSubmitting(true);

    try {
      const result = await submitManagerData(values);

      if (result.success) {
        // Success handling
        showToast({
          type: "success",
          title: isEditMode
            ? "Manager Updated Successfully!"
            : "Manager Added Successfully!",
          message: isEditMode
            ? "The manager details have been updated."
            : "The new manager has been added to the system.",
          duration: 4000,
        });

        if (!isEditMode) {
          resetForm();
        }

        fetchAdmins(); // Refresh the admin list

        // Call success callback if provided
        if (onSuccess) {
          onSuccess(result.data);
        }

        onClose();
      } else {
        // Error handling
        showToast({
          type: "error",
          title: isEditMode
            ? "Failed to Update Manager"
            : "Failed to Add Manager",
          message:
            result.message || "Please check your information and try again.",
          duration: 6000,
        });
      }
    } catch (error) {
      // Unexpected error handling
      showToast({
        type: "error",
        title: "Unexpected Error",
        message: "Something went wrong. Please try again later.",
        duration: 6000,
      });
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    fetchAdmins();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={handleClose}
        className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-xl relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-lg ${
                  isEditMode ? "bg-orange-100" : "bg-blue-100"
                }`}
              >
                {isEditMode ? (
                  <PencilSimple className="w-5 h-5 text-orange-600" />
                ) : (
                  <Plus className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditMode ? "Edit Manager" : "Add New Manager"}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isSubmitting || isLoading}
              type="button"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Loading State */}
          {isLoading && isEditMode && (
            <div className="p-6 flex items-center justify-center">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-600">
                  Loading manager details...
                </span>
              </div>
            </div>
          )}

          {/* Form */}
          {(!isLoading || !isEditMode) && (
            <div className="p-6">
              <Formik
                key={`${managerId}-${initialValues.email}`} // Force re-render when data changes
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize // Allow form to reinitialize when initialValues change
              >
                {({ isValid, dirty, values }) => (
                  <Form className="space-y-5">
                    {/* Full Name Field */}
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <Field
                          type="text"
                          id="name"
                          name="name"
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="Enter full name"
                          disabled={isSubmitting}
                        />
                      </div>
                      <ErrorMessage
                        name="name"
                        component="div"
                        className="mt-1 text-sm text-red-600"
                      />
                    </div>

                    {/* Email Field */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MdMail className="h-5 w-5 text-gray-400" />
                        </div>
                        <Field
                          type="email"
                          id="email"
                          name="email"
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="Enter email address"
                          disabled={isSubmitting}
                        />
                      </div>
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="mt-1 text-sm text-red-600"
                      />
                    </div>

                    {/* Phone Number Field */}
                    <div>
                      <label
                        htmlFor="phoneNumber"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <Field
                          type="tel"
                          id="phoneNumber"
                          name="phoneNumber"
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="Enter phone number"
                          disabled={isSubmitting}
                        />
                      </div>
                      <ErrorMessage
                        name="phoneNumber"
                        component="div"
                        className="mt-1 text-sm text-red-600"
                      />
                    </div>

                    {/* Buttons */}
                    <div className="flex space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={
                          isSubmitting || !isValid || (!dirty && isEditMode)
                        }
                        className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
                          isEditMode
                            ? "bg-orange-600 hover:bg-orange-700"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            {isEditMode ? "Updating..." : "Adding..."}
                          </>
                        ) : isEditMode ? (
                          "Update Manager"
                        ) : (
                          "Add Manager"
                        )}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddEditManagerPopup;
