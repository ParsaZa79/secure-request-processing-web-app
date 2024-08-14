"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card } from "@nextui-org/react";

function LoginComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = () => {

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setError("Google Client ID is not set");

      return;
    }

    const redirectUri = encodeURIComponent(`${window.location.origin}/login`);
    const scope = encodeURIComponent("openid email profile");
    const responseType = "code";
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`;

    window.location.href = authUrl;
  };

  useEffect(() => {
    const code = searchParams?.get("code");

    if (code) {
      fetch("/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.sessionToken) {
            localStorage.setItem("sessionToken", data.sessionToken);
            router.push("/dashboard");
          } else {
            setError("Failed to get session token");
          }
        })
        .catch((error) => {
          console.error("Error exchanging code for token", error);
          setError("Error during authentication");
        });
    }
  }, [searchParams, router]);

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="p-8 w-96">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">Login</h2>
          {error && <p className="text-red-500 text-center">{error}</p>}
          <Button
            className="w-full"
            color="primary"
            onClick={handleGoogleLogin}
          >
            Login with Google
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginComponent />
    </Suspense>
  );
}
