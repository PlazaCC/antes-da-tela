import { createTRPCRouter } from "@/trpc/init";
import { usersRouter } from "./users";

export const appRouter = createTRPCRouter({
  users: usersRouter,
  // routers go here: scripts, comments, ...
});

export type AppRouter = typeof appRouter;
