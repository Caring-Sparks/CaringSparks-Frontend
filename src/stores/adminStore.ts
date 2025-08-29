import { create } from "zustand";
import { devtools } from "zustand/middleware";
import axios from "axios";

// Define types
interface SocialMedia {
  impressions?: number;
  followers?: number;
  url?: string;
  proofUrl?: string;
}

interface Influencer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  location?: string;
  niches?: string[];
  audienceLocation?: string;
  malePercentage?: number;
  femalePercentage?: number;
  audienceProofUrl?: string;
  instagram?: SocialMedia;
  twitter?: SocialMedia;
  tiktok?: SocialMedia;
  youtube?: SocialMedia;
  facebook?: SocialMedia;
  linkedin?: SocialMedia;
  discord?: SocialMedia;
  threads?: SocialMedia;
  snapchat?: SocialMedia;
  followerFee?: number;
  impressionFee?: number;
  locationFee?: number;
  nicheFee?: number;
  earningsPerPost?: number;
  earningsPerPostNaira?: number;
  maxMonthlyEarnings?: number;
  maxMonthlyEarningsNaira?: number;
  followersCount?: number;
  status: string;
  emailSent?: boolean;
  createdAt: string;
  updatedAt?: string;
  category: string;
  joinDate: string;
  avatar?: string;
  [key: string]: any;
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
  createdAt: string;
  updatedAt?: string;
}

// User interface - Add your specific user fields here
interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  avatar?: string;
  isValidated?: boolean;
  phoneNumber?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

// Admin Interface
interface Admin {
  _id: string;
  email: string;
  phoneNumber?: number;
  passwordResetToken?: string;
  passwordResetExpires?: string;
  isValidated?: boolean;
  [key: string]: any;
}

interface AdminState {
  // Loading states
  loading: boolean;
  refreshing: boolean;
  hasInitialized: boolean;
  userLoading: boolean; // Separate loading state for user

  // Data
  brands: Brand[];
  influencers: Influencer[];
  admins: Admin[];
  user: User | null; // Add user to state

  // Error state
  error: string | null;
  userError: string | null; // Separate error state for user

  // Actions
  fetchData: () => Promise<void>;
  refreshData: () => Promise<void>;
  clearError: () => void;
  clearUserError: () => void;

  // User actions
  fetchUser: () => Promise<void>;
  updateUser: (updateData: Partial<User>) => Promise<void>;
  clearUser: () => void;

  // Brand actions
  addBrand: (brand: Brand) => void;
  updateBrand: (id: string, updatedBrand: Brand) => void;
  removeBrand: (id: string) => void;

  // Influencer actions
  addInfluencer: (influencer: Influencer) => void;
  updateInfluencer: (id: string, updatedInfluencer: Influencer) => void;
  removeInfluencer: (id: string) => void;
  updateInfluencerStatus: (id: string, status: string) => Promise<void>;
  deleteInfluencer: (id: string) => Promise<void>;
  deleteBrand: (id: string) => Promise<void>;

  // Admin actions
  fetchAdmins: () => Promise<void>;
  updateAdmin: (id: string, updateData: Partial<Admin>) => Promise<void>;
  deleteAdmin: (id: string) => Promise<void>;

  // Stats (computed)
  getTotalBrands: () => number;
  getTotalInfluencers: () => number;
  getTotalAdmins: () => number;
}

// Get auth token from localStorage
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        return user?.data?.token || null;
      }
      return null;
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      return null;
    }
  }
  return null;
};

// Create axios instance with auth
const createAuthenticatedAxios = () => {
  const token = getAuthToken();
  return axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    timeout: 10000,
  });
};

export const useAdminStore = create<AdminState>()(
  devtools(
    (set, get) => ({
      // Initial state
      loading: false,
      refreshing: false,
      hasInitialized: false,
      userLoading: false,
      brands: [],
      influencers: [],
      admins: [],
      user: null, // Initialize user state
      error: null,
      userError: null,

      // Clear errors
      clearError: () => set({ error: null }),
      clearUserError: () => set({ userError: null }),

      // Clear user (for logout)
      clearUser: () => set({ user: null, userError: null }),

      // Fetch data
      fetchData: async () => {
        const api = createAuthenticatedAxios();
        set({ loading: true, error: null });

        try {
          const [influencerRes, brandRes, adminRes] = await Promise.all([
            api.get("/api/influencers/all-influencers"),
            api.get("/api/brands/all-brands"),
            api.get("/api/admins/all-admins"),
          ]);

          set({
            influencers: influencerRes.data?.data?.influencers || [],
            brands: brandRes.data?.data?.brands || [],
            admins: adminRes.data?.data?.admins || [],
            loading: false,
            hasInitialized: true,
          });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Could not fetch data";
          console.error("Admin Store Error:", errorMessage);

          set({
            error: errorMessage,
            loading: false,
            hasInitialized: true,
          });
        }
      },

      // User details
      fetchUser: async () => {
        const api = createAuthenticatedAxios();
        set({ userLoading: true, userError: null });

        try {
          const response = await api.get("/api/auth/me");

          set({
            user: response.data?.data?.user || null,
            userLoading: false,
          });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Could not fetch user data";

          console.error("User Store Error:", errorMessage);

          set({
            user: null,
            userError: errorMessage,
            userLoading: false,
          });
        }
      },

      // Update user
      updateUser: async (updateData) => {
        const api = createAuthenticatedAxios();
        const currentUser = get().user;

        if (!currentUser) {
          throw new Error("No user found to update");
        }

        try {
          const response = await api.put(
            `/api/auth/update-profile`,
            updateData
          );
          const updatedUser = response.data?.data?.userData;

          if (updatedUser) {
            set({
              user: { ...currentUser, ...updatedUser },
            });
          }
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to update user";

          set({ userError: errorMessage });
          throw new Error(errorMessage);
        }
      },

      // Refresh data
      refreshData: async () => {
        const api = createAuthenticatedAxios();
        set({ refreshing: true, error: null });

        try {
          const [influencerRes, brandRes, adminRes] = await Promise.all([
            api.get("/api/influencers/all-influencers"),
            api.get("/api/brands/all-brands"),
            api.get("/api/admins/all-admins"),
          ]);

          set({
            influencers: influencerRes.data?.data?.influencers || [],
            brands: brandRes.data?.data?.brands || [],
            admins: adminRes.data?.data?.admins || [],
            refreshing: false,
          });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Could not refresh data";
          console.error("Admin Store Refresh Error:", errorMessage);

          set({
            error: errorMessage,
            refreshing: false,
          });
        }
      },

      // Admin actions
      fetchAdmins: async () => {
        const api = createAuthenticatedAxios();
        set({ loading: true, error: null });
        try {
          const adminRes = await api.get("/api/admins/all-admins");
          set({
            admins: adminRes.data.data || [],
            loading: false,
          });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to fetch admins";
          set({ error: errorMessage, loading: false });
        }
      },

      updateAdmin: async (id, updateData) => {
        const api = createAuthenticatedAxios();
        try {
          const res = await api.put(`/api/admins/${id}`, updateData);
          const updatedAdmin = res.data?.data;
          if (updatedAdmin) {
            set((state) => ({
              admins: state.admins.map((admin) =>
                admin._id === id ? { ...admin, ...updatedAdmin } : admin
              ),
            }));
          }
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to update admin";
          set({ error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      deleteAdmin: async (id) => {
        const api = createAuthenticatedAxios();
        try {
          await api.delete(`/api/admins/${id}`);
          set((state) => ({
            admins: state.admins.filter((admin) => admin._id !== id),
          }));
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to delete admin";
          set({ error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      updateInfluencerStatus: async (id, status) => {
        const api = createAuthenticatedAxios();

        try {
          const res = await api.patch(`/api/influencers/${id}/status`, {
            status,
          });

          const updatedInfluencer = res.data?.data;

          if (updatedInfluencer) {
            set((state) => ({
              influencers: state.influencers.map((inf) =>
                inf.id === id ? { ...inf, ...updatedInfluencer, status } : inf
              ),
            }));
          }
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to update influencer status";
          console.error("Update Influencer Status Error:", errorMessage);

          set({ error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      deleteInfluencer: async (id) => {
        const api = createAuthenticatedAxios();

        try {
          await api.delete(`/api/influencers/${id}`);
          set((state) => ({
            influencers: state.influencers.filter((inf) => inf.id !== id),
          }));
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to delete influencer";
          console.error("Delete Influencer Error:", errorMessage);

          set({ error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      deleteBrand: async (id) => {
        const api = createAuthenticatedAxios();

        try {
          await api.delete(`/api/brands/delete/${id}`);
          set((state) => ({
            brands: state.brands.filter((brd) => brd._id !== id),
          }));
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to delete brand";
          console.error("Delete Brand Error:", errorMessage);

          set({ error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      // Brand actions
      addBrand: (brand) =>
        set((state) => ({
          brands: [...state.brands, brand],
        })),

      updateBrand: (id, updatedBrand) =>
        set((state) => ({
          brands: state.brands.map((brand) =>
            brand._id === id ? updatedBrand : brand
          ),
        })),

      removeBrand: (id) =>
        set((state) => ({
          brands: state.brands.filter((brand) => brand._id !== id),
        })),

      // Influencer actions
      addInfluencer: (influencer) =>
        set((state) => ({
          influencers: [...state.influencers, influencer],
        })),

      updateInfluencer: (id, updatedInfluencer) =>
        set((state) => ({
          influencers: state.influencers.map((influencer) =>
            influencer.id === id ? updatedInfluencer : influencer
          ),
        })),

      removeInfluencer: (id) =>
        set((state) => ({
          influencers: state.influencers.filter(
            (influencer) => influencer.id !== id
          ),
        })),

      // Computed stats
      getTotalBrands: () => get().brands.length,
      getTotalInfluencers: () => get().influencers.length,
      getTotalAdmins: () => get().admins.length,
    }),
    {
      name: "admin-store",
    }
  )
);

// Convenience hooks for specific data
export const useAdminBrands = () => {
  const brands = useAdminStore((state) => state.brands);
  const addBrand = useAdminStore((state) => state.addBrand);
  const updateBrand = useAdminStore((state) => state.updateBrand);
  const removeBrand = useAdminStore((state) => state.removeBrand);

  return { brands, addBrand, updateBrand, removeBrand };
};

export const useAdminInfluencers = () => {
  const influencers = useAdminStore((state) => state.influencers);
  const addInfluencer = useAdminStore((state) => state.addInfluencer);
  const updateInfluencer = useAdminStore((state) => state.updateInfluencer);
  const removeInfluencer = useAdminStore((state) => state.removeInfluencer);

  return { influencers, addInfluencer, updateInfluencer, removeInfluencer };
};

export const useAdminAdmins = () => {
  const admins = useAdminStore((state) => state.admins);
  const updateAdmin = useAdminStore((state) => state.updateAdmin);
  const deleteAdmin = useAdminStore((state) => state.deleteAdmin);

  return { admins, updateAdmin, deleteAdmin };
};

// New hook for user data
export const useAdminUser = () => {
  const user = useAdminStore((state) => state.user);
  const userLoading = useAdminStore((state) => state.userLoading);
  const userError = useAdminStore((state) => state.userError);
  const fetchUser = useAdminStore((state) => state.fetchUser);
  const updateUser = useAdminStore((state) => state.updateUser);
  const clearUser = useAdminStore((state) => state.clearUser);
  const clearUserError = useAdminStore((state) => state.clearUserError);

  return {
    user,
    userLoading,
    userError,
    fetchUser,
    updateUser,
    clearUser,
    clearUserError,
  };
};

export const useAdminStats = () => {
  const loading = useAdminStore((state) => state.loading);
  const refreshing = useAdminStore((state) => state.refreshing);
  const hasInitialized = useAdminStore((state) => state.hasInitialized);
  const error = useAdminStore((state) => state.error);
  const getTotalBrands = useAdminStore((state) => state.getTotalBrands);
  const getTotalInfluencers = useAdminStore(
    (state) => state.getTotalInfluencers
  );
  const getTotalAdmins = useAdminStore((state) => state.getTotalAdmins);

  return {
    loading,
    refreshing,
    hasInitialized,
    error,
    totalBrands: getTotalBrands(),
    totalInfluencers: getTotalInfluencers(),
    totalAdmins: getTotalAdmins(),
  };
};

// Hook to initialize data
export const useInitializeAdminData = () => {
  const fetchData = useAdminStore((state) => state.fetchData);
  const fetchUser = useAdminStore((state) => state.fetchUser);
  const fetchAdmins = useAdminStore((state) => state.fetchAdmins);
  const refreshData = useAdminStore((state) => state.refreshData);
  const loading = useAdminStore((state) => state.loading);
  const hasInitialized = useAdminStore((state) => state.hasInitialized);

  return {
    fetchData,
    fetchUser,
    fetchAdmins,
    refreshData,
    loading,
    hasInitialized,
  };
};
