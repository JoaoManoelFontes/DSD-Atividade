function getPort(): number {
  const port = Number(process.env.PORT ?? 3002);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("PORT must be a positive integer");
  }

  return port;
}

function getPaymentsTimeoutMs(): number {
  const timeout = Number(process.env.PAYMENTS_TIMEOUT_MS ?? 3000);

  if (!Number.isInteger(timeout) || timeout <= 0) {
    throw new Error("PAYMENTS_TIMEOUT_MS must be a positive integer");
  }

  return timeout;
}

export const config = {
  host: process.env.HOST ?? "0.0.0.0",
  port: getPort(),
  databaseUrl:
    process.env.DATABASE_URL ?? "postgresql://orders:orders@localhost:5432/orders",
  menuServiceUrl: process.env.MENU_SERVICE_URL ?? "http://localhost:3001",
  paymentsServiceUrl: process.env.PAYMENTS_SERVICE_URL ?? "http://localhost:3003",
  paymentsTimeoutMs: getPaymentsTimeoutMs(),
  rabbitmq: {
    url: process.env.RABBITMQ_URL ?? "amqp://guest:guest@localhost:5672",
    exchange: "payments.events",
    queue: "orders.payment-status",
    routingKey: "payment.approved",
  },
};
