import { buildApp } from "./app.js";
import { config } from "./config.js";
import { startPaymentConsumer } from "./payment-consumer.js";

const app = buildApp();

try {
  const closeConsumer = await startPaymentConsumer(app.log);

  app.addHook("onClose", async () => {
    await closeConsumer();
  });

  await app.listen({ host: config.host, port: config.port });
} catch (error) {
  app.log.error(error);
  await app.close();
  process.exit(1);
}
