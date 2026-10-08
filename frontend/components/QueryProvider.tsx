"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes fresh cache
            gcTime: 10 * 60 * 1000,   // 10 minutes garbage collection
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            retry: 0, // Fail fast to local state instead of hanging on retries
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
