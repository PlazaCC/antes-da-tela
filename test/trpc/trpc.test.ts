test('tRPC createCaller works with a simple router', async () => {
  const { createTRPCRouter, publicProcedure } = await import('../../trpc/init')

  const router = createTRPCRouter({
    hello: publicProcedure.query(({ ctx }) => {
      return { ok: !!ctx.headers }
    }),
  })

  // supabase is not used by this simple test; satisfy the context typing without using `any`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const caller = router.createCaller({ headers: new Headers({ 'x-test': '1' }), user: null, supabase: {} as any })
  const res = await caller.hello()
  expect(res).toEqual({ ok: true })
})
