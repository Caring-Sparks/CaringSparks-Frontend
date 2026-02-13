"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import React from "react";

const AboutUs = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section className="bg-black py-16 sm:py-20 lg:py-24 relative overflow-hidden px-6">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-yellow-400/10 text-yellow-400 rounded-full text-sm font-semibold mb-6 border border-yellow-400/20">
            <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></span>
            What We Do
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6">
            Empowering Every <span className="txt">Business Type</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto px-4">
            Whether you&apos;re launching a product, building a brand, or growing
            your business, our micro-influencer network helps you reach the
            right audience authentically.
          </p>
        </div>

        {/* Cards Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {[
            {
              title: "Product",
              description:
                "Launch and scale your product with targeted influencer partnerships that drive real conversions",
              icon: "/icons/parcel.png",
            },
            {
              title: "Service",
              description:
                "Amplify your service offerings through authentic creator content that builds trust",
              icon: "/icons/power.png",
            },
            {
              title: "Brand",
              description:
                "Build brand awareness and credibility with strategic influencer campaigns",
              icon: "/icons/organization.png",
            },
            {
              title: "Person",
              description:
                "Grow your personal brand and reach with our extensive creator network",
              icon: "/icons/user.png",
            },
            {
              title: "Event",
              description:
                "Drive attendance and engagement for your events through local influencer promotion",
              icon: "/icons/confetti.png",
            },
            {
              title: "Business",
              description:
                "Push your new or existing business to millions of people across Nigeria",
              icon: "/icons/campaign.png",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group cursor-pointer"
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-yellow-500/50 p-6 sm:p-8 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-yellow-500/10 transition-all duration-300 h-full">
                {/* Icon */}
                <div className="bg-yellow-400/10 w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-yellow-400/20 transition-all duration-300 border border-yellow-400/20">
                  <Image
                    src={item.icon}
                    alt={item.title}
                    width={32}
                    height={32}
                    className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
                  />
                </div>

                {/* Content */}
                <h4 className="text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors duration-300">
                  {item.title}
                </h4>
                <p className="text-gray-400 leading-relaxed text-sm sm:text-base">
                  {item.description}
                </p>

                {/* Decorative element */}
                <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-yellow-400/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AboutUs;
