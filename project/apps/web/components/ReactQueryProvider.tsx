"use client"; // This ensures the component is a Client Component

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/reactQuery";

export default function ReactQueryProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
