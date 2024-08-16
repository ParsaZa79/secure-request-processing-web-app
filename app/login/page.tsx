/* eslint-disable jsx-a11y/anchor-is-valid */
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button, Card, Image, Spacer } from "@nextui-org/react";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { motion } from "framer-motion";
import { useCallback } from "react";

import { useAuth } from "../hooks/useAuth";

function LoginComponent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const { googleLogin, githubLogin } = useAuth();
  const [loginProcessed, setLoginProcessed] = useState(false);

  const processLogin = useCallback(
    async (code: string, state: string) => {
      if (loginProcessed) return;
      setLoginProcessed(true);
      try {
        if (state === "github") {
          await githubLogin(code);
        } else if (state === "google") {
          await googleLogin(code);
        } else {
          throw new Error("Invalid authentication state");
        }
      } catch (error) {
        console.error(`Error during ${state} login:`, error);
        setError(`Error during ${state} authentication`);
      }
    },
    [githubLogin, googleLogin, loginProcessed],
  );

  useEffect(() => {
    const code = searchParams?.get("code");
    const state = searchParams?.get("state");

    if (code && state) {
      window.history.replaceState({}, document.title, "/login");
      processLogin(code, state);
    }
  }, [searchParams, processLogin]);

  const handleGoogleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setError("Google Client ID is not set");

      return;
    }

    const redirectUri = encodeURIComponent(`${window.location.origin}/login`);
    const scope = encodeURIComponent("openid email profile");
    const responseType = "code";
    const state = encodeURIComponent("google");
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&state=${state}`;

    window.location.href = authUrl;
  };

  const handleGithubLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;

    if (!clientId) {
      setError("GitHub Client ID is not set");

      return;
    }

    const redirectUri = encodeURIComponent(`${window.location.origin}/login`);
    const scope = encodeURIComponent("user:email");
    const state = encodeURIComponent("github");
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;

    window.location.href = authUrl;
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-8 w-96 bg-white/80 backdrop-blur-md">
          <div className="space-y-6">
            <div className="text-center flex items-center flex-col justify-center">
              <Image
                alt="Logo"
                className="mx-auto"
                height={80}
                src="/logo.png"
                width={80}
              />
              <h2 className="text-2xl text-black font-bold my-4">
                Welcome to Secure Request Processing Dashboard
              </h2>
              <p className="text-gray-500">Sign in to access your account</p>
            </div>
            <Spacer y={4} />
            {error && <p className="text-center text-red-500">{error}</p>}
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              startContent={<FaGoogle />}
              onClick={handleGoogleLogin}
            >
              Sign in with Google
            </Button>
            <Button
              className="w-full bg-gray-800 hover:bg-gray-900 text-white"
              startContent={<FaGithub />}
              onClick={handleGithubLogin}
            >
              Sign in with GitHub
            </Button>
            <div className="text-center">
              <p className="text-sm text-gray-500">
                By signing in, you agree to our{" "}
                <a className="text-blue-600 hover:underline" href="#">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a className="text-blue-600 hover:underline" href="#">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
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
