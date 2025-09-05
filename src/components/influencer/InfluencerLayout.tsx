"use client";

import React, { useEffect, useState } from "react";
// import { useInitializeAdminData } from "@/stores/adminStore";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface InfluencerLayoutProps {
  children: React.ReactNode;
}

interface InfluencerData {
  name: string;
  username: string;
  email: string;
  phone: string;
  bio: string;
  followers: number;
  engagement: number;
  approvalStatus: "approved" | "pending" | "rejected";
  totalEarnings: number;
  activeJobs: number;
  completedJobs: number;
}

const InfluencerLayout: React.FC<InfluencerLayoutProps> = ({ children }) => {
  //   const { fetchData, loading, fetchUser } = useInitializeAdminData();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  //   useEffect(() => {
  //     fetchData();
  //     fetchUser();
  //   }, []);

  //   if (loading) {
  //     return (
  //       <div className="flex justify-center flex-col items-center h-screen">
  //         <div className="loaderr"></div>
  //         <p className="mt-4">Loading Infuencer data...</p>
  //       </div>
  //     );
  //   }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex w-full">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="w-full lg:ml-64">
          <Header sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

          <main className="">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default InfluencerLayout;
