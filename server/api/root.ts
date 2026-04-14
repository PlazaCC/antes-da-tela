import { createTRPCRouter } from "@/trpc/init";

export const appRouter = createTRPCRouter({
  // routers go here: scripts, comments, users, ...
});

export type AppRouter = typeof appRouter;
