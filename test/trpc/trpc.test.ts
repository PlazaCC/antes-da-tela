test('tRPC createCaller works with a simple router', async () => {
  const { createTRPCRouter, publicProcedure } = await import('../../trpc/init')

  const router = createTRPCRouter({
    hello: publicProcedure.query(({ ctx }) => {
      return { ok: !!ctx.headers }
    }),
  })

  const supabase = {} as unknown as import('@supabase/supabase-js').SupabaseClient
  const caller = router.createCaller({
    headers: new Headers({ 'x-test': '1' }),
    user: null,
    supabase,
    ratingsService: {} as unknown as import('@/server/services/ratings.service').RatingsService,
    usersService: {} as unknown as import('@/server/services/users.service').UsersService,
    scriptsService: {} as unknown as import('@/server/services/scripts.service').ScriptsService,
    commentsService: {} as unknown as import('@/server/services/comments.service').CommentsService,
  })
  const res = await caller.hello()
  expect(res).toEqual({ ok: true })
})
