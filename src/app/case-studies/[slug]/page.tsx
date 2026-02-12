"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "phosphor-react";
import { caseStudies } from "../../../../constants";
import { celebrityContent } from "../../../../constants/caseStudies/celebrity";
import { politicalContent } from "../../../../constants/caseStudies/political";
import { startupContent } from "../../../../constants/caseStudies/startup";
import { walkinContent } from "../../../../constants/caseStudies/walkin";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";

export default function CaseStudyDetail() {
  const params = useParams();
  const slug = params.slug as string;

  const study = caseStudies.find((s) => s.slug === slug);

  if (!study) {
    notFound();
  }

  // Get full content based on slug
  let fullContent = "Full case study content coming soon. Please check back later for the complete article.";
  
  if (slug === "celebrity-marketing-wizkid-pepsi") {
    fullContent = celebrityContent;
  } else if (slug === "political-campaigns-micro-influencers") {
    fullContent = politicalContent;
  } else if (slug === "startup-app-first-customer") {
    fullContent = startupContent;
  } else if (slug === "walk-in-businesses-nightclubs-restaurants") {
    fullContent = walkinContent;
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero section */}
      <header className="relative h-[60vh] overflow-hidden">
        <Image
          src={study.image}
          alt={study.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30"></div>

        <div className="relative z-10 h-full flex items-end">
          <div className="max-w-7xl mx-auto px-6 pb-16 w-full">
            <Link
              href="/case-studies"
              className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 mb-6 transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Case Studies
            </Link>

            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="text-sm font-semibold text-yellow-400 bg-yellow-400/10 px-4 py-2 rounded-full border border-yellow-400/20">
                {study.category}
              </span>
              <span className="text-sm text-gray-400">{study.readTime}</span>
              <span className="text-sm text-gray-400">•</span>
              <span className="text-sm text-gray-400">
                {new Date(study.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-white mb-6 max-w-4xl">
              {study.title}
            </h1>

            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl">{study.excerpt}</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <article className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-invert prose-lg max-w-none">
            <div className="text-gray-300 leading-relaxed whitespace-pre-line text-base sm:text-lg">
              {fullContent}
            </div>
          </div>
        </div>
      </article>

      {/* CTA */}
      <section className="py-16 px-6 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Create Your Own Success Story?
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Join thousands of brands and influencers achieving remarkable
            results through our platform.
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold rounded-full hover:shadow-xl hover:shadow-yellow-500/30 transition-all duration-300 transform hover:scale-105"
          >
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  );
}
