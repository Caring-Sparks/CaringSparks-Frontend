"use client";

import React from "react";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import { PaperPlaneTilt } from "phosphor-react";

// Define the shape of your form data
interface ContactFormValues {
  name: string;
  email: string;
  message: string;
}

const ContactUs: React.FC = () => {
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

  const handleSubmit = (
    values: ContactFormValues,
    { resetForm }: FormikHelpers<ContactFormValues>
  ) => {
    // In a real app, you'd send this data to an API endpoint.
    console.log("Form submitted with values:", values);
    alert("Thank you for your message! We'll get back to you soon.");
    resetForm();
  };

  return (
    <section className="bg-gray-50 py-24 px-4 sm:px-6 lg:px-8" id="contact">
      <div className="max-w-7xl mx-auto">
        <div className="lg:grid lg:grid-cols-2 lg:gap-24 lg:items-center">
          {/* Text Content */}
          <div className="text-gray-900 mb-16 lg:mb-0">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Contact Us
            </div>
            <h2 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
              We’d love to hear from you
            </h2>
            <p className="mt-6 text-xl text-gray-600">
              Whether you’re a creator, brand, or just curious — reach out! Our
              team is ready to help you with anything you need.
            </p>
            <div className="mt-8 flex flex-col space-y-4 text-gray-500">
              <div className="flex items-center space-x-3">
                <PaperPlaneTilt className="text-green-600" size={24} />
                <span>support@caringsparks.com</span>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="w-full">
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-8">
                  <div>
                    <label htmlFor="name" className="sr-only">
                      Full Name
                    </label>
                    <Field
                      name="name"
                      type="text"
                      placeholder="Full Name"
                      className="w-full px-0 py-3 rounded-none bg-transparent text-gray-900 placeholder-gray-500 border-b-2 border-gray-300 focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
                    />
                    <ErrorMessage
                      name="name"
                      component="div"
                      className="mt-2 text-sm text-red-600"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="sr-only">
                      Email Address
                    </label>
                    <Field
                      name="email"
                      type="email"
                      placeholder="Email Address"
                      className="w-full px-0 py-3 rounded-none bg-transparent text-gray-900 placeholder-gray-500 border-b-2 border-gray-300 focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="mt-2 text-sm text-red-600"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="sr-only">
                      Message
                    </label>
                    <Field
                      name="message"
                      as="textarea"
                      rows={4}
                      placeholder="Tell us about your project or inquiry..."
                      className="w-full px-0 py-3 rounded-none bg-transparent text-gray-900 placeholder-gray-500 border-b-2 border-gray-300 focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors resize-none"
                    />
                    <ErrorMessage
                      name="message"
                      component="div"
                      className="mt-2 text-sm text-red-600"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto flex items-center justify-center px-8 py-4 text-base font-bold rounded-full text-white bg-green-600 hover:bg-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    <PaperPlaneTilt className="mr-3" size={24} />
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
