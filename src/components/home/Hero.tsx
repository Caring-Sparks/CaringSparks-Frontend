"use client";

import React, { useState, useEffect } from "react";

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const textArray = [
    "Real Influencers",
    "Authentic Creators",
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
    <header className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-200 to-indigo-300 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-indigo-200 to-purple-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-r from-blue-100 to-indigo-200 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-indigo-400 rounded-full opacity-40 animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${8 + Math.random() * 6}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 mt-20 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-5xl">
          {/* Main heading with animated text */}
          <div className="mb-8">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 leading-tight mb-4">
              Connect Brands with{" "}
              <span className="relative inline-block lg:whitespace-nowrap">
                {textArray.map((text, index) => (
                  <span
                    key={index}
                    className={`absolute top-0 left-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent transition-all duration-1000 ease-in-out ${
                      index === currentIndex
                        ? "opacity-100 transform translate-y-0"
                        : "opacity-0 transform translate-y-4"
                    }`}
                  >
                    {text}
                  </span>
                ))}
                <span className="invisible">{textArray[0]}</span>
              </span>
            </h1>
          </div>

          {/* Subtitle with stagger animation */}
          <div className="mb-8 sm:mb-12 space-y-1 sm:space-y-2">
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 animate-fade-in-up delay-300 px-4 sm:px-0">
              The revolutionary platform that transforms
            </p>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 animate-fade-in-up delay-500 px-4 sm:px-0">
              how brands discover and collaborate with creators
            </p>
          </div>

          {/* Stats section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 animate-fade-in-up delay-700 px-4 sm:px-0">
            <div className="bg-white/70 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                10K+
              </div>
              <div className="text-sm sm:text-base text-gray-600">
                Active Creators
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                500+
              </div>
              <div className="text-sm sm:text-base text-gray-600">
                Brand Partners
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                $2M+
              </div>
              <div className="text-sm sm:text-base text-gray-600">
                Campaigns Value
              </div>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4 lg:space-x-6 animate-fade-in-up delay-1000 px-4 sm:px-0">
            <button className="group relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-base sm:text-lg font-semibold rounded-full shadow-xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
              <span className="relative z-10">Start Your Journey</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            <button className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-transparent border-2 border-gray-300 text-gray-700 text-base sm:text-lg font-semibold rounded-full backdrop-blur-sm hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 transform hover:scale-105">
              Watch Demo
              <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300 inline-block">
                →
              </span>
            </button>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 sm:mt-16 animate-fade-in-up delay-1200 px-4 sm:px-0">
            <p className="text-gray-500 text-xs sm:text-sm mb-4 sm:mb-6">
              Trusted by leading brands worldwide
            </p>
            <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6 lg:gap-8 opacity-60">
              <div className="bg-white/50 px-3 sm:px-6 py-2 sm:py-3 rounded-lg backdrop-blur-sm border border-gray-200 text-gray-700 text-xs sm:text-sm">
                Brand 1
              </div>
              <div className="bg-white/50 px-3 sm:px-6 py-2 sm:py-3 rounded-lg backdrop-blur-sm border border-gray-200 text-gray-700 text-xs sm:text-sm">
                Brand 2
              </div>
              <div className="bg-white/50 px-3 sm:px-6 py-2 sm:py-3 rounded-lg backdrop-blur-sm border border-gray-200 text-gray-700 text-xs sm:text-sm">
                Brand 3
              </div>
              <div className="bg-white/50 px-3 sm:px-6 py-2 sm:py-3 rounded-lg backdrop-blur-sm border border-gray-200 text-gray-700 text-xs sm:text-sm">
                Brand 4
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-500 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }

        .delay-300 {
          animation-delay: 0.3s;
        }
        .delay-500 {
          animation-delay: 0.5s;
        }
        .delay-700 {
          animation-delay: 0.7s;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
        .delay-1200 {
          animation-delay: 1.2s;
        }
        .delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </header>
  );
};

export default Hero;
