"use client";

import { BiEdit, BiSearch, BiCalendar, BiRefresh } from "react-icons/bi";
import { useEffect, useState, useMemo } from "react";
import {
  useAdminBrands,
  useAdminStats,
  useInitializeAdminData,
} from "@/stores/adminStore";
import { Eye, Trash } from "phosphor-react";
import BrandDetails from "./BrandDetails";

// Define the expected structure of brand data
// Define the expected structure of brand data
interface BrandData {
  _id: string; // Changed from 'id'
  role?: string;
  platforms?: string[];
  brandName?: string;
  email?: string;
  brandPhone?: string;
  influencersMin?: number;
  influencersMax?: number;
  followersRange?: string;
  location?: string;
  additionalLocations?: string[];
  postFrequency?: string;
  postDuration?: string;
  avgInfluencers?: number;
  postCount?: number;
  costPerInfluencerPerPost?: number;
  totalBaseCost?: number;
  platformFee?: number;
  totalCost?: number;
  hasPaid?: boolean;
  isValidated?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface Brand {
  _id: string; // Changed from 'id'
  role?: string;
  platforms?: string[];
  brandName?: string;
  email?: string;
  brandPhone?: string;
  influencersMin?: number;
  influencersMax?: number;
  followersRange?: string;
  location?: string;
  additionalLocations?: string[];
  postFrequency?: string;
  postDuration?: string;
  avgInfluencers?: number;
  postCount?: number;
  costPerInfluencerPerPost?: number;
  totalBaseCost?: number;
  platformFee?: number;
  totalCost?: number;
  hasPaid?: boolean;
  isValidated?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

type DateFilter = "all" | "today" | "week" | "month" | "custom";
type PaymentFilter = "all" | "paid" | "unpaid";
type ValidationFilter = "all" | "validated" | "unvalidated";

interface StatusCounts {
  paid: number;
  unpaid: number;
  validated: number;
  unvalidated: number;
}

const BrandsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const [validationFilter, setValidationFilter] =
    useState<ValidationFilter>("all");
  const [customDateFrom, setCustomDateFrom] = useState<string>("");
  const [customDateTo, setCustomDateTo] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const { fetchData } = useInitializeAdminData();

  // Get data from store
  const { brands, removeBrand } = useAdminBrands();
  const { loading, refreshing, error, totalBrands, hasInitialized } =
    useAdminStats();

  useEffect(() => {
    if (!hasInitialized && !loading) {
      fetchData();
    }
  }, [fetchData, hasInitialized, loading]);

  // Enhanced filtering with all filters
  const filteredBrands = useMemo(() => {
    // Date filtering logic
    const filterByDate = (date: string): boolean => {
      if (dateFilter === "all") return true;

      const brandDate = new Date(date);
      const today = new Date();

      switch (dateFilter) {
        case "today":
          return brandDate.toDateString() === today.toDateString();
        case "week":
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          return brandDate >= weekAgo;
        case "month":
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          return brandDate >= monthAgo;
        case "custom":
          if (!customDateFrom || !customDateTo) return true;
          const fromDate = new Date(customDateFrom);
          const toDate = new Date(customDateTo);
          return brandDate >= fromDate && brandDate <= toDate;
        default:
          return true;
      }
    };

    return brands.filter((brand: Brand) => {
      // Get brand data (could be nested in data property or at root level)
      const brandData = brand;
      if (!brandData) return false;

      const searchLower = searchTerm.toLowerCase();

      // Search filter
      const matchesSearch =
        !searchTerm ||
        brandData.brandName?.toLowerCase().includes(searchLower) ||
        brandData.email?.toLowerCase().includes(searchLower) ||
        brandData.role?.toLowerCase().includes(searchLower);

      // Payment filter
      const matchesPayment =
        paymentFilter === "all" ||
        (paymentFilter === "paid" && brandData.hasPaid) ||
        (paymentFilter === "unpaid" && !brandData.hasPaid);

      // Validation filter
      const matchesValidation =
        validationFilter === "all" ||
        (validationFilter === "validated" && brandData.isValidated) ||
        (validationFilter === "unvalidated" && !brandData.isValidated);

      // Date filter
      const matchesDate =
        !brandData.createdAt || filterByDate(brandData.createdAt);

      return (
        matchesSearch && matchesPayment && matchesValidation && matchesDate
      );
    });
  }, [
    brands,
    searchTerm,
    paymentFilter,
    validationFilter,
    customDateFrom,
    customDateTo,
    dateFilter,
  ]);

  // Calculate status counts
  const statusCounts = useMemo<StatusCounts>(() => {
    const paid = brands.filter((b) => b.hasPaid).length;
    const unpaid = brands.filter((b) => !b.hasPaid).length;
    const validated = brands.filter((b) => b.isValidated).length;
    const unvalidated = brands.filter((b) => !b.isValidated).length;

    return { paid, unpaid, validated, unvalidated };
  }, [brands]);

  // Handle row click to show details
  const handleRowClick = (brand: Brand): void => {
    setSelectedBrand(brand);
    setShowDetailsModal(true);
  };

  // Handle close modal
  const handleCloseModal = (): void => {
    setShowDetailsModal(false);
    setSelectedBrand(null);
  };

  const handleDelete = (brandId: string): void => {
    if (window.confirm("Are you sure you want to delete this brand?")) {
      removeBrand(brandId);
    }
  };

  const handleRefresh = (): void => {
    fetchData();
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount?: number): string => {
    if (!amount) return "₦0";
    return `₦${new Intl.NumberFormat("en-NG").format(amount)}`;
  };

  const getPaymentStatusColor = (hasPaid?: boolean): string => {
    return hasPaid
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-red-100 text-red-800 border-red-200";
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  const handleRetry = (): void => {
    fetchData();
  };

  if (loading && brands.length === 0) {
    return (
      <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Brands Management
          </h2>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-red-800 text-sm">
              <strong>Error:</strong> {error}
            </div>
            <button
              onClick={handleRetry}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Brands Management
          </h2>
        </div>
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
              placeholder="Search brands..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto min-w-[250px]"
            />
          </div>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as PaymentFilter)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Payments</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as DateFilter)}
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{totalBrands}</div>
          <div className="text-sm text-gray-500">Total Brands</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {statusCounts.paid}
          </div>
          <div className="text-sm text-gray-500">Paid</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-red-600">
            {statusCounts.unpaid}
          </div>
          <div className="text-sm text-gray-500">Unpaid</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredBrands.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-500">
              {searchTerm || paymentFilter !== "all" || dateFilter !== "all"
                ? "No brands found matching your criteria."
                : "No brands available."}
            </div>
            {(searchTerm ||
              paymentFilter !== "all" ||
              validationFilter !== "all" ||
              dateFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setPaymentFilter("all");
                  setDateFilter("all");
                  setCustomDateFrom("");
                  setCustomDateTo("");
                }}
                className="mt-2 text-blue-500 hover:text-blue-700 text-sm"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Brand
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign Cost
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Join Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBrands.map((brand: Brand) => {
                  const brandData: BrandData = brand || {};
                  return (
                    <tr
                      key={brand._id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleRowClick(brand)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                            {brandData.brandName?.charAt(0)?.toUpperCase() ||
                              "?"}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {brandData.brandName || "Unknown Brand"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {brandData.email || "No email"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {brandData.role || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(brandData.totalCost)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(
                            brandData.hasPaid
                          )}`}
                        >
                          {brandData.hasPaid ? "Paid" : "Unpaid"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(brandData.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View brand details"
                            aria-label={`View details for ${
                              brandData.brandName || "brand"
                            }`}
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Modal - Conditionally rendered */}
      {showDetailsModal && (
        <BrandDetails
          selectedBrand={selectedBrand}
          showDetailsModal={showDetailsModal}
          handleCloseModal={handleCloseModal}
        />
      )}
    </div>
  );
};

export default BrandsManagement;
