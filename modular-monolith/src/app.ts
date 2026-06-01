import Fastify from "fastify";
import { closeDatabase } from "./database/connection.js";
import { buildContainer } from "./shared/config/container.js";
import { AppError } from "./shared/errors/app-error.js";
import { registerMenuRoutes } from "./modules/menu/routes/menu-routes.js";
import { registerNotificationRoutes } from "./modules/notifications/routes/notification-routes.js";
import { registerOrderRoutes } from "./modules/orders/routes/order-routes.js";
import { registerPaymentRoutes } from "./modules/payments/routes/payment-routes.js";

export function buildApp() {
  const app = Fastify({ logger: true });
  const services = buildContainer();

  app.addHook("onClose", async () => {
    await closeDatabase();
  });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof AppError) {
      return reply.code(error.statusCode).send({ message: error.message });
    }

    const fastifyError = error as Error & { validation?: unknown };

    if (fastifyError.validation) {
      return reply.code(400).send({ message: fastifyError.message });
    }

    app.log.error(fastifyError);
    return reply.code(500).send({ message: "Internal server error" });
  });

  app.get("/health", async () => ({
    status: "ok",
    service: "modular-monolith",
  }));

  registerMenuRoutes(app, services.menuService);
  registerOrderRoutes(app, services.orderService);
  registerPaymentRoutes(app, services.paymentService);
  registerNotificationRoutes(app, services.notificationService);

  return app;
}
