test('tRPC createCaller works with a simple router', async () => {
  const { createTRPCRouter, publicProcedure } = await import('../../trpc/init')

  const router = createTRPCRouter({
    hello: publicProcedure.query(({ ctx }) => {
      return { ok: !!ctx.headers }
    }),
  })

  const caller = router.createCaller({ headers: new Headers({ 'x-test': '1' }), user: null })
  const res = await caller.hello()
  expect(res).toEqual({ ok: true })
})
