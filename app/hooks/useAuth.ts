import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import jwt from "jsonwebtoken";

import { useAppStore } from "../store";

interface DecodedToken {
  email: string;
  name: string;
  picture: string;
  exp: number;
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [loading, setLoading] = useState(true);
  const loginFromStore = useAppStore((state) => state.login);

  const router = useRouter();

  const checkAuth = useCallback(() => {
    const storedToken = localStorage.getItem("sessionToken");


    if (storedToken) {
      try {
        const decoded = jwt.decode(storedToken) as DecodedToken;

        if (decoded && decoded.exp * 1000 > Date.now()) {
          setToken(storedToken);
          setUser(decoded);
        } else {
          logout();
        }
      } catch (error) {
        console.error("Failed to decode token:", error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (code: string) => {
    try {
      await loginFromStore(code);

      const storedToken = localStorage.getItem("sessionToken");

      if (storedToken) {
        const decoded = jwt.decode(storedToken) as DecodedToken;

        setToken(storedToken);
        setUser(decoded);
        router.push("/dashboard");
      } else {
        throw new Error("Failed to get session token");
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("sessionToken");
    router.push("/login");
  }, [router]);

  return { token, user, login, logout, loading, checkAuth };
}
