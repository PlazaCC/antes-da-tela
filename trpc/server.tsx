import "server-only";
import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { cache } from "react";
import { createTRPCContext } from "./init";
import { makeQueryClient } from "./query-client";
import { appRouter } from "@/server/api/root";
import { createCallerFactory } from "@trpc/server";

const getQueryClient = cache(makeQueryClient);
const caller = createCallerFactory(appRouter)(createTRPCContext);

export const { trpc, HydrateClient } =
  createHydrationHelpers<typeof appRouter>(caller, getQueryClient);
