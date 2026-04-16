import { createTRPCRouter } from '@/trpc/init'
import { usersRouter } from './users'
import { scriptsRouter } from './scripts'

export const appRouter = createTRPCRouter({
  users: usersRouter,
  scripts: scriptsRouter,
})

export type AppRouter = typeof appRouter
