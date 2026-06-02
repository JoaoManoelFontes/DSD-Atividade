function getPort(): number {
  const port = Number(process.env.PORT ?? 3003);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("PORT must be a positive integer");
  }

  return port;
}

export const config = {
  host: process.env.HOST ?? "0.0.0.0",
  port: getPort(),
  databaseUrl:
    process.env.DATABASE_URL ??
    "postgresql://payments:payments@localhost:5433/payments",
  rabbitmq: {
    url: process.env.RABBITMQ_URL ?? "amqp://guest:guest@localhost:5672",
    exchange: "payments.events",
    routingKey: "payment.approved",
  },
};
