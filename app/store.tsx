import { create } from "zustand";
import axios from "axios";

interface Request {
  request_id: number;
  query: string;
}

interface Result {
  result: string;
  status: string;
}

interface AuthState {
  isAuthenticated: boolean;
  sessionToken: string | null;
  user: any | null;
}

interface AppState extends AuthState {
  requests: Request[];
  currentResult: Result | null;
  logs: string[];
  isLoading: boolean;
  error: string | null;
  login: (code: string) => Promise<void>;
  logout: () => void;
  fetchRequests: () => Promise<void>;
  submitRequest: (query: string) => Promise<number>;
  getResult: (requestId: number) => Promise<void>;
  fetchLogs: () => Promise<void>;
  setError: (error: string | null) => void;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("sessionToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  sessionToken: null,
  user: null,
  requests: [],
  currentResult: null,
  logs: [],
  isLoading: false,
  error: null,

  setError: (error) => set({ error }),

  login: async (code: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post("/api/auth/google", { code });
      const { sessionToken } = response.data;

      localStorage.setItem("sessionToken", sessionToken);
      set({
        isAuthenticated: true,
        sessionToken,
        user: {
          /* Add user data here */
        },
        isLoading: false,
      });
    } catch (error) {
      console.error("Login error:", error);
      set({ error: "Failed to login", isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem("sessionToken");
    set({ isAuthenticated: false, sessionToken: null, user: null });
  },

  fetchRequests: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<Request>("/fetch-requests");

      set({ requests: [response.data], isLoading: false });
    } catch (error) {
      console.error("Error fetching requests:", error);
      set({ error: "Failed to fetch requests", isLoading: false });
    }
  },

  submitRequest: async (query: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<{ request_id: number }>(
        "/submit-request",
        { query },
      );

      set({ isLoading: false });

      return response.data.request_id;
    } catch (error) {
      console.error("Error submitting request:", error);
      set({ error: "Failed to submit request", isLoading: false });

      return -1;
    }
  },

  getResult: async (requestId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<Result>(`/get-result/${requestId}`);

      set({ currentResult: response.data, isLoading: false });
    } catch (error) {
      console.error("Error getting result:", error);
      set({ error: "Failed to get result", isLoading: false });
    }
  },

  fetchLogs: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<string[]>("/logs");

      set({ logs: response.data, isLoading: false });
    } catch (error) {
      console.error("Error fetching logs:", error);
      set({ error: "Failed to fetch logs", isLoading: false });
    }
  },
}));
