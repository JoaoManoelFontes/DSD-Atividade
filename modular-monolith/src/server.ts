import { buildApp } from "./app.js";
import { config } from "./shared/config/env.js";

const app = buildApp();

try {
  await app.listen({ host: config.host, port: config.port });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
