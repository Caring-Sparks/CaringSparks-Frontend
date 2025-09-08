import React, { Suspense } from "react";
import InfluencerAssignment from "@/components/admin/influencerAssignment/InfluencerAssignment";

const Loader = () => (
  <div className="flex items-center justify-center min-h-96">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
      <div className="text-lg text-gray-600">Loading brand data...</div>
    </div>
  </div>
);

const Page = () => {
  return (
    <Suspense fallback={<Loader />}>
      <InfluencerAssignment />
    </Suspense>
  );
};

export default Page;
