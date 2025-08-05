"use client";

import React, { useState, useEffect, useRef } from "react";
import { allSteps } from "../../../constants";

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
  const [selectedFilter, setSelectedFilter] = useState<
    "influencer" | "brand" | "campaign"
  >("campaign");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const stepIndex = parseInt(
              entry.target.getAttribute("data-step") || "0"
            );
            setVisibleSteps((prev) => new Set([...prev, stepIndex]));
          }
        });
      },
      { threshold: 0.3 }
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
    <section id="how-it-works" className="">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            How It Works
          </div>
          {/* TABS */}
          <div className="flex gap-4 justify-center py-8">
            {["campaign", "influencer", "brand"].map((filter) => (
              <button
                key={filter}
                onClick={() =>
                  setSelectedFilter(
                    filter as "campaign" | "influencer" | "brand"
                  )
                }
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                  selectedFilter === filter
                    ? "bg-green-600 text-white shadow-md border-green-600"
                    : "bg-white text-gray-600 hover:bg-gray-100 border-gray-300"
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-6">
            Your Journey to{" "}
            <span className="bg-gradient-to-r from-green-400 via-green-600 to-green-900 bg-clip-text text-transparent">
              Influence Success
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            From profile creation to getting paid, we have streamlined every step
            of the influencer-brand collaboration process
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 sm:left-1/2 transform sm:-translate-x-0.5 top-0 bottom-0 w-1 bg-gradient-to-b from-green-200 via-green-200 to-teal-200"></div>

          {/* Animated progress line */}
          <div
            className="absolute left-4 sm:left-1/2 transform sm:-translate-x-0.5 top-0 w-1 bg-gradient-to-b from-green-400 via-green-500 to-teal-500 transition-all duration-1000 ease-out"
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
                    className={`w-8 h-8 rounded-full border-4 border-white shadow-lg transition-all duration-500 ${
                      visibleSteps.has(index) || activeStep >= index
                        ? `bg-black scale-110`
                        : "bg-gray-300 scale-100"
                    }`}
                  >
                    <div className="w-full h-full rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {step.id}
                    </div>
                  </div>

                  {/* Pulse animation for active step */}
                  {activeStep === index && (
                    <div
                      className={`absolute inset-0 rounded-full bg-gradient-to-r ${step.color} animate-ping opacity-30`}
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
                    className={`group relative ${
                      step.bgColor
                    } rounded-2xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform ${
                      visibleSteps.has(index)
                        ? "translate-y-0 opacity-100"
                        : "translate-y-8 opacity-0"
                    } hover:scale-105 hover:-translate-y-2 border border-white/50 backdrop-blur-sm`}
                  >
                    {/* Time indicator */}
                    <div
                      className={`absolute -top-3 ${
                        index % 2 === 0 ? "right-4" : "left-4"
                      } px-3 py-1 bg-white rounded-full shadow-md`}
                    >
                      <span className="text-xs font-semibold text-gray-600">
                        {step.time}
                      </span>
                    </div>

                    {/* Icon */}
                    <div className="flex items-center mb-4">
                      <div
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        {step.icon}
                      </div>
                      <div className="ml-4">
                        <span className="text-sm font-medium text-gray-500">
                          Step {step.id}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 transition-all duration-300">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Decorative elements */}
                    <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                    <div className="absolute -top-2 -left-2 w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                  </div>
                </div>

                {/* Mobile timeline connection */}
                <div className="hidden sm:block sm:w-2/12"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 sm:mt-20">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4">
            <button className="group relative px-8 py-4 bg-gradient-to-r from-green-400 to-green-600 text-white text-lg font-semibold rounded-full shadow-xl hover:shadow-green-500/30 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
              <span className="relative z-10">
                {selectedFilter === "influencer"
                  ? "Start Your Journey Today"
                  : selectedFilter === "brand"
                  ? "Launch Your First Campaign"
                  : "Plan Your Campaign"}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </button>
            <p className="text-sm text-gray-500">
              {selectedFilter === "influencer"
                ? "Join 10,000+ creators already earning with brands"
                : selectedFilter === "brand"
                ? "Trusted by 500+ brands worldwide"
                : "Over $2M+ in successful campaigns launched"}
            </p>
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
