"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Lightning, List, Sparkle, Star, X } from "phosphor-react";
import { useState } from "react";
import GetStarted from "./extras/GetStarted";
import LoginPopup from "./extras/Login";

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [getStarted, setGetStarted] = useState<boolean>(false);
  const [login, setLogin] = useState<boolean>(false);

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

  return (
    <>
      {getStarted && (
        <GetStarted
          onClose={() => setGetStarted(false)}
          login={() => setLogin(true)}
        />
      )}
      {login && <LoginPopup onClose={() => setLogin(false)} isOpen={login} />}
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-900">
        {/* Navbar */}
        <motion.nav
          className="flex justify-between items-center p-6 md:px-12 relative"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="text-2xl font-bold text-yellow-500"
            whileHover={{ scale: 1.1 }}
          >
            CaringSparks
          </motion.div>

          <motion.div className="hidden md:flex items-center space-x-8">
            <motion.div
              className="flex items-center space-x-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <motion.button
                onClick={() => setLogin(true)}
                className="text-gray-300 hover:text-yellow-400 transition-colors px-4 py-2"
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
                  className="bg-yellow-500 transition-all ease-in-out duration-300 text-white px-6 py-2 rounded-full"
                >
                  Get Started
                </button>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.button
            className="md:hidden z-50 relative"
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
                  <X className="w-6 h-6 text-gray-300" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <List className="w-6 h-6 text-gray-300" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                className="absolute z-20 top-full left-0 right-0 bg-gray-800/95 backdrop-blur-md border-b border-gray-700 shadow-lg md:hidden"
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
                >
                  <motion.div
                    className="pt-4 border-t border-gray-700 space-y-3"
                    variants={menuItemVariants}
                    transition={{ delay: 0.3 }}
                  >
                    <motion.button
                      className="block w-full text-left text-gray-300 hover:text-yellow-400 transition-colors py-2"
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
                        className="w-full bg-yellow-500 text-white rounded-full"
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
              className="text-5xl md:text-7xl font-black mb-6"
            >
              <span className="text-yellow-500">Wanna trend?</span>
            </motion.h1>

            <motion.div variants={fadeInUp} className="relative">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-100 mb-8">
                Then let&apos;s make you trend{" "}
                <span className="relative">
                  overnight
                  <motion.div
                    className="absolute -bottom-2 left-0 w-full h-3 bg-gradient-to-r from-yellow-500 to-pink-500 -z-10"
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
                <Sparkle className="text-yellow-400 w-8 h-8" />
              </motion.div>
              <p className="text-xl md:text-2xl text-gray-400">
                Over <span className="font-bold text-yellow-400">100k+</span>{" "}
                micro influencers
              </p>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              >
                <Star className="text-pink-400 w-8 h-8" />
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* Services Section */}
        <section className="px-6 py-20 bg-slate-900">
          <motion.div
            className="max-w-6xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center mb-16">
              <motion.h3
                className="text-4xl md:text-5xl font-bold text-gray-100 mb-6"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                Whether you&apos;re a
              </motion.h3>
              <motion.div
                className="w-24 h-1 bg-gradient-to-r from-yellow-500 to-pink-500 mx-auto"
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
                  title: "Brand",
                  description:
                    "Build brand awareness and trust with strategic influencer campaigns",
                  icon: "/icons/organization.png",
                  gradient: "from-yellow-500/20 to-yellow-500/10",
                  border: "border-yellow-500/30",
                  iconBg: "bg-yellow-500/20",
                  textColor: "text-yellow-400",
                },
                {
                  title: "Business",
                  description:
                    "Launch and scale your product with targeted influencer partnerships",
                  icon: "/icons/parcel.png",
                  gradient: "from-blue-500/20 to-blue-500/10",
                  border: "border-blue-500/30",
                  iconBg: "bg-blue-500/20",
                  textColor: "text-blue-400",
                },
                {
                  title: "Person",
                  description:
                    "Grow your personal brand and reach with our creator network",
                  icon: "/icons/user.png",
                  gradient: "from-pink-500/20 to-pink-500/10",
                  border: "border-pink-500/30",
                  iconBg: "bg-pink-500/20",
                  textColor: "text-pink-400",
                },
                {
                  title: "Movie",
                  description:
                    "Amplify your service offerings through authentic creator content",
                  icon: "/icons/movie.png",
                  gradient: "from-emerald-500/20 to-emerald-500/10",
                  border: "border-emerald-500/30",
                  iconBg: "bg-emerald-500/20",
                  textColor: "text-emerald-400",
                },
                {
                  title: "Music",
                  description:
                    "Amplify your service offerings through authentic creator content",
                  icon: "/icons/music.png",
                  gradient: "from-slate-500/20 to-slate-500/10",
                  border: "border-slate-500/30",
                  iconBg: "bg-slate-500/20",
                  textColor: "text-slate-400",
                },
                {
                  title: "Event",
                  description:
                    "Drive attendance and engagement for your events and experiences",
                  icon: "/icons/confetti.png",
                  gradient: "from-orange-500/20 to-orange-500/10",
                  border: "border-orange-500/30",
                  iconBg: "bg-orange-500/20",
                  textColor: "text-orange-400",
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
                    className={`bg-gradient-to-br ${
                      item.gradient
                    } backdrop-blur-sm border ${
                      item.border
                    } bg-gray-800/50 p-8 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-${
                      item.textColor.split("-")[1]
                    }-500/10 transition-all duration-300 h-full`}
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
                    <p className="text-gray-400 leading-relaxed">
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
              <h4 className="text-3xl md:text-4xl font-bold text-gray-100 mb-4">
                We have got you covered
              </h4>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
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
                className="text-xl px-12 py-6 bg-gradient-to-r from-yellow-500 to-pink-500 hover:from-yellow-400 hover:to-pink-400 text-white rounded-full shadow-2xl shadow-pink-500/25 group relative overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-pink-400 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity"
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
          className="bg-gray-950 text-white py-12 px-6 border-t border-gray-800"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <h5 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent mb-4">
                CaringSparks
              </h5>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
                Making brands trend overnight with our network of 100k+ micro
                influencers.
              </p>
            </motion.div>

            <motion.div
              className="border-t border-gray-800 pt-8 text-gray-400"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <p>&copy; 2025 CaringSparks. All rights reserved.</p>
            </motion.div>
          </div>
        </motion.footer>
      </div>
    </>
  );
}
