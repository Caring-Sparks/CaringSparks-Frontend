import { create } from "zustand";
import { devtools } from "zustand/middleware";
import axios from "axios";

// =====================
// Types (Influencer-specific - Updated)
// =====================

interface PlatformData {
  followers: string;
  url: string;
  impressions: string;
  proofUrl?: string;
}

interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
  isVerified?: boolean;
}

// NEW: Crypto details interface
interface CryptoDetails {
  walletAddress: string;
  network: string;
  walletType: string;
  isVerified?: boolean;
}

interface Influencer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  whatsapp: string;
  location: string;
  niches: string[];
  audienceLocation?: string;
  malePercentage?: string;
  femalePercentage?: string;
  audienceProofUrl?: string;

  // Payment details - UPDATED
  paymentMethod?: "bank" | "crypto";
  bankDetails?: BankDetails;
  hasBankDetails?: boolean;
  cryptoDetails?: CryptoDetails;
  hasCryptoDetails?: boolean;

  // Platform data
  instagram?: PlatformData;
  twitter?: PlatformData;
  tiktok?: PlatformData;
  youtube?: PlatformData;
  facebook?: PlatformData;
  linkedin?: PlatformData;
  discord?: PlatformData;
  threads?: PlatformData;
  snapchat?: PlatformData;

  // Earnings
  followerFee?: number;
  impressionFee?: number;
  locationFee?: number;
  nicheFee?: number;
  earningsPerPost?: number;
  earningsPerPostNaira?: number;
  maxMonthlyEarnings?: number;
  maxMonthlyEarningsNaira?: number;
  followersCount?: number;

  // Legacy
  amountPerPost?: string;
  amountPerMonth?: string;

  // Metadata
  status: "pending" | "approved" | "rejected";
  emailSent: boolean;
  isValidated: boolean;
  passwordResetToken?: string;
  passwordResetExpires?: string;
  createdAt?: string;
  updatedAt?: string;
  role: string;
  avatar: string;
}

// ... (keep all other interfaces: AssignedCampaign, PerformanceMetrics, etc.)

interface AssignedCampaign {
  _id?: string;
  role: "Brand" | "Business" | "Person" | "Movie" | "Music" | "Other";
  platforms: string[];
  brandName: string;
  email: string;
  brandPhone: string;
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
  postFrequency?: any;
  postDuration?: any;
  avgInfluencers?: number;
  postCount?: number;
  costPerInfluencerPerPost?: number;
  totalBaseCost?: number;
  platformFee?: number;
  totalCost?: number;
  hasPaid?: boolean;
  isValidated?: boolean;
  status: "pending" | "approved" | "rejected";
  createdAt?: any;
  updatedAt?: string;
  paymentReference: string;
  assignedInfluencers: string[];
  paymentDate: string;
}

interface PerformanceMetrics {
  totalReach: number;
  totalEngagement: number;
  avgEngagementRate: number;
  totalEarnings: number;
  completedCampaigns: number;
  rating: number;
  monthlyData: {
    month: string;
    reach: number;
    engagement: number;
    earnings: number;
  }[];
}

interface DeliverableSubmission {
  platform: string;
  url: string;
  description: string;
  metrics?: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
  };
}

interface Earnings {
  monthly: {
    month: string;
    amount: number;
  }[];
  yearly: number;
  pending: number;
  total: number;
}

interface AccountSettings {
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    newCampaignAlerts: boolean;
    paymentUpdates: boolean;
  };
  privacy: {
    profileVisibility: "public" | "private";
    showEarnings: boolean;
    showContactInfo: boolean;
  };
  paymentInfo: {
    bankName?: string;
    accountNumber?: string;
    routingNumber?: string;
    paypalEmail?: string;
  };
}

interface InfluencerState {
  userLoading: boolean;
  campaignsLoading: boolean;
  analyticsLoading: boolean;
  accountLoading: boolean;

  user: Influencer | null;
  assignedCampaigns: AssignedCampaign[];
  campaignHistory: AssignedCampaign[];
  availableCampaigns: any[];
  currentCampaign: AssignedCampaign | null;
  performanceMetrics: PerformanceMetrics | null;
  earnings: Earnings;
  accountSettings: AccountSettings | null;

  userError: string | null;
  campaignsError: string | null;
  analyticsError: string | null;
  accountError: string | null;

  pagination: {
    campaigns: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    history: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };

  // Actions - User Management
  fetchInfluencerById: (id: string) => Promise<Influencer | null>;
  fetchCurrentInfluencer: () => Promise<void>;
  updateInfluencerProfile: (updates: Partial<Influencer>) => Promise<void>;
  updateInfluencerBankDetails: (paymentDetails: {
    paymentType: "bank" | "crypto";
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    walletAddress?: string;
    network?: string;
    walletType?: string;
  }) => Promise<any>;

  fetchInfluencerPaymentDetails: () => Promise<{
    paymentMethod: "bank" | "crypto" | null;
    bankDetails: BankDetails | null;
    hasBankDetails: boolean;
    cryptoDetails: CryptoDetails | null;
    hasCryptoDetails: boolean;
  }>;
  updatePlatformData: (platform: string, data: PlatformData) => Promise<void>;
  updateEarningsData: (earningsData: {
    followerFee?: number;
    impressionFee?: number;
    locationFee?: number;
    nicheFee?: number;
    earningsPerPost?: number;
    earningsPerPostNaira?: number;
    maxMonthlyEarnings?: number;
    maxMonthlyEarningsNaira?: number;
  }) => Promise<void>;

  // Actions - Campaign Management
  fetchAssignedCampaigns: (filters?: {
    status?: string;
    platform?: string;
    dateRange?: string;
    page?: number;
    limit?: number;
  }) => Promise<void>;
  fetchCampaignById: (id: string) => Promise<AssignedCampaign | null>;
  updateCampaignStatus: (
    campaignId: string,
    status: AssignedCampaign["status"],
    message?: string
  ) => Promise<void>;
  submitCampaignDeliverables: (
    campaignId: string,
    deliverables: DeliverableSubmission[]
  ) => Promise<void>;
  updateCampaignDeliverables: (
    campaignId: string,
    deliverables: DeliverableSubmission[]
  ) => Promise<void>;
  checkDeliverableStatus: (campaignId: string) => Promise<any>;
  respondToCampaignAssignment: (
    campaignId: string,
    response: "accepted" | "rejected",
    message?: string
  ) => Promise<void>;
  fetchCampaignHistory: (filters?: {
    page?: number;
    limit?: number;
  }) => Promise<void>;
  fetchAvailableCampaigns: (filters?: {
    category?: string;
    platform?: string;
    location?: string;
  }) => Promise<void>;
  applyToCampaign: (
    campaignId: string,
    applicationData: { message: string; proposedRate?: number }
  ) => Promise<void>;

  // Actions - Analytics & Performance
  fetchPerformanceMetrics: (dateRange?: string) => Promise<void>;
  fetchEarningsData: (period?: string) => Promise<void>;

  // Actions - Account Management
  fetchAccountSettings: () => Promise<void>;
  updateAccountSettings: (settings: Partial<AccountSettings>) => Promise<void>;

  // Utility actions
  clearUser: () => void;
  clearErrors: () => void;
  clearCurrentCampaign: () => void;
  setPagination: (type: "campaigns" | "history", page: number) => void;
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

const getId = () => {
  if (typeof window !== "undefined") {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        return user?.data?.user._id;
      }
    } catch (err) {
      console.error("Error parsing user token:", err);
    }
  }
  return null;
};

const userID = getId();

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
export const useInfluencerStore = create<InfluencerState>()(
  devtools(
    (set, get) => ({
      // Initial state
      user: null,
      assignedCampaigns: [],
      campaignHistory: [],
      availableCampaigns: [],
      currentCampaign: null,
      performanceMetrics: null,
      earnings: {
        monthly: [],
        yearly: 0,
        pending: 0,
        total: 0,
      },
      accountSettings: null,

      // Loading states
      userLoading: false,
      campaignsLoading: false,
      analyticsLoading: false,
      accountLoading: false,

      // Errors
      userError: null,
      campaignsError: null,
      analyticsError: null,
      accountError: null,

      // Pagination
      pagination: {
        campaigns: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
        },
        history: {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0,
        },
      },

      // =============================================================================
      // USER MANAGEMENT ACTIONS
      // =============================================================================

      // Fetch influencer by ID
      fetchInfluencerById: async (id: string) => {
        const api = createAuthenticatedAxios();
        set({ userLoading: true, userError: null });

        try {
          const res = await api.get(`/api/influencers/${id}`);
          const data = handleApiResponse(res);
          const influencer = data.data || data.influencer || null;

          set({
            user: influencer,
            userLoading: false,
          });

          return influencer;
        } catch (err: any) {
          const msg = handleApiError(err);
          set({ userError: msg, userLoading: false });
          return null;
        }
      },

      // Fetch current influencer (from token)
      fetchCurrentInfluencer: async () => {
        const api = createAuthenticatedAxios();
        set({ userLoading: true, userError: null });

        try {
          const res = await api.get("/api/auth/me");
          const data = handleApiResponse(res);
          const user = data.data?.user || data.user || null;

          set({
            user: user,
            userLoading: false,
          });
        } catch (err: any) {
          const msg = handleApiError(err);
          set({ userError: msg, userLoading: false });
        }
      },

      // Update influencer profile
      updateInfluencerProfile: async (updates: Partial<Influencer>) => {
        const api = createAuthenticatedAxios();
        const currentUser = get().user;
        if (!currentUser) throw new Error("No user found");

        set({ userLoading: true, userError: null });

        try {
          const res = await api.put(
            `/api/influencers/${currentUser._id}`,
            updates
          );
          const data = handleApiResponse(res);
          const updatedUser = data.data || data.influencer;

          set({
            user: updatedUser,
            userLoading: false,
          });
        } catch (err: any) {
          const msg = handleApiError(err);
          set({ userError: msg, userLoading: false });
          throw new Error(msg);
        }
      },

      // Update influencer bank details
      updateInfluencerBankDetails: async (bankDetails: {
        bankName: string;
        accountNumber: string;
        accountName: string;
      }) => {
        const api = createAuthenticatedAxios();
        const currentUser = get().user;
        if (!currentUser) throw new Error("No user found");

        set({ userLoading: true, userError: null });

        try {
          const res = await api.put("/api/influencers/bank-details", {
            bankDetails,
          });
          const data = handleApiResponse(res);
          const updatedUser = data.data?.influencer;

          if (updatedUser) {
            set({
              user: updatedUser,
              userLoading: false,
            });
          }

          return data;
        } catch (err: any) {
          const msg = handleApiError(err);
          set({ userError: msg, userLoading: false });
          throw new Error(msg);
        }
      },

      // Get influencer bank details
      fetchInfluencerBankDetails: async () => {
        const api = createAuthenticatedAxios();
        const currentUser = get().user;
        if (!currentUser) throw new Error("No user found");

        try {
          const res = await api.get("/api/influencers/bank-details");
          const data = handleApiResponse(res);

          return data.data;
        } catch (err: any) {
          const msg = handleApiError(err);
          set({ userError: msg });
          throw new Error(msg);
        }
      },

      // Update platform data
      updatePlatformData: async (platform: string, data: PlatformData) => {
        const api = createAuthenticatedAxios();
        const currentUser = get().user;
        if (!currentUser) throw new Error("No user found");

        try {
          const updates = { [platform]: data };
          const res = await api.put(
            `/api/influencers/${currentUser._id}/platform`,
            updates
          );
          const responseData = handleApiResponse(res);
          const updatedUser = responseData.data || responseData.influencer;

          set({ user: updatedUser });
        } catch (err: any) {
          const msg = handleApiError(err);
          set({ userError: msg });
          throw new Error(msg);
        }
      },

      // Update earnings data
      updateEarningsData: async (earningsData) => {
        const api = createAuthenticatedAxios();
        const currentUser = get().user;
        if (!currentUser) throw new Error("No user found");

        try {
          const res = await api.put(
            `/api/influencers/${currentUser._id}/earnings`,
            earningsData
          );
          const data = handleApiResponse(res);
          const updatedUser = data.data || data.influencer;

          set({ user: updatedUser });
        } catch (err: any) {
          const msg = handleApiError(err);
          set({ userError: msg });
          throw new Error(msg);
        }
      },

      // =============================================================================
      // CAMPAIGN MANAGEMENT ACTIONS
      // =============================================================================

      // Fetch assigned campaigns
      fetchAssignedCampaigns: async (filters = {}) => {
        const api = createAuthenticatedAxios();
        const currentUser = get().user;
        const userIdFromStorage = getId();
        const targetUserId = currentUser?._id || userIdFromStorage;

        if (!targetUserId) {
          console.error("No user ID available from store or localStorage");
          set({
            campaignsError: "User not authenticated",
            campaignsLoading: false,
          });
          throw new Error("No user found");
        }

        set({ campaignsLoading: true, campaignsError: null });

        try {
          const params = new URLSearchParams();
          Object.entries({
            ...filters,
            page: get().pagination.campaigns.page,
            limit: get().pagination.campaigns.limit,
          }).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              params.append(key, value.toString());
            }
          });

          const url = `/api/campaigns/${targetUserId}/campaigns?${params.toString()}`;

          const res = await api.get(url);
          const data = handleApiResponse(res);

          set({
            assignedCampaigns: data?.data || [],
            pagination: {
              ...get().pagination,
              campaigns: {
                ...get().pagination.campaigns,
                total: data?.pagination?.total || 0,
                pages: data?.pagination?.pages || 0,
              },
            },
            campaignsLoading: false,
          });
        } catch (err: any) {
          console.error("Frontend API Error:", err);
          const msg = handleApiError(err);
          set({ campaignsError: msg, campaignsLoading: false });
        }
      },

      // Fetch single campaign by ID
      fetchCampaignById: async (id: string) => {
        const api = createAuthenticatedAxios();
        set({ campaignsLoading: true, campaignsError: null });

        try {
          const res = await api.get(`/api/campaigns/${id}`);
          const data = handleApiResponse(res);
          const campaign = data.data || null;

          set({
            currentCampaign: campaign,
            campaignsLoading: false,
          });

          return campaign;
        } catch (err: any) {
          const msg = handleApiError(err);
          set({ campaignsError: msg, campaignsLoading: false });
          return null;
        }
      },

      // Update campaign status
      updateCampaignStatus: async (
        campaignId: string,
        status: AssignedCampaign["status"],
        message = ""
      ) => {
        const api = createAuthenticatedAxios();

        try {
          const res = await api.put(
            `/api/campaigns/assigned/${campaignId}/status`,
            {
              status,
              message,
            }
          );
          const data = handleApiResponse(res);
          const updatedCampaign = data.data;

          set({
            assignedCampaigns: get().assignedCampaigns.map((campaign) =>
              campaign._id === campaignId ? updatedCampaign : campaign
            ),
            currentCampaign:
              get().currentCampaign?._id === campaignId
                ? updatedCampaign
                : get().currentCampaign,
          });
        } catch (err: any) {
          const msg = handleApiError(err);
          set({ campaignsError: msg });
          throw new Error(msg);
        }
      },

      // Respond to campaign assignment
      respondToCampaignAssignment: async (
        campaignId: string,
        response: "accepted" | "declined",
        message = ""
      ) => {
        const api = createAuthenticatedAxios();

        try {
          const res = await api.patch(`/api/campaigns/${campaignId}/respond`, {
            status: response,
            message,
          });
          const data = handleApiResponse(res);

          if (response === "accepted") {
            const updatedCampaign = data.data;
            set({
              assignedCampaigns: get().assignedCampaigns.map((campaign) =>
                campaign._id === campaignId ? updatedCampaign : campaign
              ),
            });
          } else {
            set({
              assignedCampaigns: get().assignedCampaigns.filter(
                (campaign) => campaign._id !== campaignId
              ),
            });
          }
        } catch (err: any) {
          const msg = handleApiError(err);
          set({ campaignsError: msg });
          throw new Error(msg);
        }
      },

      // Fetch campaign history
      fetchCampaignHistory: async (filters = {}) => {
        const api = createAuthenticatedAxios();
        const currentUser = get().user;
        if (!currentUser) throw new Error("No user found");

        set({ campaignsLoading: true, campaignsError: null });

        try {
          const params = new URLSearchParams();
          Object.entries({
            ...filters,
            page: get().pagination.history.page,
            limit: get().pagination.history.limit,
          }).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              params.append(key, value.toString());
            }
          });

          const res = await api.get(
            `/api/influencers/${
              currentUser._id
            }/campaigns/history?${params.toString()}`
          );
          const data = handleApiResponse(res);

          set({
            campaignHistory: data.data || [],
            pagination: {
              ...get().pagination,
              history: {
                ...get().pagination.history,
                total: data.total || 0,
                pages: data.pages || 0,
              },
            },
            campaignsLoading: false,
          });
        } catch (err: any) {
          const msg = handleApiError(err);
          set({ campaignsError: msg, campaignsLoading: false });
        }
      },

      // Fetch available campaigns
      fetchAvailableCampaigns: async (filters = {}) => {
        const api = createAuthenticatedAxios();

        try {
          const params = new URLSearchParams();
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              params.append(key, value.toString());
            }
          });

          const res = await api.get(
            `/api/campaigns/available?${params.toString()}`
          );
          const data = handleApiResponse(res);

          set({ availableCampaigns: data.data || [] });
        } catch (err: any) {
          const msg = handleApiError(err);
          set({ campaignsError: msg });
        }
      },

      // Submit campaign deliverables
      submitCampaignDeliverables: async (
        campaignId: string,
        deliverables: DeliverableSubmission[]
      ) => {
        const api = createAuthenticatedAxios();

        try {
          // Validate inputs
          if (!campaignId) {
            throw new Error("Campaign ID is required");
          }

          if (!Array.isArray(deliverables) || deliverables.length === 0) {
            throw new Error("At least one deliverable is required");
          }

          // Validate each deliverable
          for (const [index, deliverable] of deliverables.entries()) {
            if (
              !deliverable.platform ||
              !deliverable.url ||
              !deliverable.description
            ) {
              throw new Error(
                `Deliverable ${index + 1} is missing required fields`
              );
            }
          }

          const res = await api.post(
            `/api/deliverables/${campaignId}/deliverables`,
            {
              deliverables,
            }
          );

          const data = handleApiResponse(res);
          const updatedCampaign = data.data?.campaign;

          if (updatedCampaign) {
            // Update the campaign in the store
            set({
              assignedCampaigns: get().assignedCampaigns.map((campaign) =>
                campaign._id === campaignId ? updatedCampaign : campaign
              ),
              currentCampaign:
                get().currentCampaign?._id === campaignId
                  ? updatedCampaign
                  : get().currentCampaign,
            });
          }

          return data;
        } catch (err: any) {
          const msg = handleApiError(err);
          set({ campaignsError: msg });
          throw new Error(msg);
        }
      },

      // Update submitted deliverables (NEW FUNCTION)
      updateCampaignDeliverables: async (
        campaignId: string,
        deliverables: DeliverableSubmission[]
      ) => {
        const api = createAuthenticatedAxios();

        try {
          if (!campaignId) {
            throw new Error("Campaign ID is required");
          }

          if (!Array.isArray(deliverables) || deliverables.length === 0) {
            throw new Error("At least one deliverable is required");
          }

          const res = await api.put(
            `/api/deliverables/${campaignId}/deliverables`,
            {
              deliverables,
            }
          );

          const data = handleApiResponse(res);
          const updatedCampaign = data.data?.campaign;

          if (updatedCampaign) {
            set({
              assignedCampaigns: get().assignedCampaigns.map((campaign) =>
                campaign._id === campaignId ? updatedCampaign : campaign
              ),
              currentCampaign:
                get().currentCampaign?._id === campaignId
                  ? updatedCampaign
                  : get().currentCampaign,
            });
          }

          return data;
        } catch (err: any) {
          const msg = handleApiError(err);
          set({ campaignsError: msg });
          throw new Error(msg);
        }
      },

      // Check deliverable status with due date (NEW FUNCTION)
      checkDeliverableStatus: async (campaignId: string) => {
        const api = createAuthenticatedAxios();

        try {
          const res = await api.get(
            `/api/deliverables/${campaignId}/deliverables/status`
          );
          const data = handleApiResponse(res);
          return data.data;
        } catch (err: any) {
          const msg = handleApiError(err);
          set({ campaignsError: msg });
          throw new Error(msg);
        }
      },

      // Apply to campaign
      applyToCampaign: async (
        campaignId: string,
        applicationData: { message: string; proposedRate?: number }
      ) => {
        const api = createAuthenticatedAxios();

        try {
          const res = await api.post(
            `/api/campaigns/${campaignId}/apply`,
            applicationData
          );
          const data = handleApiResponse(res);
          return data;
        } catch (err: any) {
          const msg = handleApiError(err);
          set({ campaignsError: msg });
          throw new Error(msg);
        }
      },

      // =============================================================================
      // ANALYTICS & PERFORMANCE ACTIONS
      // =============================================================================

      // Fetch performance metrics
      fetchPerformanceMetrics: async (dateRange = "30d") => {
        const api = createAuthenticatedAxios();
        const currentUser = get().user;
        if (!currentUser) throw new Error("No user found");

        set({ analyticsLoading: true, analyticsError: null });

        try {
          const res = await api.get(
            `/api/influencers/${currentUser._id}/analytics?range=${dateRange}`
          );
          const data = handleApiResponse(res);

          set({
            performanceMetrics: data.data || null,
            analyticsLoading: false,
          });
        } catch (err: any) {
          const msg = handleApiError(err);
          set({ analyticsError: msg, analyticsLoading: false });
        }
      },

      // Fetch earnings data
      fetchEarningsData: async (period = "monthly") => {
        const api = createAuthenticatedAxios();
        const currentUser = get().user;
        if (!currentUser) throw new Error("No user found");

        try {
          const res = await api.get(
            `/api/influencers/${currentUser._id}/earnings?period=${period}`
          );
          const data = handleApiResponse(res);

          set({
            earnings: {
              ...get().earnings,
              ...(data.data || {}),
            },
          });
        } catch (err: any) {
          const msg = handleApiError(err);
          set({ analyticsError: msg });
        }
      },

      // =============================================================================
      // ACCOUNT MANAGEMENT ACTIONS
      // =============================================================================

      // Fetch account settings
      fetchAccountSettings: async () => {
        const api = createAuthenticatedAxios();
        const currentUser = get().user;
        if (!currentUser) throw new Error("No user found");

        set({ accountLoading: true, accountError: null });

        try {
          const res = await api.get(
            `/api/influencers/${currentUser._id}/settings`
          );
          const data = handleApiResponse(res);

          set({
            accountSettings: data.data || null,
            accountLoading: false,
          });
        } catch (err: any) {
          const msg = handleApiError(err);
          set({ accountError: msg, accountLoading: false });
        }
      },

      // Update account settings
      updateAccountSettings: async (settings: Partial<AccountSettings>) => {
        const api = createAuthenticatedAxios();
        const currentUser = get().user;
        if (!currentUser) throw new Error("No user found");

        set({ accountLoading: true, accountError: null });

        try {
          const res = await api.put(
            `/api/influencers/${currentUser._id}/settings`,
            settings
          );
          const data = handleApiResponse(res);

          set({
            accountSettings: data.data || null,
            accountLoading: false,
          });
        } catch (err: any) {
          const msg = handleApiError(err);
          set({ accountError: msg, accountLoading: false });
          throw new Error(msg);
        }
      },

      // =============================================================================
      // UTILITY ACTIONS
      // =============================================================================

      // Clear user (logout)
      clearUser: () => {
        set({
          user: null,
          assignedCampaigns: [],
          campaignHistory: [],
          currentCampaign: null,
          performanceMetrics: null,
          earnings: {
            monthly: [],
            yearly: 0,
            pending: 0,
            total: 0,
          },
          accountSettings: null,
        });
        if (typeof window !== "undefined") {
          localStorage.removeItem("user");
        }
      },

      // Clear errors
      clearErrors: () => {
        set({
          userError: null,
          campaignsError: null,
          analyticsError: null,
          accountError: null,
        });
      },

      // Clear current campaign
      clearCurrentCampaign: () => {
        set({ currentCampaign: null });
      },

      // Set pagination
      setPagination: (type: "campaigns" | "history", page: number) => {
        set({
          pagination: {
            ...get().pagination,
            [type]: {
              ...get().pagination[type],
              page,
            },
          },
        });
      },
    }),
    { name: "influencer-store" }
  )
);

// =====================
// Selector Hooks (for better performance and cleaner components)
// =====================
export const useInfluencerUser = () =>
  useInfluencerStore((state) => state.user);
export const useInfluencerCampaigns = () =>
  useInfluencerStore((state) => state.assignedCampaigns);
export const useInfluencerCampaignHistory = () =>
  useInfluencerStore((state) => state.campaignHistory);
export const useInfluencerCurrentCampaign = () =>
  useInfluencerStore((state) => state.currentCampaign);
export const useInfluencerPerformanceMetrics = () =>
  useInfluencerStore((state) => state.performanceMetrics);
export const useInfluencerEarnings = () =>
  useInfluencerStore((state) => state.earnings);
export const useInfluencerAccountSettings = () =>
  useInfluencerStore((state) => state.accountSettings);

export const useInfluencerLoading = () =>
  useInfluencerStore((state) => ({
    userLoading: state.userLoading,
    campaignsLoading: state.campaignsLoading,
    analyticsLoading: state.analyticsLoading,
    accountLoading: state.accountLoading,
  }));

export const useInfluencerErrors = () =>
  useInfluencerStore((state) => ({
    userError: state.userError,
    campaignsError: state.campaignsError,
    analyticsError: state.analyticsError,
    accountError: state.accountError,
  }));

export const useInfluencerPagination = () =>
  useInfluencerStore((state) => state.pagination);
