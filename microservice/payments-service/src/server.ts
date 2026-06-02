import { buildApp } from "./app.js";
import { config } from "./config.js";
import { createPaymentEventPublisher } from "./publisher.js";

const paymentEventPublisher = await createPaymentEventPublisher();
const app = buildApp(paymentEventPublisher);

try {
  await app.listen({ host: config.host, port: config.port });
} catch (error) {
  app.log.error(error);
  await app.close();
  process.exit(1);
}
