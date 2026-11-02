/**
 * Applies the Drizzle migrations printing the real error.
 *
 * `drizzle-kit migrate` (0.31) can stop at "applying migrations..." without
 * showing why. This runs the same migrator (all pending migrations in one
 * transaction) and prints the failing query and Postgres message.
 *
 * Uses DATABASE_URL_UNPOOLED from .env.local, then .env (.env.local wins).
 *   yarn db:migrate:verbose
 */
import { config } from 'dotenv'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'

config({ path: '.env.local' })
config({ path: '.env' })

const url = process.env.DATABASE_URL_UNPOOLED
if (!url) {
  console.error('DATABASE_URL_UNPOOLED não está definida (.env.local ou .env)')
  process.exit(1)
}
console.log('Banco:', new URL(url).host)
const sql = postgres(url, { max: 1, onnotice: () => {} })
try {
  await sql`select 1`
  console.log('Conexão OK')
  await migrate(drizzle(sql), { migrationsFolder: './drizzle' })
  console.log('Migrações aplicadas com sucesso')
} catch (error) {
  console.error('\nERRO:', error.message)
  if (error.cause) console.error('CAUSA:', error.cause.message ?? error.cause)
  process.exitCode = 1
} finally {
  await sql.end()
}
