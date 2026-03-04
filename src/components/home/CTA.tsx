import Image from "next/image";
import React from "react";

interface CtaProps {
  openPopup: () => void;
}

const CTA = ({ openPopup }: CtaProps) => {
  return (
    <section className="bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl shadow-yellow-600/20 border border-yellow-500/30 overflow-hidden grid md:grid-cols-2 gap-10 items-center p-10 md:p-16">
          {/* TEXT SECTION */}
          <div className="animate-fade-in-up delay-500">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
              Launch Campaigns in <span className="txt">Hours</span>, Not Weeks
            </h2>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              No more worrying about the fact that you lack followers or social
              media presence, No more worrying about getting your ads approved.
              No more worrying about running expensive ads that don&apos;t generate
              customers. The power is in your hands now. It&apos;s time to blow!!!
            </p>

            <button
              onClick={openPopup}
              className="group relative px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold rounded-full transition-all duration-300 shadow-lg shadow-yellow-500/30 hover:shadow-xl hover:shadow-yellow-500/50 transform hover:scale-105 hover:-translate-y-1"
            >
              <span className="relative z-10">Launch Your Campaign</span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-yellow-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>

          {/* IMAGE SECTION */}
          <div className="animate-fade-in-up delay-700">
            <Image
              src="/images/campaign_image.png"
              alt="Campaign process"
              width={500}
              height={400}
              className="w-full place-self-end object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
