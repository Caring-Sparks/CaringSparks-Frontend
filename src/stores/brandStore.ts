import { create } from "zustand";
import { devtools } from "zustand/middleware";
import axios from "axios";

// =====================
// Types (Updated to match schema)
// =====================
interface Campaign {
  _id?: string;
  // Basic brand information
  role: "Brand" | "Business" | "Person" | "Movie" | "Music" | "Other";
  platforms: string[];
  brandName: string;
  email: string;
  brandPhone: string;

  // Campaign requirements
  influencersMin: number;
  influencersMax: number;
  followersRange?:
    | ""
    | "1k-3k"
    | "3k-10k"
    | "10k-20k"
    | "20k-50k"
    | "50k & above";
  location: string;
  additionalLocations?: string[];
  postFrequency?:
    | ""
    | "5 times per week for 3 weeks = 15 posts in total"
    | "3 times per week for 4 weeks = 12 posts in total"
    | "2 times per week for 6 weeks = 12 posts in total";
  postDuration?: "" | "1 day" | "1 week" | "2 weeks" | "1 month";

  // Calculated pricing fields (from frontend calculations)
  avgInfluencers?: number;
  postCount?: number;
  costPerInfluencerPerPost?: number;
  totalBaseCost?: number;
  platformFee?: number;
  totalCost?: number;

  // System fields
  hasPaid?: boolean;
  isValidated?: boolean;
  status: "pending" | "approved" | "rejected";
  createdAt?: string;
  updatedAt?: string;
  paymentReference: string;
  assignedInfluencers: string[];
  paymentDate: string;
}

interface User {
  _id: string;
  email: string;
  brandName?: string;
  role?: string;
  avatar?: string;
  brandPhone?: string;
  isValidated?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface BrandState {
  // Loading states
  userLoading: boolean;
  campaignsLoading: boolean;
  singleCampaignLoading: boolean;

  // Data
  user: User | null;
  campaigns: Campaign[];
  currentCampaign: Campaign | null;

  // Errors
  userError: string | null;
  campaignsError: string | null;

  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;

  // Actions
  fetchUser: () => Promise<void>;
  fetchCampaigns: (filters?: {
    role?: string;
    platforms?: string | string[];
    location?: string;
    followersRange?: string;
    hasPaid?: boolean;
    page?: number;
    limit?: number;
  }) => Promise<void>;
  fetchCampaignById: (id: string) => Promise<Campaign | null>;
  fetchCampaignsByEmail: (email: string) => Promise<void>;
  createCampaign: (
    campaign: Omit<Campaign, "_id" | "createdAt" | "updatedAt">
  ) => Promise<Campaign | null>;
  updateCampaign: (id: string, updates: Partial<Campaign>) => Promise<void>;
  updatePaymentStatus: (id: string, hasPaid: boolean) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
  clearUser: () => void;
  clearErrors: () => void;
  clearCurrentCampaign: () => void;
}

// =====================
// Helpers
// =====================
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        return user?.data?.token || user?.token || null;
      }
    } catch (err) {
      console.error("Error parsing user token:", err);
    }
  }
  return null;
};

const createAuthenticatedAxios = () => {
  const token = getAuthToken();
  return axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    timeout: 15000,
  });
};

// Helper to handle API responses
const handleApiResponse = (response: any) => {
  if (response.data?.success) {
    return response.data;
  }
  throw new Error(response.data?.message || "API request failed");
};

// Helper to handle API errors
const handleApiError = (err: any) => {
  if (err.response?.data?.message) {
    return err.response.data.message;
  }
  if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
    return err.response.data.errors.join(", ");
  }
  return err.message || "An unexpected error occurred";
};

// =====================
// Store
// =====================
export const useBrandStore = create<BrandState>()(
  devtools(
    (set, get) => ({
      user: null,
      campaigns: [],
      currentCampaign: null,
      userLoading: false,
      campaignsLoading: false,
      singleCampaignLoading: false,
      userError: null,
      campaignsError: null,
      pagination: null,

      // Fetch user details
      fetchUser: async () => {
        const api = createAuthenticatedAxios();
        set({ userLoading: true, userError: null });

        try {
          const res = await api.get("/api/auth/me");
          const data = handleApiResponse(res);
          set({
            user: data.data?.user || data.user || null,
            userLoading: false,
          });
        } catch (err: any) {
          const msg = handleApiError(err);
          set({ userError: msg, userLoading: false });
        }
      },

      // Fetch campaigns with optional filters
      fetchCampaigns: async (filters = {}) => {
        const api = createAuthenticatedAxios();
        set({ campaignsLoading: true, campaignsError: null });

        try {
          const params = new URLSearchParams();
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              if (Array.isArray(value)) {
                value.forEach((v) => params.append(key, v));
              } else {
                params.append(key, value.toString());
              }
            }
          });

          const res = await api.get(`/api/campaigns?${params.toString()}`);
          const data = handleApiResponse(res);

          set({
            campaigns: data.data || [],
            pagination: data.pagination || null,
            campaignsLoading: false,
          });
        } catch (err: any) {
          const msg = handleApiError(err);
          set({ campaignsError: msg, campaignsLoading: false });
        }
      },

      // Fetch campaigns by email
      fetchCampaignsByEmail: async (email: string) => {
        const api = createAuthenticatedAxios();
        set({ campaignsLoading: true, campaignsError: null });

        try {
          const res = await api.get(
            `/api/campaigns/email/${encodeURIComponent(email)}`
          );
          const data = handleApiResponse(res);
          set({ campaigns: data.data || [], campaignsLoading: false });
        } catch (err: any) {
          const msg = handleApiError(err);
          set({ campaignsError: msg, campaignsLoading: false });
        }
      },

      // Fetch single campaign by ID
      fetchCampaignById: async (id: string) => {
        const api = createAuthenticatedAxios();
        set({ singleCampaignLoading: true, campaignsError: null });

        try {
          const res = await api.get(`/api/campaigns/${id}`);
          const data = handleApiResponse(res);
          const campaign = data.data || null;
          set({ currentCampaign: campaign, singleCampaignLoading: false });
          return campaign;
        } catch (err: any) {
          const msg = handleApiError(err);
          set({ campaignsError: msg, singleCampaignLoading: false });
          return null;
        }
      },

      // Create new campaign
      createCampaign: async (campaign) => {
        const api = createAuthenticatedAxios();
        set({ campaignsError: null });

        try {
          const res = await api.post("/api/campaigns/newCampaign", campaign);
          const data = handleApiResponse(res);
          const newCampaign = data.data;

          set({
            campaigns: [...get().campaigns, newCampaign],
            currentCampaign: newCampaign,
          });

          return newCampaign;
        } catch (err: any) {
          const msg = handleApiError(err);
          set({ campaignsError: msg });
          throw new Error(msg);
        }
      },

      // Update existing campaign
      updateCampaign: async (id: string, updates) => {
        const api = createAuthenticatedAxios();
        set({ campaignsError: null });

        try {
          const res = await api.put(`/api/campaigns/${id}`, updates);
          const data = handleApiResponse(res);
          const updatedCampaign = data.data;

          set({
            campaigns: get().campaigns.map((c) =>
              c._id === id ? updatedCampaign : c
            ),
            currentCampaign:
              get().currentCampaign?._id === id
                ? updatedCampaign
                : get().currentCampaign,
          });
        } catch (err: any) {
          const msg = handleApiError(err);
          set({ campaignsError: msg });
          throw new Error(msg);
        }
      },

      // Update payment status
      updatePaymentStatus: async (id: string, hasPaid: boolean) => {
        const api = createAuthenticatedAxios();
        set({ campaignsError: null });

        try {
          const res = await api.put(`/api/campaigns/${id}/payment`, {
            hasPaid,
          });
          const data = handleApiResponse(res);
          const updatedCampaign = data.data;

          set({
            campaigns: get().campaigns.map((c) =>
              c._id === id ? updatedCampaign : c
            ),
            currentCampaign:
              get().currentCampaign?._id === id
                ? updatedCampaign
                : get().currentCampaign,
          });
        } catch (err: any) {
          const msg = handleApiError(err);
          set({ campaignsError: msg });
          throw new Error(msg);
        }
      },

      // Delete campaign
      deleteCampaign: async (id: string) => {
        const api = createAuthenticatedAxios();
        set({ campaignsError: null });

        try {
          await api.delete(`/api/campaigns/${id}`);
          set({
            campaigns: get().campaigns.filter((c) => c._id !== id),
            currentCampaign:
              get().currentCampaign?._id === id ? null : get().currentCampaign,
          });
        } catch (err: any) {
          const msg = handleApiError(err);
          set({ campaignsError: msg });
          throw new Error(msg);
        }
      },

      // Clear user (logout)
      clearUser: () => {
        set({ user: null });
        if (typeof window !== "undefined") {
          localStorage.removeItem("user");
        }
      },

      // Clear current campaign
      clearCurrentCampaign: () => set({ currentCampaign: null }),

      // Clear errors
      clearErrors: () => set({ userError: null, campaignsError: null }),
    }),
    { name: "brand-store" }
  )
);

// =====================
// Selector Hooks (Optional - for better performance)
// =====================
export const useBrandUser = () => useBrandStore((state) => state.user);
export const useBrandCampaigns = () =>
  useBrandStore((state) => state.campaigns);
export const useBrandLoading = () =>
  useBrandStore((state) => ({
    userLoading: state.userLoading,
    campaignsLoading: state.campaignsLoading,
    singleCampaignLoading: state.singleCampaignLoading,
  }));
export const useBrandErrors = () =>
  useBrandStore((state) => ({
    userError: state.userError,
    campaignsError: state.campaignsError,
  }));
export const useBrandPagination = () =>
  useBrandStore((state) => state.pagination);
