import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'
// Make sure the environment variable is named correctly for Supabase
const connectionString = process.env.NEXT_PUBLIC_DATABASE_URL!
// Add SSL configuration for Supabase
const client = postgres(connectionString, {
  prepare: false,
})
const db = drizzle(client, { schema })

export { db }