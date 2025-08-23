"use client";

import { useState } from "react";
import axios from "axios";
import { useToast } from "../utils/ToastNotification";

interface LoginResponse {
  _id: string;
  email: string;
  token: string;
  data: string;
}

interface RegisterBrand {
  _id: string;
  email: string;
  token: string;
}

interface registerInfluencer {
  _id: string;
  email: string;
  token: string;
}

interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export function useAuth() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const login = async (
    email: string,
    password: string
  ): Promise<LoginResponse | null> => {
    setLoading(true);
    try {
      const res = await axios.post<LoginResponse>(`${apiUrl}/api/auth/login`, {
        email,
        password,
      });
      localStorage.setItem("user", JSON.stringify(res.data));

      showToast({
        type: "success",
        title: "Login Successful",
        message: "Welcome back! You have been logged in successfully.",
      });

      return res.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Login failed";
      showToast({
        type: "error",
        title: "Login Failed",
        message: errorMessage,
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const registerBrand = async (values: any): Promise<RegisterBrand | null> => {
    setLoading(true);
    try {
      const res = await axios.post<RegisterBrand>(
        `${apiUrl}/api/brands/register`,
        values
      );

      showToast({
        type: "success",
        title: "Successful Campaign!",
        message:
          "Your brand has been registered successfully! Check your email for your login details.",
      });

      return res.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Registration failed";
      showToast({
        type: "error",
        title: "Registration Failed",
        message: errorMessage,
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const registerInfluencer = async (
    formData: FormData
  ): Promise<registerInfluencer | null> => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${apiUrl}/api/influencers/createInfluencer`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      showToast({
        type: "success",
        title: "Successful Registration!",
        message:
          "Your account details have been successfully saved! Check your email for your login details.",
      });

      return res.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Registration failed";

      showToast({
        type: "error",
        title: "Registration Failed",
        message: errorMessage,
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await axios.post<ForgotPasswordResponse>(
        `${apiUrl}/api/auth/forgot-password`,
        { email }
      );
      const data = response.data;
      if (data.success) {
        // Show success toast/notification
        showToast({
          type: "success",
          title: "Reset link sent!",
          message: data.message || "Password reset link sent to your email.",
        });
        return true;
      } else {
        showToast({
          type: "error",
          title: "Sorry!",
          message: data.message || "Failed to send reset email.",
        });
        return false;
      }
    } catch (error: any) {
      const errorMessage = "Network error. Please try again.";
      showToast({
        type: "error",
        title: "Sorry!",
        message: error.message || errorMessage,
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (
    token: string,
    newPassword: string,
    role: string
  ): Promise<boolean> => {
    try {
      setLoading(true);

      const response = await axios.post(`${apiUrl}/api/auth/reset-password`, {
        token,
        newPassword,
        role,
      });
      const data = response.data;
      if (data.success) {
        showToast({
          type: "success",
          title: "Success!",
          message: data.message || "your password has been reset successfully",
        });
        return true;
      } else {
        showToast({
          type: "error",
          title: "Sorry!",
          message: data.message || "Failed to reset password.",
        });
        return false;
      }
    } catch (error: any) {
      const errorMessage = "Network error. Please try again.";
      showToast({
        type: "error",
        title: "Sorry!",
        message: error.message || errorMessage,
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    registerBrand,
    loading,
    registerInfluencer,
    forgotPassword,
    resetPassword,
  };
}
