import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { ENV } from "./env.js";
import * as schema from "../db/schema.js";

// Initialize Neon client
const sql = neon(ENV.DATABASE_URL);

// Initialize Drizzle with schema for type safety
export const db = drizzle<typeof schema>(sql, { schema });
