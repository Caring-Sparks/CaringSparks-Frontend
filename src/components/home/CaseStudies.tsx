"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "phosphor-react";
import { caseStudies } from "../../../constants";

const CaseStudies = () => {
  return (
    <section id="case-studies" className="bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
            Success <span className="txt">Stories</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto px-4">
            See how brands and influencers are achieving remarkable results through our platform
          </p>
        </div>

        {/* Case studies grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12">
          {caseStudies.map((study) => (
            <Link
              key={study.id}
              href={`/case-studies/${study.slug}`}
              className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden border border-gray-700 hover:border-yellow-500 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-yellow-500/20"
            >
              {/* Image */}
              <div className="relative h-48 sm:h-56 overflow-hidden">
                <Image
                  src={study.image}
                  alt={study.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full">
                    {study.category}
                  </span>
                  <span className="text-xs text-gray-500">{study.readTime}</span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                  {study.title}
                </h3>

                <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                  {study.excerpt}
                </p>

                {/* Read more indicator */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <span className="text-sm text-gray-500">{study.readTime}</span>
                  <ArrowRight
                    size={20}
                    className="text-yellow-400 group-hover:translate-x-1 transition-transform"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View all button */}
        <div className="text-center">
          <Link
            href="/case-studies"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-semibold rounded-full hover:shadow-xl hover:shadow-yellow-500/30 transition-all duration-300 transform hover:scale-105"
          >
            View All Case Studies
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CaseStudies;
