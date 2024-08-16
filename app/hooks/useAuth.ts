// @useAuth.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import jwt from "jsonwebtoken";

import { useAppStore } from "../store";

interface DecodedToken {
  id: string;
  username: string;
  email: string;
  name: string;
  picture: string;
  exp: number;
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { googleLogin: googleLoginStore, githubLogin: githubLoginStore } =
    useAppStore();

  const router = useRouter();
  const loginAttemptRef = useRef<string | null>(null);

  const updateAuthState = useCallback(() => {
    const storedToken = localStorage.getItem("sessionToken");

    console.log(
      "Updating auth state. Stored token:",
      storedToken ? "exists" : "does not exist"
    );

    if (storedToken) {
      try {
        const decoded = jwt.decode(storedToken) as DecodedToken;

        console.log("Decoded token:", decoded);

        if (decoded && decoded.exp) {
          const expirationDate = new Date(decoded.exp * 1000);
          console.log("Token expiration date:", expirationDate);

          if (expirationDate > new Date()) {
            setToken(storedToken);
            setUser(decoded);
            console.log("Auth state updated successfully");
            return true;
          } else {
            console.log("Token expired");
          }
        } else {
          console.log("Invalid token: missing expiration");
        }
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    }

    console.log("Auth state update failed");

    return false;
  }, []);

  const checkAuth = useCallback(() => {
    console.log("Checking auth...");
    if (updateAuthState()) {
      console.log("Auth check successful, redirecting to dashboard");
      router.push("/dashboard");
    } else {
      console.log("Auth check failed");
    }
    setLoading(false);
  }, [updateAuthState, router]);

  useEffect(() => {
    console.log("Initial auth check");
    checkAuth();
  }, [checkAuth]);

  const googleLogin = useCallback(
    async (code: string) => {
      console.log("Google login attempt with code:", code);

      if (isLoggingIn) {
        console.log("Login already in progress, ignoring this attempt");

        return;
      }

      if (loginAttemptRef.current === code) {
        console.log("Duplicate login attempt detected, ignoring");

        return;
      }

      setIsLoggingIn(true);
      loginAttemptRef.current = code;

      try {
        console.log("Calling googleLoginStore");
        await googleLoginStore(code);
        console.log("googleLoginStore call completed");

        if (updateAuthState()) {
          console.log(
            "Auth state updated successfully, redirecting to dashboard"
          );
          router.push("/dashboard");
        } else {
          console.error("Failed to update auth state after successful login");
          throw new Error("Failed to update auth state");
        }
      } catch (error) {
        console.error("Google login failed:", error);
        throw error;
      } finally {
        setIsLoggingIn(false);
        loginAttemptRef.current = null;
      }
    },
    [isLoggingIn, googleLoginStore, updateAuthState, router]
  );

  const githubLogin = useCallback(
    async (code: string) => {
      console.log("GitHub login attempt with code:", code);

      if (isLoggingIn) {
        console.log("Login already in progress, ignoring this attempt");
        return;
      }

      if (loginAttemptRef.current === code) {
        console.log("Duplicate GitHub login attempt detected, ignoring");
        return;
      }

      setIsLoggingIn(true);
      loginAttemptRef.current = code;

      try {
        console.log("Calling githubLoginStore");
        await githubLoginStore(code);
        console.log("githubLoginStore call completed");

        if (updateAuthState()) {
          console.log(
            "Auth state updated successfully, redirecting to dashboard"
          );
          router.push("/dashboard");
        } else {
          console.error(
            "Failed to update auth state after successful GitHub login"
          );
          throw new Error("Failed to update auth state");
        }
      } catch (error) {
        console.error("GitHub login failed:", error);
        throw error;
      } finally {
        setIsLoggingIn(false);
        loginAttemptRef.current = null;
      }
    },
    [isLoggingIn, githubLoginStore, updateAuthState, router]
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("sessionToken");
    router.push("/login");
  }, [router]);

  return { token, user, googleLogin, githubLogin, logout, loading, checkAuth };
}
