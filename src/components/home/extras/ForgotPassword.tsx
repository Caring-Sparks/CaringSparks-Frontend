"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useAuth } from "@/hooks/useAuth";
import { EnvelopeSimple, X, ArrowLeft } from "phosphor-react";
import { useState } from "react";

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
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

  const handleSubmit = async (values: { email: string }) => {
    const success = await forgotPassword(values.email);
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
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                    <EnvelopeSimple
                      size={32}
                      weight="bold"
                      className="text-indigo-600"
                    />
                  </div>
                  <h2 className="text-3xl font-extrabold mb-1 tracking-tight text-gray-900">
                    Forgot Password?
                  </h2>
                  <p className="text-gray-500 text-sm text-center">
                    Enter your email address and we&apos;ll send you a link to reset
                    your password
                  </p>
                </div>

                {/* Form */}
                <Formik
                  initialValues={{ email: "" }}
                  validationSchema={ForgotPasswordSchema}
                  onSubmit={handleSubmit}
                >
                  {({ isSubmitting }) => (
                    <Form className="flex flex-col gap-5">
                      {/* Email */}
                      <div>
                        <div className="relative">
                          <EnvelopeSimple className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <Field
                            type="email"
                            name="email"
                            className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl border border-gray-300 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500 transition-all"
                            placeholder="Enter your email address"
                          />
                        </div>
                        <ErrorMessage
                          name="email"
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
                        {loading ? "Sending..." : "Send Reset Link"}
                      </motion.button>

                      {/* Back to login */}
                      <p className="text-center text-gray-500 text-sm mt-1">
                        Remember your password?{" "}
                        <button
                          type="button"
                          onClick={onBackToLogin}
                          className="text-indigo-600 font-medium hover:underline"
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
                  className="bg-indigo-600 text-white rounded-full py-3 px-6 text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all duration-300 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none mb-4"
                >
                  Got it, thanks!
                </motion.button>

                <p className="text-gray-500 text-xs">
                  Didn&apos;t receive the email?{" "}
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-indigo-600 font-medium hover:underline"
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
