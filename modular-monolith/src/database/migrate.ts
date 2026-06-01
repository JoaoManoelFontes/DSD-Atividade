import { closeDatabase, sql } from "./connection.js";
import { runInitialMigration } from "./migrations/001_create_schemas.js";

await runInitialMigration(sql);
await closeDatabase();

console.log("Modular monolith database schemas are ready");
