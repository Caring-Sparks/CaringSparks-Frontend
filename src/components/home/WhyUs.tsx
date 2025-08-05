import React from "react";
import { features } from "../../../constants";

const WhyUs = () => {
  return (
    <section id="why-us" className="">
      <div className="max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
          Why Us?
        </div>
        <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 animate-fade-in-up delay-500">
          Why Choose Us?
        </h2>
        <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-up delay-700">
          We’re not just another influencer platform. We provide everything you
          need to build authentic, scalable campaigns that deliver real results.
        </p>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up delay-1000">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-gray-50 hover:bg-white transition duration-300 shadow-md rounded-xl p-6 text-left"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-gray-600 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
