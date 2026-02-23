"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface navbarProps {
  openLogin: () => void;
  openPopup: () => void;
}

const Navbar = ({ openLogin, openPopup }: navbarProps) => {
  return (
    <nav
      className={`fixed bg-black/95 backdrop-blur-lg w-full top-0 border-b border-gray-800 z-50 transition-all duration-500`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 sm:h-20 items-center">
          {/* Logo */}
          <motion.div className="w-20" whileHover={{ scale: 1.1 }}>
            <Image src="/Logo.svg" width={60} height={50} alt="Logo" />
          </motion.div>

          {/* Desktop CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center gap-3"
          >
            <button
              onClick={openLogin}
              className={`px-5 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 hover:scale-105 text-gray-300 hover:text-white hover:bg-gray-800`}
            >
              Login
            </button>
            <button
              onClick={openPopup}
              className="group relative px-6 py-2.5 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-sm font-bold rounded-full shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 overflow-hidden"
            >
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-yellow-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </button>
          </motion.div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
