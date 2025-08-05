"use client";

import {
  FacebookLogo,
  InstagramLogo,
  LinkedinLogo,
  TwitterLogo,
} from "phosphor-react";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-200 py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-start"
        >
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-r from-green-300 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-pulse"></div>
          </div>
          <span
            className={`ml-3 text-xl sm:text-2xl font-bold transition-all duration-300`}
          >
            CaringSparks
          </span>
        </motion.div>

        {/* CONTACT INFO */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Contact Us</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>Email: support@caringsparks.com</li>
            <li>Phone: +(234) 901 2345 678</li>
            <li>Mon–Fri: 9AM–6PM</li>
          </ul>
        </div>

        {/* LEGAL LINKS */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Legal</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              <a href="/privacy-policy" className="hover:text-white transition">
                Privacy Policy
              </a>
            </li>
            <li>
              <a
                href="/terms-of-service"
                className="hover:text-white transition"
              >
                Terms of Service
              </a>
            </li>
            <li>
              <a href="/refund-policy" className="hover:text-white transition">
                Refund Policy
              </a>
            </li>
          </ul>
        </div>

        {/* SOCIAL LINKS */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Follow Us</h4>
          <div className="flex space-x-4">
            <a
              href="#"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-blue-600 transition"
            >
              <FacebookLogo size={20} weight="fill" />
            </a>
            <a
              href="#"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-sky-500 transition"
            >
              <TwitterLogo size={20} weight="fill" />
            </a>
            <a
              href="#"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-pink-500 transition"
            >
              <InstagramLogo size={20} weight="fill" />
            </a>
            <a
              href="#"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-blue-700 transition"
            >
              <LinkedinLogo size={20} weight="fill" />
            </a>
          </div>
        </div>
      </div>

      {/* BOTTOM COPYRIGHT */}
      <div className="mt-10 border-t border-gray-700 pt-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} CaringSparks. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
