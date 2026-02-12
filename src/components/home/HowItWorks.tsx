"use client";

import React, { useState, useEffect, useRef } from "react";
import { allSteps } from "../../../constants";
import Image from "next/image";

interface Step {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  time: string;
}

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set());
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<"influencer" | "advertiser">(
    "advertiser",
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const stepIndex = parseInt(
              entry.target.getAttribute("data-step") || "0",
            );
            setVisibleSteps((prev) => new Set([...prev, stepIndex]));
          }
        });
      },
      { threshold: 0.3 },
    );

    const timeout = setTimeout(() => {
      stepRefs.current.forEach((ref) => {
        if (ref) observer.observe(ref);
      });
    }, 0);

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, [selectedFilter]);

  useEffect(() => {
    const interval = setInterval(() => {
      const steps = allSteps[selectedFilter];
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [selectedFilter]);

  useEffect(() => {
    setVisibleSteps(new Set());
    setActiveStep(0);
  }, [selectedFilter]);

  const steps: Step[] = allSteps[selectedFilter];

  return (
    <section id="how-it-works" className="bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-yellow-400/10 text-yellow-400 rounded-full text-sm font-semibold mb-6 border border-yellow-400/20">
            <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></span>
            How It Works
          </div>
          {/* TABS */}
          <div className="flex gap-4 justify-center py-8">
            {["influencer", "advertiser"].map((filter) => (
              <button
                key={filter}
                onClick={() =>
                  setSelectedFilter(filter as "influencer" | "advertiser")
                }
                className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 border ${
                  selectedFilter === filter
                    ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-lg shadow-yellow-500/30 border-yellow-400"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-700"
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6">
            Your Journey to{" "}
            <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
              Success
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto">
            From profile creation to getting paid, we've streamlined every
            step of the influencer-brand collaboration process
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 sm:left-1/2 transform sm:-translate-x-0.5 top-0 bottom-0 w-1 bg-gradient-to-b from-gray-700 via-gray-700 to-gray-700"></div>

          {/* Animated progress line */}
          <div
            className="absolute left-4 sm:left-1/2 transform sm:-translate-x-0.5 top-0 w-1 bg-gradient-to-b from-yellow-400 via-yellow-500 to-yellow-600 transition-all duration-1000 ease-out"
            style={{ height: `${((activeStep + 1) / steps.length) * 100}%` }}
          ></div>

          {/* Steps */}
          <div className="space-y-12 sm:space-y-16">
            {steps.map((step: Step, index: number) => (
              <div
                key={step.id}
                ref={(el) => {
                  if (el) stepRefs.current[index] = el;
                }}
                data-step={index}
                className={`relative flex items-center ${
                  index % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"
                }`}
              >
                {/* Timeline dot */}
                <div className="absolute left-4 sm:left-1/2 transform sm:-translate-x-1/2 z-10">
                  <div
                    className={`w-8 h-8 rounded-full border-4 shadow-lg transition-all duration-500 ${
                      visibleSteps.has(index) || activeStep >= index
                        ? `bg-gradient-to-r from-yellow-400 to-yellow-600 border-yellow-300 scale-110`
                        : "bg-gray-700 border-gray-600 scale-100"
                    }`}
                  >
                    <div className="w-full h-full rounded-full flex items-center justify-center text-black text-sm font-bold">
                      {step.id}
                    </div>
                  </div>

                  {/* Pulse animation for active step */}
                  {activeStep === index && (
                    <div
                      className="absolute inset-0 rounded-full bg-yellow-400 animate-ping opacity-30"
                    ></div>
                  )}
                </div>

                {/* Content card */}
                <div
                  className={`ml-16 sm:ml-0 sm:w-5/12 ${
                    index % 2 === 0 ? "sm:pr-12" : "sm:pl-12"
                  }`}
                >
                  <div
                    className={`group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 sm:p-8 shadow-xl hover:shadow-2xl hover:shadow-yellow-500/10 transition-all duration-500 transform ${
                      visibleSteps.has(index)
                        ? "translate-y-0 opacity-100"
                        : "translate-y-8 opacity-0"
                    } hover:scale-105 hover:-translate-y-2 border border-gray-700 hover:border-yellow-500/50`}
                  >
                    {/* Time indicator */}
                    <div
                      className={`absolute -top-3 ${
                        index % 2 === 0 ? "right-4" : "left-4"
                      } px-3 py-1 bg-yellow-400 text-black rounded-full shadow-md`}
                    >
                      <span className="text-xs font-bold">
                        {step.time}
                      </span>
                    </div>

                    {/* Icon */}
                    <div className="flex items-center mb-4">
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Image
                          src={step.icon}
                          alt={step.title}
                          width={40}
                          height={40}
                          className="w-8"
                        />
                      </div>
                      <div className="ml-4">
                        <span className="text-sm font-semibold text-yellow-400">
                          Step {step.id}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 transition-all duration-300 group-hover:text-yellow-400">
                      {step.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Decorative elements */}
                    <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-yellow-400/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute -top-2 -left-2 w-12 h-12 bg-yellow-400/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>

                {/* Mobile timeline connection */}
                <div className="hidden sm:block sm:w-2/12"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default HowItWorks;
