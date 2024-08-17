import { create } from "zustand";
import axios from "axios";
import jwt from "jsonwebtoken";

interface UserInfo {
  session_token: string;
}

interface User {
  id: string;
  username: string | null;
  email: string | null;
  name: string;
  picture: string | null;
  exp: number;
}

interface UserRequest {
  id: number;
  user_query: string;
  status: string;
  result: string;
  created_at: string;
  updated_at: string;
}

interface LogObject {
  logs: LogInstance[];
}

interface LogInstance {
  funcName: string;
  level: string;
  lineno: number;
  message: string;
  module: string;
  remote_addr: string;
  timestamp: string;
  url: string;
}

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
  logs: LogInstance[];
  isLoading: boolean;
  error: string | null;
  googleLogin: (code: string) => Promise<void>;
  githubLogin: (code: string) => Promise<void>;
  logout: () => void;
  fetchRequests: () => Promise<void>;
  submitRequest: (query: string) => Promise<number>;
  getResult: (requestId: number) => Promise<void>;
  userRequests: UserRequest[];
  fetchUserRequests: () => Promise<void>;
  fetchLogs: () => Promise<void>;
  setError: (error: string | null) => void;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
// const API_BASE_URL = "http://localhost:8080";

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
  userRequests: [],

  setError: (error) => set({ error }),

  googleLogin: async (code: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<UserInfo>("/api/auth/google", { code });
      const sessionToken = response.data.session_token;
      const user = jwt.decode(sessionToken) as User;

      localStorage.setItem("sessionToken", sessionToken);
      set({
        isAuthenticated: true,
        sessionToken,
        user: user,
        isLoading: false,
      });
    } catch (error) {
      // console.error("Login error:", error);
      set({ error: "Failed to login", isLoading: false });
      throw error;
    }
  },

  githubLogin: async (code: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<UserInfo>("/api/auth/github", { code });
      const sessionToken = response.data.session_token;
      const user = jwt.decode(sessionToken) as User;

      localStorage.setItem("sessionToken", sessionToken);
      set({
        isAuthenticated: true,
        sessionToken,
        user: user,
        isLoading: false,
      });
    } catch (error) {
      console.error("Login error:", error);
      set({ error: "Failed to login", isLoading: false });
      throw error;
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

  fetchUserRequests: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<{ requests: UserRequest[] }>("/requests");

      set({ userRequests: response.data.requests, isLoading: false });
    } catch (error) {
      console.error("Error fetching user requests:", error);
      set({ error: "Failed to fetch user requests", isLoading: false });
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
      const response = await api.get<LogObject>("/logs");

      console.log("Raw API response:", response.data);

      if (Array.isArray(response.data.logs)) {
        console.log("Logs array:", response.data.logs);
        set({ logs: response.data.logs, isLoading: false });
      } else {
        console.error("Unexpected response format:", response.data);
        set({ error: "Unexpected response format", isLoading: false });
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      set({ error: "Failed to fetch logs", isLoading: false });
    }
  },
}));
