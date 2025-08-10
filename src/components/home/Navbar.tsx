"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { List, X, CaretDown, CaretRight } from "phosphor-react";
import { navLinks } from "../../../constants";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(
    null
  );
  // New state to manage the desktop dropdown visibility
  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState<number | null>(
    null
  );

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed w-full top-0 z-50 transition-all duration-500 ${
        scrolled && "bg-white/5 backdrop-blur-xl"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 sm:h-20 items-center">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center"
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-green-300 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-pulse"></div>
            </div>
            <span
              className={`ml-3 text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent transition-all duration-300 ${
                scrolled ? "text-gray-900" : "text-black"
              }`}
            >
              CaringSparks
            </span>
          </motion.div>

          {/* Desktop Nav */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden md:flex items-center space-x-1"
          >
            {navLinks.map((link, index) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                // Use a standard div instead of 'group' to remove the parent-hover effect
              >
                {!link.subLinks ? (
                  <a
                    href={link.href || "#"}
                    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 group ${
                      scrolled
                        ? "text-gray-700 hover:text-green-600 hover:bg-blue-50"
                        : "text-black hover:bg-white/10"
                    }`}
                  >
                    {link.name}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-green-300 to-green-600 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                ) : (
                  // Attach onMouseEnter and onMouseLeave to the div that contains both the button and the dropdown menu
                  <div
                    className="relative"
                    onMouseEnter={() => setDesktopDropdownOpen(index)}
                    onMouseLeave={() => setDesktopDropdownOpen(null)}
                  >
                    <button
                      className={`flex items-center gap-1 relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${
                        scrolled
                          ? "text-gray-700 hover:text-green-600 hover:bg-blue-50"
                          : "text-black hover:bg-white/10"
                      }`}
                    >
                      {link.name}
                      <CaretDown size={14} className="mt-[1px]" />
                    </button>

                    {/* Use a conditional render with the new state to show/hide the dropdown */}
                    {desktopDropdownOpen === index && (
                      <div className="absolute left-0 mt-2 w-60 bg-white rounded-lg shadow-lg opacity-100 translate-y-0 transition-all duration-300 z-50">
                        <ul className="py-2">
                          {link.subLinks.map((sub, i) => (
                            <li key={i}>
                              <a
                                href={sub.href}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition"
                              >
                                {sub.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* Desktop CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="hidden md:flex items-center space-x-3"
          >
            <button
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover:scale-105 ${
                scrolled
                  ? "text-gray-700 hover:text-green-600 hover:bg-blue-50"
                  : "text-black hover:bg-white/10"
              }`}
            >
              Login
            </button>
            <button className="group relative px-6 py-2.5 bg-gradient-to-r from-green-400 to-green-600 text-white text-sm font-semibold rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 overflow-hidden">
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-green-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </button>
          </motion.div>

          {/* Mobile toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                scrolled
                  ? "text-gray-700 hover:bg-gray-100"
                  : "text-black hover:bg-white/10"
              }`}
            >
              <motion.div
                animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isMobileMenuOpen ? <X size={24} /> : <List size={24} />}
              </motion.div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden overflow-hidden bg-white/5 backdrop-blur-xl border-t border-gray-200/50 shadow-lg"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  {!link.subLinks ? (
                    <a
                      href={link.href || "#"}
                      className="flex items-center justify-between py-3 px-4 text-gray-700 hover:text-green-600 hover:bg-blue-50 rounded-lg transition-all duration-300 group"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="font-medium">{link.name}</span>
                      <div className="w-2 h-2 bg-green-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </a>
                  ) : (
                    <div>
                      <button
                        className="w-full py-3 px-4 flex items-center justify-between text-gray-900 font-semibold hover:bg-blue-50 rounded-lg transition"
                        onClick={() =>
                          setOpenDropdownIndex(
                            openDropdownIndex === index ? null : index
                          )
                        }
                      >
                        {link.name}
                        <CaretRight
                          size={16}
                          className={`transition-transform ${
                            openDropdownIndex === index
                              ? "rotate-90 text-green-600"
                              : ""
                          }`}
                        />
                      </button>

                      <AnimatePresence>
                        {openDropdownIndex === index && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="pl-4 overflow-hidden"
                          >
                            {link.subLinks.map((sub, i) => (
                              <a
                                key={i}
                                href={sub.href}
                                className="block py-2 px-4 text-gray-700 hover:text-green-600 hover:bg-blue-50 rounded-lg transition-all duration-300"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                {sub.name}
                              </a>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Mobile CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="pt-4 border-t border-gray-200 space-y-3"
              >
                <button className="w-full py-3 px-4 text-gray-700 hover:text-green-600 hover:bg-blue-50 rounded-lg transition-all duration-300 font-medium">
                  Login
                </button>
                <button className="w-full py-3 px-4 bg-gradient-to-r from-green-400 to-green-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5">
                  Get Started
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navbar bottom glow effect */}
      {scrolled && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent"></div>
      )}
    </nav>
  );
};

export default Navbar;
