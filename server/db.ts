import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

const connectionString = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "Database connection string not found. Please set SUPABASE_DATABASE_URL.",
  );
}

const client = postgres(connectionString, { 
  prepare: false,
  ssl: 'require'
});

export const db = drizzle(client, { schema });
