"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "../hooks/useAuth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, checkAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
