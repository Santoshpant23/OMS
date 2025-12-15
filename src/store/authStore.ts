import { create } from "zustand";
import axios from "axios";

const API_BASE_URL = "http://localhost:8082/api";

export interface AuthStore {
  token: string | null;
  userId: number | null;
  email: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setToken: (token: string, userId: number, email: string) => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>(
  (set): AuthStore => ({
    token: localStorage.getItem("token"),
    userId: localStorage.getItem("userId")
      ? parseInt(localStorage.getItem("userId")!)
      : null,
    email: localStorage.getItem("email"),
    isLoading: false,
    error: null,

    login: async (email: string, password: string) => {
      set({ isLoading: true, error: null });
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
          email,
          password,
        });

        const { token, user_id, email: userEmail } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem("userId", user_id.toString());
        localStorage.setItem("email", userEmail);

        set({
          token,
          userId: user_id,
          email: userEmail,
          isLoading: false,
        });
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || "Login failed";
        set({ error: errorMsg, isLoading: false });
        throw err;
      }
    },

    signup: async (email: string, password: string) => {
      set({ isLoading: true, error: null });
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
          email,
          password,
        });

        const { user_id, email: userEmail } = response.data;

        // Auto-login after signup
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
          email,
          password,
        });

        const { token } = loginResponse.data;

        localStorage.setItem("token", token);
        localStorage.setItem("userId", user_id.toString());
        localStorage.setItem("email", userEmail);

        set({
          token,
          userId: user_id,
          email: userEmail,
          isLoading: false,
        });
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || "Signup failed";
        set({ error: errorMsg, isLoading: false });
        throw err;
      }
    },

    logout: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("email");
      set({
        token: null,
        userId: null,
        email: null,
        isLoading: false,
        error: null,
      });
    },

    setToken: (token: string, userId: number, email: string) => {
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId.toString());
      localStorage.setItem("email", email);
      set({ token, userId, email });
    },

    isAuthenticated: (): boolean => {
      const state = useAuthStore.getState();
      return !!state.token && !!state.userId;
    },
  })
);

// Create axios instance with auth header
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
