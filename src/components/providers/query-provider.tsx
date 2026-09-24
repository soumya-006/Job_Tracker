"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useTheme } from "next-themes";

function ToasterWithTheme() {
  const { theme } = useTheme();
  return (
    <Toaster
      position="top-right"
      theme={(theme as "light" | "dark" | "system") || "system"}
      richColors
      closeButton
      toastOptions={{
        className: "border font-sans shadow-lg",
      }}
    />
  );
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ToasterWithTheme />
    </QueryClientProvider>
  );
}
