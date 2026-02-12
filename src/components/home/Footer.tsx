"use client";

import {
  FacebookLogo,
  InstagramLogo,
  LinkedinLogo,
  TwitterLogo,
} from "phosphor-react";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { FaInstagram, FaXTwitter } from "react-icons/fa6";

interface footerProps {
  setShowLegalDocs: any;
  setInitialDoc: any;
}

const Footer = ({ setShowLegalDocs, setInitialDoc }: footerProps) => {
  return (
    <motion.footer
      className="bg-black text-white py-12 px-6"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col text-center items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="flex items-center justify-center">
              <Image src="/Logo.svg" width={100} height={50} alt="Logo" />
            </span>
            <p className="text-gray-100">
              Making brands trend overnight with our network of 1000+ micro
              influencers.
            </p>

            <div className="flex justify-center space-x-6 mt-4 mb-4">
              <motion.a
                href="https://x.com/The_Pr_God?t=rXHCtH71y3i1nbFcsuAtSQ&s=09"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.2, y: -2 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Twitter"
              >
                <FaXTwitter size={24} />
              </motion.a>
              <motion.a
                href="https://www.instagram.com/thepr_god/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.2, y: -2 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Instagram"
              >
                <FaInstagram size={24} />
              </motion.a>
              <motion.a
                href="https://www.linkedin.com/company/theprgod/?viewAsMember=true"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.2, y: -2 }}
                whileTap={{ scale: 0.9 }}
                aria-label="LinkedIn"
              >
                <LinkedinLogo size={24} />
              </motion.a>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-100"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex flex-wrap justify-center gap-4 mb-4 text-sm">
            <button
              onClick={() => {
                setInitialDoc("privacy");
                setShowLegalDocs(true);
              }}
              className="hover:text-white transition-colors underline focus:outline-none"
            >
              Privacy Policy
            </button>
            <span className="text-gray-600">•</span>
            <button
              onClick={() => {
                setInitialDoc("terms");
                setShowLegalDocs(true);
              }}
              className="hover:text-white transition-colors underline focus:outline-none"
            >
              Terms of Service
            </button>
            <span className="text-gray-600">•</span>
            <button
              onClick={() => {
                setInitialDoc("partnership");
                setShowLegalDocs(true);
              }}
              className="hover:text-white transition-colors underline focus:outline-none"
            >
              Partnership Agreement
            </button>
          </div>
          <p>&copy; 2025 The•PR•God. All rights reserved.</p>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;
