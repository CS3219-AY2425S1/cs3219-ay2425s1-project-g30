"use client"

import { Inter, Roboto } from "next/font/google";
import ReactQueryProvider from "@/components/ReactQueryProvider";
import Suspense from "@/components/Suspense";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";
import { useAuthStore } from "@/store/AuthStore";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fetchUser = useAuthStore.use.fetchUser();
  
  // Fetch user data on initial render, ensures logged in user data is available
  useEffect(() => {
    const initializeUser = async () => {
      try {
        await fetchUser();
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };
    initializeUser();
  }, [fetchUser]);
  
  return (
    <html lang="en" className={inter.className}>
      <body className={roboto.className}>
        <Suspense fallback={<Skeleton className="w-screen h-screen" />}>
          <ReactQueryProvider>{children}</ReactQueryProvider>
          <Toaster />
        </Suspense>
      </body>
    </html>
  );
}
