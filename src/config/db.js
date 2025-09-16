import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import { ENV } from "./env.js";
import * as schema from "../db/schema.js";

const { Pool } = pkg;

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: ENV.DATABASE_URL,
});

// Initialize Drizzle with full CRUD support
export const db = drizzle(pool, { schema });
