"use client";

import { useState, useMemo, useEffect } from "react";
import {
  useAdminAdmins,
  useAdminStats,
  useInitializeAdminData,
} from "@/stores/adminStore";
import {
  BiRefresh,
  BiSearch,
  BiUserCheck,
  BiUserX,
  BiCalendar,
  BiX,
} from "react-icons/bi";
import Image from "next/image";
import { Eye, PencilLine, Trash, UserPlus, Warning } from "phosphor-react";
import Confirmation from "./Confirmation";
import AddManagerPopup from "./AddManagerPopup";
import AddEditManagerPopup from "./AddManagerPopup";
import { useToast } from "@/utils/ToastNotification";

interface ProcessedManager {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  createdAt?: string;
  joinDate?: string;
  updatedAt?: string;
  avatar?: string;
}

type StatusFilter = "all" | "pending" | "approved" | "rejected";
type DateFilter = "all" | "today" | "week" | "month" | "custom";

const Managers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [customDateFrom, setCustomDateFrom] = useState<string>("");
  const [customDateTo, setCustomDateTo] = useState<string>("");
  const [confirmation, setConfirmation] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [addManager, setAddManager] = useState<boolean>(false);
  const [manager, setManager] = useState<string>("");

  // Get data from Zustand store
  const { admins, updateAdmin, deleteAdmin } = useAdminAdmins();
  const { loading, refreshing, error, hasInitialized } = useAdminStats();
  const { fetchAdmins } = useInitializeAdminData();
  const { showToast } = useToast();

  // Initialize data on component mount
  useEffect(() => {
    if (!hasInitialized && !loading) {
      fetchAdmins();
    }
  }, [fetchAdmins, hasInitialized, loading]);
  const totaladmins = admins.length;

  // Extract admin data from the store format
  const ProcessedManager = useMemo<ProcessedManager[]>(() => {
    return admins.map((admin) => ({
      id: admin._id,
      name: (admin as any)?.name || "Unknown",
      email: (admin as any)?.email || "No email",
      phone: (admin as any)?.phoneNumber || "",
      createdAt: (admin as any)?.createdAt || new Date().toISOString(),
      updatedAt: (admin as any)?.updatedAt || "",
      joinDate: (admin as any)?.createdAt || new Date().toISOString(),
      avatar: (admin as any)?.avatar || (admin as any)?.profilePicture,
      ...(admin as any),
    }));
  }, [admins]);

  // Filtered admins based on search, status, and date
  const filteredadmins = useMemo<ProcessedManager[]>(() => {
    // Date filtering logic
    const filterByDate = (date: string): boolean => {
      if (dateFilter === "all") return true;

      const adminDate = new Date(date);
      const today = new Date();

      switch (dateFilter) {
        case "today":
          return adminDate.toDateString() === today.toDateString();
        case "week":
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          return adminDate >= weekAgo;
        case "month":
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          return adminDate >= monthAgo;
        case "custom":
          if (!customDateFrom || !customDateTo) return true;
          const fromDate = new Date(customDateFrom);
          const toDate = new Date(customDateTo);
          return adminDate >= fromDate && adminDate <= toDate;
        default:
          return true;
      }
    };
    return ProcessedManager.filter((admin) => {
      const matchesSearch =
        admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDate = filterByDate(admin.joinDate ?? "");

      return matchesSearch && matchesDate;
    });
  }, [ProcessedManager, searchTerm, customDateFrom, customDateTo, dateFilter]);

  // Handle refresh
  const handleRefresh = (): void => {
    fetchAdmins();
  };

  const handleDelete = async (id: string, name: string) => {
    setDeleting(true);
    try {
      await deleteAdmin(id);
      showToast({
        type: "success",
        title: "Successful!",
        message: `${name} has been deleted`,
        duration: 5000,
      });
      setDeleting(false);
      setConfirmation(false);
    } catch (error: any) {
      console.error("error deleting manager", error);
      setDeleting(false);
      showToast({
        type: "error",
        title: "Sorry!",
        message: `We could not delete ${name}`,
        duration: 5000,
      });
      setConfirmation(false);
    } finally {
      setDeleting(false);
      setConfirmation(false);
    }
  };

  const handleEditManager = (id: any) => {
    setAddManager(true);
    setManager(id);
  };

  const getInitials = (name: string): string => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "U"
    );
  };

  // Show loading only if we haven't initialized AND we're loading
  if (loading && !hasInitialized) {
    return (
      <div className="flex justify-center flex-col items-center h-screen">
        <div className="loaderr"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-red-800 text-sm">
              <strong>Error:</strong> {error}
            </div>
            <button
              onClick={handleRefresh}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* header */}
      <div className="flex justify-between items-center gap-4">
        <span className="flex flex-col justify-start">
          <h2 className="text-2xl font-bold text-gray-900">Your Managers</h2>
          <p>All Managers: {totaladmins}</p>
        </span>
        <button
          onClick={() => setAddManager(true)}
          className="px-6 flex items-center gap-3 cursor-pointer hover:bg-orange-700 transition-all ease-in duration-300 py-2 rounded-md bg-orange-600 text-white border border-slate-200"
        >
          <UserPlus />
          Add
        </button>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <BiRefresh
              size={16}
              className={`mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <div className="relative">
            <BiSearch
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search managers..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          <select
            value={dateFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setDateFilter(e.target.value as DateFilter)
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
      </div>

      {/* Custom date range inputs */}
      {dateFilter === "custom" && (
        <div className="flex gap-4 items-center bg-white p-4 rounded-lg border border-gray-200">
          <BiCalendar className="text-gray-400" size={18} />
          <input
            type="date"
            value={customDateFrom}
            onChange={(e) => setCustomDateFrom(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={customDateTo}
            onChange={(e) => setCustomDateTo(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Administrator
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Join Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredadmins.length > 0 ? (
                filteredadmins.map((admin) => (
                  <tr
                    key={admin.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {admin.avatar ? (
                          <Image
                            src={admin.avatar}
                            alt={admin.name}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                            {getInitials(admin.name)}
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {admin.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {admin.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {admin.phoneNumber
                        ? `${admin.phoneNumber}`
                        : "Not provided"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(admin.joinDate ?? "").toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                        onClick={() => setConfirmation(true)}
                      >
                        <Trash size={16} />
                      </button>
                      <button
                        className="text-orange-600 hover:text-orange-800 p-2 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Edit"
                        onClick={() => handleEditManager(admin.id)}
                      >
                        <PencilLine size={16} />
                      </button>
                    </td>
                    {confirmation && (
                      <Confirmation
                        setConfirmation={setConfirmation}
                        handleDelete={handleDelete}
                        deleting={deleting}
                        id={admin.id}
                        name={admin.name}
                      />
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {searchTerm ||
                    statusFilter !== "all" ||
                    dateFilter !== "all"
                      ? "No admins found matching your criteria."
                      : "No admins available."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Conditionally rendered */}
      {addManager && (
        <AddEditManagerPopup
          isOpen={addManager}
          onClose={() => setAddManager(false)}
          onSuccess={handleRefresh}
          managerId={manager}
        />
      )}
    </div>
  );
};

export default Managers;
