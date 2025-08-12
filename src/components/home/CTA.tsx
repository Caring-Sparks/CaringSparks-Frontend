import Image from "next/image";
import React from "react";

const CTA = () => {
  return (
    <section className="">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg shadow-green-600/10 border border-slate-200 overflow-hidden grid md:grid-cols-2 gap-10 items-center p-10 md:p-16">
          {/* TEXT SECTION */}
          <div className="animate-fade-in-up delay-500">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Launch Campaigns in Hours, Not Weeks
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Go from concept to live in a single afternoon. With instant
              creator applications, real-time approvals, and rapid payments,
              your campaign is live before most teams even finish their kickoff
              meeting.
            </p>

            <button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 shadow-lg">
              Launch Your Campaign
            </button>
          </div>

          {/* IMAGE SECTION */}
          <div className="animate-fade-in-up delay-700">
            <Image
              src="/images/campaign_image.png"
              alt="Campaign process"
              width={500}
              height={400}
              className="w-84 place-self-end object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
