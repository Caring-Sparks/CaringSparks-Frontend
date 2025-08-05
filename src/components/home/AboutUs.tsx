import React from "react";

const AboutUs = () => {
  return (
    <section id="about" className="bg-gray-50">
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
          About Us
        </div>
        <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 animate-fade-in-up delay-500">
          About Us
        </h2>
        <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-up delay-700">
          We are a passionate team of creators, engineers, and innovators
          dedicated to bridging the gap between brands and influencers. Our
          platform empowers meaningful collaborations, simplifies campaign
          management, and drives authentic engagement.
        </p>

        <div className="mt-12 grid sm:grid-cols-3 gap-8 animate-fade-in-up delay-1000">
          <div className="bg-white shadow-md rounded-xl p-6 hover:shadow-xl transition duration-300">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900">Our Mission</h3>
            <p className="mt-2 text-gray-600 text-sm">
              To simplify the collaboration journey and help creators and brands
              grow together through trust, transparency, and technology.
            </p>
          </div>

          <div className="bg-white shadow-md rounded-xl p-6 hover:shadow-xl transition duration-300">
            <div className="text-4xl mb-4">🌍</div>
            <h3 className="text-xl font-semibold text-gray-900">Our Vision</h3>
            <p className="mt-2 text-gray-600 text-sm">
              To be the go-to platform for creator-led brand campaigns globally,
              driven by innovation and authenticity.
            </p>
          </div>

          <div className="bg-white shadow-md rounded-xl p-6 hover:shadow-xl transition duration-300">
            <div className="text-4xl mb-4">💡</div>
            <h3 className="text-xl font-semibold text-gray-900">Our Values</h3>
            <p className="mt-2 text-gray-600 text-sm">
              Empowerment. Integrity. Creativity. Collaboration. These
              principles guide our every decision and feature.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
