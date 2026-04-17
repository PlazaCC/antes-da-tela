import { createTRPCRouter } from '@/trpc/init'
import { commentsRouter } from './comments'
import { ratingsRouter } from './ratings'
import { scriptsRouter } from './scripts'
import { usersRouter } from './users'

export const appRouter = createTRPCRouter({
  users: usersRouter,
  scripts: scriptsRouter,
  comments: commentsRouter,
  ratings: ratingsRouter,
})

export type AppRouter = typeof appRouter
