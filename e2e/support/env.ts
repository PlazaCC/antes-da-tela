/**
 * Refuses to run the suite outside the dev environment: the tests create and
 * delete users, calls and votes.
 */
export function assertDevEnvironment(): void {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? ''
  if (!clerkKey.startsWith('pk_test_')) {
    throw new Error('E2E: use a instância Development do Clerk (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY começando com pk_test_).')
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl || supabaseUrl !== process.env.E2E_SUPABASE_URL) {
    throw new Error(
      'E2E: defina E2E_SUPABASE_URL com a URL do Supabase de DEV (igual à NEXT_PUBLIC_SUPABASE_URL). ' +
        'Essa confirmação evita rodar os testes contra produção.',
    )
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.CLERK_SECRET_KEY) {
    throw new Error('E2E: SUPABASE_SERVICE_ROLE_KEY e CLERK_SECRET_KEY são necessárias para preparar os dados de teste.')
  }
}
