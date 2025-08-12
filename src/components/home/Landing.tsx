"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { ArrowRight, Lightning, List, Sparkle, Star, X } from "phosphor-react";
import { useState } from "react";

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Navbar */}
      <motion.nav
        className="flex justify-between items-center p-6 md:px-12 relative"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
          whileHover={{ scale: 1.1 }}
        >
          CaringSparks
        </motion.div>

        <motion.div className="hidden md:flex items-center space-x-8">
          {["Services", "About", "Contact"].map((item, index) => (
            <motion.a
              key={item}
              href="#"
              className="text-gray-700 hover:text-purple-600 transition-colors"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              whileHover={{ y: -2 }}
            >
              {item}
            </motion.a>
          ))}

          <motion.div
            className="flex items-center space-x-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <motion.button
              className="text-gray-700 hover:text-purple-600 transition-colors px-4 py-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Login
            </motion.button>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-full">
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
                <X className="w-6 h-6 text-gray-700" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <List className="w-6 h-6 text-gray-700" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="absolute z-20 top-full left-0 right-0 bg-white backdrop-blur-md border-b border-gray-200 shadow-lg md:hidden"
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
                {["Services", "About", "Contact"].map((item, index) => (
                  <motion.a
                    key={item}
                    href="#"
                    className="block text-gray-700 hover:text-purple-600 transition-colors py-2"
                    variants={menuItemVariants}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 10 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item}
                  </motion.a>
                ))}

                <motion.div
                  className="pt-4 border-t border-gray-200 space-y-3"
                  variants={menuItemVariants}
                  transition={{ delay: 0.3 }}
                >
                  <motion.button
                    className="block w-full text-left text-gray-700 hover:text-purple-600 transition-colors py-2"
                    whileHover={{ x: 10 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </motion.button>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full"
                      onClick={() => setIsMobileMenuOpen(false)}
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
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
              Wanna trend?
            </span>
          </motion.h1>

          <motion.div variants={fadeInUp} className="relative">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-8">
              Then let's make you trend{" "}
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
              <Sparkle className="text-purple-500 w-8 h-8" />
            </motion.div>
            <p className="text-xl md:text-2xl text-gray-600">
              Over <span className="font-bold text-purple-600">100k+</span>{" "}
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
              <Star className="text-pink-500 w-8 h-8" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Services Section */}
      <section className="px-6 py-20 bg-gradient-to-b from-slate-50 to-white">
        <motion.div
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-16">
            <motion.h3
              className="text-4xl md:text-5xl font-bold text-slate-800 mb-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Whether you're a
            </motion.h3>
            <motion.div
              className="w-24 h-1 bg-gradient-to-r from-purple-600 to-pink-600 mx-auto"
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
                icon: "📦",
                gradient: "from-blue-500/10 to-blue-600/20",
                border: "border-blue-200",
                iconBg: "bg-blue-100",
                textColor: "text-blue-700",
              },
              {
                title: "Service",
                description:
                  "Amplify your service offerings through authentic creator content",
                icon: "⚡",
                gradient: "from-emerald-500/10 to-emerald-600/20",
                border: "border-emerald-200",
                iconBg: "bg-emerald-100",
                textColor: "text-emerald-700",
              },
              {
                title: "Brand",
                description:
                  "Build brand awareness and trust with strategic influencer campaigns",
                icon: "🏢",
                gradient: "from-purple-500/10 to-purple-600/20",
                border: "border-purple-200",
                iconBg: "bg-purple-100",
                textColor: "text-purple-700",
              },
              {
                title: "Person",
                description:
                  "Grow your personal brand and reach with our creator network",
                icon: "👤",
                gradient: "from-pink-500/10 to-pink-600/20",
                border: "border-pink-200",
                iconBg: "bg-pink-100",
                textColor: "text-pink-700",
              },
              {
                title: "Event",
                description:
                  "Drive attendance and engagement for your events and experiences",
                icon: "🎉",
                gradient: "from-orange-500/10 to-orange-600/20",
                border: "border-orange-200",
                iconBg: "bg-orange-100",
                textColor: "text-orange-700",
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
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
                    <span className="text-2xl">{item.icon}</span>
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
            <h4 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              We have got you covered
            </h4>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Our comprehensive platform connects you with the right influencers
              to achieve your unique goals
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
            <button className="text-xl px-12 py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full shadow-2xl group relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-pink-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"
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
        className="bg-gray-900 text-white py-12 px-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h5 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                TrendMaker
              </h5>
              <p className="text-gray-400">
                Making brands trend overnight with our network of 100k+ micro
                influencers.
              </p>
            </motion.div>

            {[
              {
                title: "Services",
                items: [
                  "Influencer Marketing",
                  "Brand Campaigns",
                  "Social Media",
                  "Analytics",
                ],
              },
              {
                title: "Company",
                items: ["About Us", "Careers", "Contact", "Blog"],
              },
              {
                title: "Support",
                items: ["Help Center", "Terms", "Privacy", "FAQ"],
              },
            ].map((column, index) => (
              <motion.div
                key={column.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <h6 className="font-semibold mb-4">{column.title}</h6>
                <ul className="space-y-2">
                  {column.items.map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <p>&copy; 2025 CaringSparks. All rights reserved.</p>
          </motion.div>
        </div>
      </motion.footer>
    </div>
  );
}
