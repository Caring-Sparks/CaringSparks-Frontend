"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useAuth } from "@/hooks/useAuth";
import { EnvelopeSimple, X, ArrowLeft, UserCircle } from "phosphor-react";
import { useState } from "react";

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  role: Yup.string()
    .oneOf(["influencer", "brand", "admin"], "Invalid role")
    .required("Required"),
});

interface ForgotPasswordPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
}

export default function ForgotPassword({
  isOpen,
  onClose,
  onBackToLogin,
}: ForgotPasswordPopupProps) {
  const { forgotPassword, loading } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const handleSubmit = async (values: { email: string; role: string }) => {
    const success = await forgotPassword(values.email, values.role);
    if (success) {
      setSubmittedEmail(values.email);
      setIsSubmitted(true);
    }
  };

  const handleClose = () => {
    setIsSubmitted(false);
    setSubmittedEmail("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-2xl z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-black text-gray-800 border border-slate-200/10 rounded-3xl shadow-2xl w-full max-w-sm p-8 relative"
            initial={{ scale: 0.9, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 50, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={22} weight="bold" />
            </button>

            {/* Back Button */}
            {!isSubmitted && (
              <button
                onClick={onBackToLogin}
                className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft size={22} weight="bold" />
              </button>
            )}

            {!isSubmitted ? (
              <>
                {/* Header */}
                <div className="flex flex-col items-center mb-8 mt-2">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                    <EnvelopeSimple
                      size={32}
                      weight="bold"
                      className="text-yellow-600"
                    />
                  </div>
                  <h2 className="text-3xl font-extrabold mb-1 tracking-tight text-gray-500">
                    Forgot Password?
                  </h2>
                  <p className="text-gray-500 text-sm text-center">
                    Enter your email address and we&apos;ll send you a link to
                    reset your password
                  </p>
                </div>

                {/* Form */}
                <Formik
                  initialValues={{ email: "", role: "" }}
                  validationSchema={ForgotPasswordSchema}
                  onSubmit={handleSubmit}
                >
                  {({ isSubmitting }) => (
                    <Form className="flex flex-col gap-5">
                      <>
                        {/* Email */}
                        <div>
                          <div className="relative">
                            <EnvelopeSimple className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <Field
                              type="email"
                              name="email"
                              className="frm2"
                              placeholder="Enter your email address"
                            />
                          </div>
                          <ErrorMessage
                            name="email"
                            component="p"
                            className="text-red-500 text-xs mt-1 ml-2"
                          />
                        </div>

                        {/* Role Selection */}
                        <div>
                          <div className="relative">
                            <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <Field as="select" name="role" className="frm2">
                              <option
                                value=""
                                disabled
                                className="text-gray-400"
                              >
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
                      </>

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
                            Send reset link
                          </button>
                        )}
                      </motion.button>

                      {/* Back to login */}
                      <p className="text-center text-gray-500 text-sm mt-1">
                        Remember your password?{" "}
                        <button
                          type="button"
                          onClick={onBackToLogin}
                          className="text-yellow-500 font-medium hover:underline"
                        >
                          Back to Login
                        </button>
                      </p>
                    </Form>
                  )}
                </Formik>
              </>
            ) : (
              /* Success State */
              <motion.div
                className="flex flex-col items-center text-center mt-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <EnvelopeSimple
                    size={32}
                    weight="bold"
                    className="text-green-600"
                  />
                </div>
                <h2 className="text-3xl font-extrabold mb-3 tracking-tight text-gray-900">
                  Check Your Email
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  We&apos;ve sent a password reset link to{" "}
                  <span className="font-semibold text-gray-700">
                    {submittedEmail}
                  </span>
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <p className="text-blue-800 text-xs">
                    📧 <strong>Check your inbox</strong> (and spam folder) for
                    the reset link. The link will expire in 10 minutes for
                    security.
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleClose}
                  className="bg-yellow-600 text-white rounded-full py-3 px-6 text-sm font-bold shadow-lg shadow-yellow-600/30 transition-all duration-300 hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-500/50 focus:outline-none mb-4"
                >
                  Got it, thanks!
                </motion.button>

                <p className="text-gray-500 text-xs">
                  Didn&apos;t receive the email?{" "}
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-yellow-600 font-medium hover:underline"
                  >
                    Try again
                  </button>
                </p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
