import { createTRPCRouter } from '@/trpc/init'
import { charactersRouter } from './characters'
import { commentsRouter } from './comments'
import { ratingsRouter } from './ratings'
import { scriptsRouter } from './scripts'
import { usersRouter } from './users'

export const appRouter = createTRPCRouter({
  users: usersRouter,
  scripts: scriptsRouter,
  comments: commentsRouter,
  ratings: ratingsRouter,
  characters: charactersRouter,
})

export type AppRouter = typeof appRouter
