"use client";

import { Link } from "@nextui-org/link";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";

import { useAppStore } from "./store";

import { siteConfig } from "@/config/site";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout } = useAppStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="relative flex flex-col h-screen">
      <Navbar>
        <NavbarBrand>
          <p className="font-bold text-inherit">{siteConfig.name}</p>
        </NavbarBrand>
        <NavbarContent justify="end">
          {isAuthenticated ? (
            <NavbarItem>
              <Button color="primary" onClick={handleLogout}>
                Logout
              </Button>
            </NavbarItem>
          ) : (
            <NavbarItem>
              <Button color="primary" onClick={() => router.push("/login")}>
                Login
              </Button>
            </NavbarItem>
          )}
        </NavbarContent>
      </Navbar>
      <main className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">
        {children}
      </main>
      <footer className="w-full flex items-center justify-center py-3">
        <Link
          isExternal
          className="flex items-center gap-1 text-current"
          href="https://nextui-docs-v2.vercel.app?utm_source=next-app-template"
          title="nextui.org homepage"
        >
          <span className="text-default-600">Powered by</span>
          <p className="text-primary">NextUI</p>
        </Link>
      </footer>
    </div>
  );
}
