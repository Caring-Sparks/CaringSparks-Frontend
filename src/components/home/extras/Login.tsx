"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useAuth } from "@/hooks/useAuth";
import { Lock, User, X } from "phosphor-react";
import { useEffect, useState } from "react";
import ForgotPassword from "./ForgotPassword";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().min(6, "At least 6 characters").required("Required"),
});

interface LoginPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginPopup({ isOpen, onClose }: LoginPopupProps) {
  const { login, loading } = useAuth();
  const [resetPassword, setResetPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).id === "backdrop") {
      onClose();
    }
  };

  return (
    <>
      {resetPassword ? (
        <ForgotPassword
          isOpen={isOpen}
          onClose={onClose}
          onBackToLogin={() => setResetPassword(false)}
        />
      ) : (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="backdrop"
              onClick={handleBackdropClick}
              className="fixed inset-0 flex items-center justify-center bg-gray-200/50 backdrop-blur-sm z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white text-gray-800 rounded-3xl shadow-2xl w-full max-w-sm p-8 relative"
                initial={{ scale: 0.9, y: 50, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 50, opacity: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                // ✅ Stops clicks inside the modal from closing it
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={22} weight="bold" />
                </button>

                {/* Header */}
                <div className="flex flex-col items-center mb-8">
                  <h2 className="text-3xl font-extrabold mb-1 tracking-tight text-gray-900">
                    Welcome Back
                  </h2>
                  <p className="text-gray-500 text-sm">Sign in to continue</p>
                </div>

                {/* Form */}
                <Formik
                  initialValues={{ email: "", password: "" }}
                  validationSchema={LoginSchema}
                  onSubmit={async (values, { resetForm }) => {
                    const res = await login(values.email, values.password);
                    if (res) {
                      resetForm();
                      onClose();
                    }
                  }}
                >
                  {({ isSubmitting }) => (
                    <Form className="flex flex-col gap-5">
                      {/* Email */}
                      <div>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <Field
                            type="email"
                            name="email"
                            className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl border border-gray-300 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500 transition-all"
                            placeholder="Email address"
                          />
                        </div>
                        <ErrorMessage
                          name="email"
                          component="p"
                          className="text-red-500 text-xs mt-1 ml-2"
                        />
                      </div>

                      {/* Password */}
                      <div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <Field
                            type="password"
                            name="password"
                            className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl border border-gray-300 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500 transition-all"
                            placeholder="Password"
                          />
                        </div>
                        <ErrorMessage
                          name="password"
                          component="p"
                          className="text-red-500 text-xs mt-1 ml-2"
                        />
                      </div>

                      {/* CTA */}
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isSubmitting || loading}
                        className="bg-indigo-600 text-white rounded-full py-3 text-lg font-bold shadow-lg shadow-indigo-600/30 transition-all duration-300 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none disabled:opacity-50 disabled:shadow-none"
                      >
                        {loading ? "Logging in..." : "Login"}
                      </motion.button>

                      {/* Divider */}
                      <div className="flex items-center gap-2 my-2">
                        <div className="flex-1 h-px bg-gray-300" />
                        <span className="text-xs text-gray-400">or</span>
                        <div className="flex-1 h-px bg-gray-300" />
                      </div>

                      {/* Signup link */}
                      <p className="text-center text-gray-500 text-sm mt-1">
                        Don’t have an account?{" "}
                        <span className="text-indigo-600 font-medium hover:underline">
                          Sign up
                        </span>
                      </p>
                      <p
                        onClick={() => setResetPassword(true)}
                        className="text-center text-gray-500 text-sm mt-1 cursor-pointer"
                      >
                        <span className="text-indigo-600 font-medium hover:underline">
                          Don&apos;t remember your password?
                        </span>
                      </p>
                    </Form>
                  )}
                </Formik>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </>
  );
}
