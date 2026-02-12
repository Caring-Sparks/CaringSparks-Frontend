"use client";

import React from "react";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import { PaperPlaneTilt } from "phosphor-react";
import { useToast } from "@/utils/ToastNotification";
import axios from "axios";

interface ContactFormValues {
  name: string;
  email: string;
  message: string;
}

const ContactUs: React.FC = () => {
  const { showToast } = useToast();
  const initialValues: ContactFormValues = {
    name: "",
    email: "",
    message: "",
  };

  const validationSchema = Yup.object<ContactFormValues>({
    name: Yup.string().required("Your name is required."),
    email: Yup.string()
      .email("Please enter a valid email address.")
      .required("Your email is required."),
    message: Yup.string().required("A message is required."),
  });

  const handleSubmit = async (
    values: ContactFormValues,
    { resetForm }: FormikHelpers<ContactFormValues>,
  ) => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/smtp/send`,
        values,
      );
      showToast({
        type: "success",
        title: "Submission Successful!",
        message: "Thank you for your message, We&apos;ll get back to you soon.",
        duration: 6000,
      });
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Sorry!",
        message:
          error.message ||
          "Your message could not be submitted at this time, Please try again.",
        duration: 6000,
      });
      resetForm();
    } finally {
      resetForm();
    }
  };

  return (
    <section
      className="bg-gradient-to-b from-black via-gray-900 to-black py-24 px-4 sm:px-6 lg:px-8"
      id="contact"
    >
      <div className="max-w-7xl mx-auto">
        <div className="lg:grid lg:grid-cols-2 lg:gap-24 lg:items-center">
          {/* Text Content */}
          <div className="mb-16 lg:mb-0">
            <div className="inline-flex items-center px-4 py-2 bg-yellow-400/10 text-yellow-400 rounded-full text-sm font-semibold mb-6 border border-yellow-400/20">
              <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></span>
              Contact Us
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl text-white font-black tracking-tight mb-6">
              We&apos;d love to hear from <span className="txt">you</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 leading-relaxed mb-8">
              Whether you&apos;re a creator, brand, or just curious — reach out! Our
              team is ready to help you with anything you need.
            </p>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-3 text-gray-300">
                <PaperPlaneTilt
                  className="text-yellow-400"
                  size={24}
                  weight="fill"
                />
                <span className="text-lg">support@theprgod.com</span>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="w-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 sm:p-10 border border-gray-700 shadow-2xl">
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-gray-300 mb-2"
                    >
                      Full Name
                    </label>
                    <Field
                      name="name"
                      type="text"
                      placeholder="Full Name"
                      className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white placeholder-gray-500 border border-gray-700 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none transition-all"
                    />
                    <ErrorMessage
                      name="name"
                      component="div"
                      className="mt-2 text-sm text-red-400"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-gray-300 mb-2"
                    >
                      Email Address
                    </label>
                    <Field
                      name="email"
                      type="email"
                      placeholder="Email Address"
                      className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white placeholder-gray-500 border border-gray-700 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none transition-all"
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="mt-2 text-sm text-red-400"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-semibold text-gray-300 mb-2"
                    >
                      Message
                    </label>
                    <Field
                      name="message"
                      as="textarea"
                      rows={4}
                      placeholder="Tell us about your project or inquiry..."
                      className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white placeholder-gray-500 border border-gray-700 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none transition-all resize-none"
                    />
                    <ErrorMessage
                      name="message"
                      component="div"
                      className="mt-2 text-sm text-red-400"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-8 py-4 text-base font-bold rounded-full text-black bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 shadow-lg shadow-yellow-500/30 hover:shadow-xl hover:shadow-yellow-500/50 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                    disabled={isSubmitting}
                  >
                    <PaperPlaneTilt size={20} weight="fill" />
                    Send Message
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
