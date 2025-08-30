"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/admin/Header";
import Sidebar from "@/components/admin/Sidebar";
import { useInitializeAdminData } from "@/stores/adminStore";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { fetchData, loading, fetchAdmins, fetchUser } =
    useInitializeAdminData();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    fetchData();
    fetchAdmins();
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center flex-col items-center h-screen">
        <div className="loaderr"></div>
        <p className="mt-4">Loading Admin data...</p>
      </div>
    );
  }

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

export default AdminLayout;
