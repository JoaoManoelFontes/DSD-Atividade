import postgres from "postgres";
import { config } from "../shared/config/env.js";

export const sql = postgres(config.databaseUrl, {
  max: 10,
});

export async function closeDatabase() {
  await sql.end();
}
