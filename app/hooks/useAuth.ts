// @useAuth.ts
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import jwt from "jsonwebtoken";

import { useAppStore } from "../store";

interface DecodedToken {
  id: number;
  username: string;
  email: string;
  name: string;
  picture: string;
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { googleLogin: googleLoginStore, githubLogin: githubLoginStore } =
    useAppStore();

  const router = useRouter();

  const updateAuthState = useCallback(() => {
    const storedToken = localStorage.getItem("sessionToken");

    console.log("Stored token:", storedToken);

    if (storedToken) {
      try {
        const decoded = jwt.decode(storedToken) as DecodedToken;

        console.log("Decoded token:", decoded);

        if (decoded && decoded.exp * 1000 > Date.now()) {
          setToken(storedToken);
          setUser(decoded);

          return true;
        }
      } catch (error) {
        // console.error("Failed to decode token:", error);
      }
    }

    return false;
  }, []);

  const checkAuth = useCallback(() => {
    if (updateAuthState()) {
      router.push("/dashboard");
    }
    setLoading(false);
  }, [updateAuthState, router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const googleLogin = useCallback(
    async (code: string) => {
      if (isLoggingIn) return;
      setIsLoggingIn(true);
      try {
        await googleLoginStore(code);
        if (updateAuthState()) {
          router.push("/dashboard");
        } else {
          throw new Error("Failed to update auth state");
        }
      } catch (error) {
        console.error("Google login failed:", error);
        throw error;
      } finally {
        setIsLoggingIn(false);
      }
    },
    [isLoggingIn, googleLoginStore, updateAuthState, router],
  );

  const githubLogin = useCallback(
    async (code: string) => {
      if (isLoggingIn) return;
      setIsLoggingIn(true);
      try {
        await githubLoginStore(code);
        if (updateAuthState()) {
          router.push("/dashboard");
        } else {
          throw new Error("Failed to update auth state");
        }
      } catch (error) {
        // console.error("GitHub login failed:", error);
        throw error;
      } finally {
        setIsLoggingIn(false);
      }
    },
    [isLoggingIn, githubLoginStore, updateAuthState, router],
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("sessionToken");
    router.push("/login");
  }, [router]);

  return { token, user, googleLogin, githubLogin, logout, loading, checkAuth };
}
