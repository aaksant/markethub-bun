import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { createClient } from "@supabase/supabase-js";

config({ path: "../../../.env" });

const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined.");
}

const client = postgres(connectionString);
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase credentials.");
}

export const db = drizzle(client, {
  schema,
  logger: true
});

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
