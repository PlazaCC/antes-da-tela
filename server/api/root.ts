import { createTRPCRouter } from '@/trpc/init'
import { adminRouter } from './admin'
import { callsRouter } from './calls'
import { charactersRouter } from './characters'
import { commentsRouter } from './comments'
import { interpretersRouter } from './interpreters'
import { onboardingRouter } from './onboarding'
import { ratingsRouter } from './ratings'
import { scriptsRouter } from './scripts'
import { usersRouter } from './users'

export const appRouter = createTRPCRouter({
  users: usersRouter,
  scripts: scriptsRouter,
  comments: commentsRouter,
  ratings: ratingsRouter,
  characters: charactersRouter,
  onboarding: onboardingRouter,
  interpreters: interpretersRouter,
  admin: adminRouter,
  calls: callsRouter,
})

export type AppRouter = typeof appRouter
