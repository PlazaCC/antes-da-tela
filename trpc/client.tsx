"use client";

import { createTRPCContext } from "@trpc/tanstack-react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { QueryClientProvider } from "@tanstack/react-query";
import superjson from "superjson";
import { useState } from "react";
import { makeQueryClient } from "./query-client";
import type { AppRouter } from "@/server/api/root";

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

let clientQueryClient: ReturnType<typeof makeQueryClient> | undefined;

function getQueryClient() {
  if (typeof window === "undefined") return makeQueryClient();
  if (!clientQueryClient) clientQueryClient = makeQueryClient();
  return clientQueryClient;
}

export function TRPCReactProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          transformer: superjson,
        }),
      ],
    })
  );

  return (
    <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </TRPCProvider>
  );
}
