import { Inter, Roboto } from "next/font/google";
import ReactQueryProvider from "@/components/ReactQueryProvider";
import Suspense from "@/components/Suspense";
import { Skeleton } from "@/components/ui/skeleton";
import { LoginStateProvider } from "@/contexts/LoginStateContext";
import { Toaster } from "@/components/ui/toaster";

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
  return (
    <html lang="en" className={inter.className}>
      <body className={roboto.className}>
        <LoginStateProvider>
          <Suspense fallback={<Skeleton className="w-screen h-screen" />}>
            <ReactQueryProvider>{children}</ReactQueryProvider>
            <Toaster />
          </Suspense>
        </LoginStateProvider>
      </body>
    </html>
  );
}
