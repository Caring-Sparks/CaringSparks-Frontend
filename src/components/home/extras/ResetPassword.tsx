"use client";

import { motion } from "framer-motion";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useAuth } from "@/hooks/useAuth";
import { Lock, Eye, EyeSlash, ShieldCheck } from "phosphor-react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const ResetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Required"),
});

export default function ResetPasswordForm() {
  const { resetPassword, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState("");
  const [role, setRole] = useState("");
  const [isValidToken, setIsValidToken] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    const roleParam = searchParams.get("role");

    if (tokenParam && roleParam) {
      setToken(tokenParam);
      setRole(roleParam);
      setIsValidToken(true);
    } else {
      router.push("/");
    }
  }, [searchParams, router]);

  const handleSubmit = async (values: {
    password: string;
    confirmPassword: string;
  }) => {
    const success = await resetPassword(token, values.password, role);
    if (success) {
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 3000);
    }
  };

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Validating reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <motion.div
        className="bg-black text-gray-800 rounded-3xl border border-slate-200/10 shadow-2xl w-full max-w-md p-8"
        initial={{ scale: 0.9, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
      >
        {!isSuccess ? (
          <>
            {/* Header */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck
                  size={32}
                  weight="bold"
                  className="text-yellow-600"
                />
              </div>
              <h2 className="text-3xl font-extrabold mb-1 tracking-tight text-gray-500">
                Reset Password
              </h2>
              <p className="text-gray-500 text-sm text-center">
                Create a new secure password for your account
              </p>
            </div>

            {/* Form */}
            <Formik
              initialValues={{ password: "", confirmPassword: "" }}
              validationSchema={ResetPasswordSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="flex flex-col gap-5">
                  {/* New Password */}
                  <div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Field
                        type={showPassword ? "text" : "password"}
                        name="password"
                        className="frm2"
                        placeholder="New password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeSlash size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                    <ErrorMessage
                      name="password"
                      component="p"
                      className="text-red-500 text-xs mt-1 ml-2"
                    />
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Field
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        className="frm2"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeSlash size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                    <ErrorMessage
                      name="confirmPassword"
                      component="p"
                      className="text-red-500 text-xs mt-1 ml-2"
                    />
                  </div>

                  {/* Password Requirements */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <h4 className="text-yellow-800 font-semibold text-sm mb-2">
                      Password Requirements:
                    </h4>
                    <ul className="text-yellow-700 text-xs space-y-1">
                      <li>• At least 6 characters long</li>
                      <li>• Different from your previous password</li>
                      <li>• Keep it secure and don&apos;t share it</li>
                    </ul>
                  </div>

                  {/* CTA */}
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting || loading}
                    className="bg-yellow-500 text-white rounded-full py-3 text-lg font-bold shadow-lg shadow-yellow-600/30 transition-all duration-300 hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-500/50 focus:outline-none disabled:opacity-50 disabled:shadow-none"
                  >
                    {loading ? "Resetting..." : "Reset Password"}
                  </motion.button>
                </Form>
              )}
            </Formik>
          </>
        ) : (
          /* Success State */
          <motion.div
            className="flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck size={32} weight="bold" className="text-green-600" />
            </div>
            <h2 className="text-3xl font-extrabold mb-3 tracking-tight text-gray-500">
              Password Reset!
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Your password has been successfully updated. You&apos;ll be
              redirected to the login page shortly.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 w-full">
              <p className="text-green-800 text-xs">
                ✅ <strong>Success!</strong> Your account is now secure with
                your new password. Redirecting to login in 3 seconds...
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/")}
              className="bg-yellow-500 text-white rounded-full py-3 px-6 text-sm font-bold shadow-lg shadow-yellow-600/30 transition-all duration-300 hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-500/50 focus:outline-none"
            >
              Go to Login Now
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
