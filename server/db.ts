import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// Support both Supabase and Nile environment variables
const connectionString = process.env.SUPABASE_DATABASE_URL || process.env.NILEDB_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "Database connection string not found. Please set SUPABASE_DATABASE_URL or NILEDB_URL.",
  );
}

export const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});

export const db = drizzle(pool, { schema });
