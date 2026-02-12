"use client"

import Link from "next/link";
import { ArrowLeft } from "phosphor-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-6xl font-black text-white mb-4">404</h1>
        <h2 className="text-2xl font-bold text-white mb-4">
          Case Study Not Found
        </h2>
        <p className="text-gray-400 mb-8">
          The case study you're looking for doesn't exist or has been removed.
        </p>
        <Link
          href="/case-studies"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-semibold rounded-full hover:shadow-xl hover:shadow-yellow-500/30 transition-all duration-300"
        >
          <ArrowLeft size={20} />
          Back to Case Studies
        </Link>
      </div>
    </div>
  );
}
