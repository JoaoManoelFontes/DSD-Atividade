import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "../config.js";

const queryClient = postgres(config.databaseUrl);

export const db = drizzle(queryClient);

export async function closeDatabase() {
  await queryClient.end();
}
