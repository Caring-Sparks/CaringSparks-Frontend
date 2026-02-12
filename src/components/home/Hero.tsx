"use client";

import { CaretDoubleDown } from "phosphor-react";
import React, { useState, useEffect } from "react";
import { brands } from "../../../constants";
import Image from "next/image";

interface heroProps {
  openPopup: () => void;
}

const Hero = ({ openPopup }: heroProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const textArray = [
    "Real Influencers",
    "Real Creators",
    "Brand Partners",
    "Success Stories",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % textArray.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [textArray.length]);

  return (
    <header
      id="home"
      className="relative min-h-screen bg-black overflow-hidden"
    >
      {/* Floating particles - hidden on mobile for performance */}
      <div className="absolute inset-0 hidden md:block">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full opacity-40 animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${8 + Math.random() * 6}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 flex items-center justify-center min-h-screen">
        <div className="text-center w-full max-w-5xl">
          {/* Main heading with animated text */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight">
              Connect Brands with{" "}
              <span className="relative inline-block min-h-[1.2em] align-bottom">
                <span className="block sm:inline-block mt-2 sm:mt-0">
                  {textArray.map((text, index) => (
                    <span
                      key={index}
                      className={`absolute top-0 left-0 right-0 sm:left-auto sm:right-auto bg-gradient-to-r from-white via-yellow-600 to-yellow-900 bg-clip-text text-transparent transition-all duration-1000 ease-in-out whitespace-nowrap ${
                        index === currentIndex
                          ? "opacity-100 transform translate-y-0"
                          : "opacity-0 transform translate-y-4"
                      }`}
                    >
                      {text}
                    </span>
                  ))}
                  <span className="invisible whitespace-nowrap">{textArray[0]}</span>
                </span>
              </span>
            </h1>
          </div>

          {/* Subtitle with stagger animation */}
          <div className="mb-8 sm:mb-10 lg:mb-12 space-y-2">
            <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-300 animate-fade-in-up delay-300 px-2 sm:px-4 lg:px-0">
              The revolutionary platform that transforms
            </p>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-300 animate-fade-in-up delay-500 px-2 sm:px-4 lg:px-0">
              how brands discover and collaborate with creators
            </p>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 lg:gap-6 animate-fade-in-up delay-1000 px-4 sm:px-0">
            <button
              onClick={openPopup}
              className="group relative w-full sm:w-auto min-w-[200px] px-6 sm:px-8 lg:px-10 py-3 sm:py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-sm sm:text-base lg:text-lg font-semibold rounded-full shadow-xl hover:shadow-yellow-500/30 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <span className="relative z-10">Start Your Journey</span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-yellow-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>

          {/* Trust indicators */}
          <div className="mt-10 sm:mt-12 lg:mt-16 animate-fade-in-up delay-1200">
            <p className="text-gray-500 text-xs sm:text-sm mb-4 sm:mb-6 text-center">
              Trusted by leading brands worldwide
            </p>

            <div className="relative w-full overflow-hidden mask-gradient">
              <div className="flex animate-infinite-scroll w-max items-center gap-4 sm:gap-6 lg:gap-8 opacity-60 hover:opacity-80 transition-opacity">
                {[...brands, ...brands].map((brand, id) => (
                  <div key={id} className="flex-shrink-0">
                    <Image
                      src={brand.path}
                      width={40}
                      height={40}
                      alt="brand-logo"
                      className="object-contain w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <CaretDoubleDown color="white" size={20} className="sm:w-6 sm:h-6" />
      </div>
    </header>
  );
};

export default Hero;
