"use client";

import {
  BiEdit,
  BiSearch,
  BiCalendar,
  BiRefresh,
  BiChevronLeft,
  BiChevronRight,
} from "react-icons/bi";
import { useEffect, useState, useMemo } from "react";
import {
  useAdminBrands,
  useAdminStats,
  useInitializeAdminData,
} from "@/stores/adminStore";
import { Eye, Trash } from "phosphor-react";
import BrandDetails from "./BrandDetails";
import { GiCheckMark } from "react-icons/gi";
interface BrandData {
  _id: string;
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
  _id: string;
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

const ITEMS_PER_PAGE = 10;

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
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { fetchData } = useInitializeAdminData();

  const { brands, removeBrand } = useAdminBrands();
  const { loading, refreshing, error, totalBrands, hasInitialized } =
    useAdminStats();

  useEffect(() => {
    if (!hasInitialized && !loading) {
      fetchData();
    }
  }, [fetchData, hasInitialized, loading]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    paymentFilter,
    validationFilter,
    dateFilter,
    customDateFrom,
    customDateTo,
  ]);

  const filteredBrands = useMemo(() => {
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
      const brandData: BrandData = brand || {};
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

  const totalPages = Math.ceil(filteredBrands.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentBrands = filteredBrands.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  const handlePreviousPage = (): void => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = (): void => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  const handleRetry = (): void => {
    fetchData();
  };

  // Generate page numbers for pagination
  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  if (loading && brands.length === 0) {
    return (
      <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
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
    <div className="space-y-6 p-6 bg-black min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-500">
            Brands Management
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-slate-200/20 border border-gray-200/10 rounded-lg hover:bg-gray-50 disabled:opacity-50"
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
              className="pl-10 pr-4 py-2 border bg-slate-200/20 text-slate-500 border-gray-200/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 w-full sm:w-auto min-w-[250px]"
            />
          </div>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as PaymentFilter)}
            className="px-4 py-2 border border-gray-200/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-slate-200/20 text-slate-500"
          >
            <option value="all">All Payments</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
          <select
            value={validationFilter}
            onChange={(e) =>
              setValidationFilter(e.target.value as ValidationFilter)
            }
            className="px-4 py-2 border border-gray-200/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-slate-200/20 text-slate-500"
          >
            <option value="all">All Validation</option>
            <option value="validated">Validated</option>
            <option value="unvalidated">Unvalidated</option>
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as DateFilter)}
            className="px-4 py-2 border border-gray-200/10 text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-slate-200/20"
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
        <div className="flex gap-4 items-center bg-slate-200/20 p-4 rounded-lg border border-gray-200/10">
          <BiCalendar className="text-gray-500" size={18} />
          <input
            type="date"
            value={customDateFrom}
            onChange={(e) => setCustomDateFrom(e.target.value)}
            className="px-3 py-2 border text-slate-500 border-gray-200/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={customDateTo}
            onChange={(e) => setCustomDateTo(e.target.value)}
            className="px-3 py-2 border text-slate-500 border-gray-200/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>
      )}

      {/* Results info */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <div>
          Showing {startIndex + 1} to{" "}
          {Math.min(endIndex, filteredBrands.length)} of {filteredBrands.length}{" "}
          results
        </div>
        <div>
          Page {currentPage} of {totalPages}
        </div>
      </div>

      <div className="bg-slate-200/20 rounded-xl shadow-sm border border-gray-200/10 overflow-hidden">
        {currentBrands.length === 0 ? (
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
                  setValidationFilter("all");
                  setDateFilter("all");
                  setCustomDateFrom("");
                  setCustomDateTo("");
                }}
                className="mt-2 text-yellow-500 hover:text-yellow-700 text-sm"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-black">
              <thead className="bg-slate-200/20 border-b border-gray-200/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Brand
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Join Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-slate-200/10 divide-y divide-gray-200/10">
                {currentBrands.map((brand: Brand) => {
                  const brandData: BrandData = brand || {};
                  return (
                    <tr
                      key={brand._id}
                      className=""
                      // onClick={() => handleRowClick(brand)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                            {brandData.brandName?.charAt(0)?.toUpperCase() ||
                              "?"}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-400">
                              {brandData.brandName || "Unknown Brand"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {brandData.email || "No email"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {brandData.role || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(brandData.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div
                          className="flex space-x-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            className="text-green-600 rounded-lg transition-colors"
                            // onClick={() => handleRowClick(brand)}
                          >
                            <GiCheckMark size={16} />
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <BiChevronLeft size={16} />
                </button>

                <div className="flex space-x-1">
                  {getPageNumbers().map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? "bg-yellow-600 text-white"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <BiChevronRight size={16} />
                </button>
              </div>

              <div className="text-sm text-gray-600">
                Total: {filteredBrands.length} brands
              </div>
            </div>
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
