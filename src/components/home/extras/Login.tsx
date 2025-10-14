"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeClosed, Lock, User, X, UserCircle } from "phosphor-react";
import { useEffect, useState } from "react";
import ForgotPassword from "./ForgotPassword";
import GetStarted from "./GetStarted";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().min(6, "At least 6 characters").required("Required"),
  role: Yup.string()
    .oneOf(["influencer", "brand", "admin"], "Invalid role")
    .required("Required"),
});

interface LoginPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginPopup({ isOpen, onClose }: LoginPopupProps) {
  const { login, loading } = useAuth();
  const [getStarted, setGetStarted] = useState(false);
  const [resetPassword, setResetPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [logins, setLogins] = useState(false);

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
      {getStarted ? (
        <GetStarted
          onClose={() => setGetStarted(false)}
          login={() => setLogins(false)}
        />
      ) : resetPassword ? (
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
              className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-2xl z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-black border border-slate-200/10 text-gray-800 rounded-3xl shadow-2xl w-full max-w-sm p-8 relative"
                initial={{ scale: 0.9, y: 50, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 50, opacity: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
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
                  <h2 className="text-3xl font-extrabold mb-1 tracking-tight text-gray-500">
                    Welcome Back
                  </h2>
                  <p className="text-gray-500 text-sm">Sign in to continue</p>
                </div>

                {/* Form */}
                <Formik
                  initialValues={{ email: "", password: "", role: "" }}
                  validationSchema={LoginSchema}
                  onSubmit={async (values, { resetForm }) => {
                    const res = await login(
                      values.email,
                      values.password,
                      values.role
                    );
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
                            className="frm2"
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
                            type={showPassword ? "text" : "password"}
                            name="password"
                            className="frm2"
                            placeholder="Password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                          >
                            {showPassword ? <Eye /> : <EyeClosed />}
                          </button>
                        </div>
                        <ErrorMessage
                          name="password"
                          component="p"
                          className="text-red-500 text-xs mt-1 ml-2"
                        />
                      </div>

                      {/* Role Selection */}
                      <div>
                        <div className="relative">
                          <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <Field as="select" name="role" className="frm2">
                            <option value="" disabled className="text-gray-500">
                              Select your role
                            </option>
                            <option value="influencer">Influencer</option>
                            <option value="brand">Brand</option>
                            <option value="admin">Admin</option>
                          </Field>
                        </div>
                        <ErrorMessage
                          name="role"
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
                      >
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
                            Login
                          </button>
                        )}
                      </motion.button>

                      {/* Divider */}
                      <div className="flex items-center gap-2 my-2">
                        <div className="flex-1 h-px bg-slate-200/10" />
                        <span className="text-xs text-gray-300">or</span>
                        <div className="flex-1 h-px bg-slate-200/10" />
                      </div>

                      {/* Signup link */}
                      <p className="text-center text-gray-500 text-sm mt-1">
                        Don&apos;t have an account?{" "}
                        <span
                          onClick={() => {
                            setGetStarted(true);
                          }}
                          className="text-yellow-500 font-medium hover:underline"
                        >
                          Sign up
                        </span>
                      </p>
                      <p
                        onClick={() => setResetPassword(true)}
                        className="text-center text-gray-500 text-sm mt-1 cursor-pointer"
                      >
                        <span className="text-yellow-500 font-medium hover:underline">
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
