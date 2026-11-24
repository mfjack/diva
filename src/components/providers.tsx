"use client";

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { type ReactNode, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { reloadOnOutdatedDeployment } from "@/lib/outdated-deployment";

const ONE_MINUTE_IN_MS = 60 * 1000;

function createQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({ onError: reloadOnOutdatedDeployment }),
    mutationCache: new MutationCache({ onError: reloadOnOutdatedDeployment }),
    defaultOptions: {
      queries: {
        staleTime: ONE_MINUTE_IN_MS,
        refetchOnWindowFocus: false,
      },
    },
  });
}

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        <TooltipProvider>
          {children}
          <Toaster theme="light" position="bottom-right" />
        </TooltipProvider>
      </NuqsAdapter>
    </QueryClientProvider>
  );
}
