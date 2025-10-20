"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import Image from "next/image";
import {
  ArrowRight,
  Lightning,
  LinkedinLogo,
  Sparkle,
  Star,
  X,
} from "phosphor-react";
import { useEffect, useState } from "react";
import GetStarted from "./extras/GetStarted";
import LoginPopup from "./extras/Login";
import { jwtDecode } from "jwt-decode";
import { FaBarsStaggered, FaXTwitter } from "react-icons/fa6";
import { FaInstagram } from "react-icons/fa";
import LegalDocumentsModal from "./DocModal";

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [getStarted, setGetStarted] = useState<boolean>(false);
  const [login, setLogin] = useState<boolean>(false);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [showLegalDocs, setShowLegalDocs] = useState<boolean>(false);
  const [initialDoc, setInitialDoc] = useState<string>("privacy");

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const mobileMenuVariants: Variants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  const menuItemVariants = {
    closed: { opacity: 0, x: -20 },
    open: { opacity: 1, x: 0 },
  };

  const openPopup = () => {
    setIsMobileMenuOpen(false);
    setGetStarted(true);
  };

  const openLogin = () => {
    setIsMobileMenuOpen(false);
    setLogin(true);
  };

  useEffect(() => {
    const checkToken = () => {
      const userStr = localStorage.getItem("user");

      if (!userStr) {
        setLoggedIn(false);
        return;
      }

      try {
        const userData = JSON.parse(userStr);
        const token = userData?.data?.access_token || userData?.access_token;

        if (!token) {
          setLoggedIn(false);
          return;
        }

        const decoded: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp && decoded.exp > currentTime) {
          setLoggedIn(true);
        } else {
          localStorage.removeItem("user");
          setLoggedIn(false);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        setLoggedIn(false);
      }
    };

    checkToken();
    window.addEventListener("storage", checkToken);
    return () => window.removeEventListener("storage", checkToken);
  }, []);

  const handleDashboardLink = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        const role = userData?.data?.user?.role;

        if (role === "admin") {
          window.location.href = "/admin/";
        } else if (role === "influencer") {
          window.location.href = "/influencer/";
        } else if (role === "brand") {
          window.location.href = "/brand/";
        } else {
          window.location.href = "/";
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  };

  return (
    <>
      <AnimatePresence>
        {getStarted && (
          <GetStarted
            onClose={() => setGetStarted(false)}
            login={() => setLogin(true)}
          />
        )}
        {login && <LoginPopup onClose={() => setLogin(false)} isOpen={login} />}
        {showLegalDocs && (
          <LegalDocumentsModal
            isVisible={showLegalDocs}
            onClose={() => setShowLegalDocs(false)}
            initialDocument={initialDoc}
          />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-black">
        {/* Navbar */}
        <motion.nav
          className="flex justify-between items-center p-6 md:px-12 relative"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div className="w-20" whileHover={{ scale: 1.1 }}>
            <Image src="/Logo.svg" width={100} height={50} alt="Logo" />
          </motion.div>

          {loggedIn ? (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button
                onClick={handleDashboardLink}
                className="background text-black font-semibold cursor-pointer px-6 py-2 rounded-full"
              >
                Dashboard
              </button>
            </motion.div>
          ) : (
            <motion.div className="hidden md:flex items-center space-x-8">
              <motion.div
                className="flex items-center space-x-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <motion.button
                  onClick={() => setLogin(true)}
                  className="text-white cursor-pointer px-4 py-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Login
                </motion.button>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button
                    onClick={() => setGetStarted(true)}
                    className="background text-black font-semibold cursor-pointer px-6 py-2 rounded-full"
                  >
                    Get Started
                  </button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          <motion.button
            className="md:hidden z-10 relative"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={28} className="text-white" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaBarsStaggered size={28} className="text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                className="absolute z-20 top-full left-0 right-0 bg-black backdrop-blur-md border-b border-gray-200 shadow-lg md:hidden"
                variants={mobileMenuVariants}
                initial="closed"
                animate="open"
                exit="closed"
                style={{ overflow: "hidden" }}
              >
                <motion.div
                  className="px-6 py-4 space-y-4"
                  variants={staggerContainer}
                  initial="closed"
                  animate="open"
                  exit="closed"
                >
                  <motion.div
                    className="pt-4 border-t border-gray-200 space-y-3"
                    variants={menuItemVariants}
                    transition={{ delay: 0.3 }}
                  >
                    <motion.button
                      className="block w-full text-center text-white border rounded-full transition-colors py-2"
                      whileHover={{ x: 10 }}
                      onClick={() => openLogin()}
                    >
                      Login
                    </motion.button>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <button
                        className="w-full background py-2 text-white rounded-full"
                        onClick={() => openPopup()}
                      >
                        Get Started
                      </button>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>

        {/* Hero Section */}
        <section className="text-center px-6 py-16 md:py-24">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="max-w-4xl mx-auto"
          >
            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-bold mb-6"
            >
              <span className="background bg-clip-text text-transparent">
                Wanna trend?
              </span>
            </motion.h1>

            <motion.div variants={fadeInUp} className="relative">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-700 mb-8">
                Then let&apos;s make you trend{" "}
                <span className="relative">
                  overnight
                  <motion.div
                    className="absolute -bottom-2 left-0 w-full h-3 bg-yellow-300 -z-10"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 1, duration: 0.8 }}
                  />
                </span>
              </h2>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="flex justify-center items-center space-x-4 mb-12"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              >
                <Sparkle className="txt w-8 h-8" />
              </motion.div>
              <p className="text-xl md:text-2xl text-gray-600">
                Over <span className="font-bold txt">100k+</span> micro
                influencers
              </p>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              >
                <Star className="txt w-8 h-8" />
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* Services Section */}
        <section className="px-6 py-20 bg-gradient-to-b bg-black">
          <motion.div
            className="max-w-6xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center mb-16">
              <motion.h3
                className="text-4xl md:text-5xl font-bold text-slate-700 mb-6"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                Whether you&apos;re a
              </motion.h3>
              <motion.div
                className="w-24 h-1 background mx-auto"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6 }}
              />
            </div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {[
                {
                  title: "Product",
                  description:
                    "Launch and scale your product with targeted influencer partnerships",
                  icon: "/icons/parcel.png",
                  gradient: "from-blue-500/10 to-blue-600/20",
                  border: "border-blue-200",
                  iconBg: "bg-blue-100",
                  textColor: "text-blue-700",
                },
                {
                  title: "Service",
                  description:
                    "Amplify your service offerings through authentic creator content",
                  icon: "/icons/power.png",
                  gradient: "from-emerald-500/10 to-emerald-600/20",
                  border: "border-emerald-200",
                  iconBg: "bg-emerald-100",
                  textColor: "text-emerald-700",
                },
                {
                  title: "Brand",
                  description:
                    "Build brand awareness and trust with strategic influencer campaigns",
                  icon: "/icons/organization.png",
                  gradient: "from-purple-500/10 to-purple-600/20",
                  border: "border-purple-200",
                  iconBg: "bg-purple-100",
                  textColor: "text-purple-700",
                },
                {
                  title: "Person",
                  description:
                    "Grow your personal brand and reach with our creator network",
                  icon: "/icons/user.png",
                  gradient: "from-pink-500/10 to-pink-600/20",
                  border: "border-pink-200",
                  iconBg: "bg-pink-100",
                  textColor: "text-pink-700",
                },
                {
                  title: "Event",
                  description:
                    "Drive attendance and engagement for your events and experiences",
                  icon: "/icons/confetti.png",
                  gradient: "from-orange-500/10 to-orange-600/20",
                  border: "border-orange-200",
                  iconBg: "bg-orange-100",
                  textColor: "text-orange-700",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="group cursor-pointer"
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className={`bg-gradient-to-br ${item.gradient} backdrop-blur-sm border ${item.border} p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 h-full`}
                  >
                    <div
                      className={`${item.iconBg} w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Image
                        src={item.icon}
                        alt={item.title}
                        width={40}
                        height={40}
                        className="text-2xl"
                      />
                    </div>
                    <h4 className={`text-2xl font-bold ${item.textColor} mb-4`}>
                      {item.title}
                    </h4>
                    <p className="text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <h4 className="text-3xl md:text-4xl font-bold text-slate-700 mb-4">
                We have got you covered
              </h4>
              <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                Our comprehensive platform connects you with the right
                influencers to achieve your unique goals
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-20 text-center">
          <motion.div
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                onClick={() => setGetStarted(true)}
                className="text-xl px-12 py-6 background text-white rounded-full shadow-2xl group relative overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 background opacity-0 group-hover:opacity-100 transition-opacity"
                  layoutId="button-bg"
                />
                <span className="relative z-10 flex items-center space-x-3">
                  <Lightning className="w-6 h-6" />
                  <span>Click here to begin</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "reverse",
                    }}
                  >
                    <ArrowRight className="w-6 h-6" />
                  </motion.div>
                </span>
              </button>
            </motion.div>

            <motion.div
              className="flex justify-center space-x-8 mt-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.2,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                >
                  <Star className="w-8 h-8 text-yellow-400 fill-current" />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* Footer */}
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
                <p className="text-gray-400">
                  Making brands trend overnight with our network of 100k+ micro
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
              className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400"
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
      </div>
    </>
  );
}
