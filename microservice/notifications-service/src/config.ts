function getPort(): number {
  const port = Number(process.env.PORT ?? 3004);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("PORT must be a positive integer");
  }

  return port;
}

function getSmtpPort(): number {
  const port = Number(process.env.SMTP_PORT ?? 1025);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("SMTP_PORT must be a positive integer");
  }

  return port;
}

export const config = {
  host: process.env.HOST ?? "0.0.0.0",
  port: getPort(),
  rabbitmq: {
    url: process.env.RABBITMQ_URL ?? "amqp://guest:guest@localhost:5672",
    exchange: "payments.events",
    queue: "email.notifications",
    routingKey: "payment.approved",
  },
  smtp: {
    host: process.env.SMTP_HOST ?? "localhost",
    port: getSmtpPort(),
    from: process.env.SMTP_FROM ?? "kitchen@example.com",
  },
};
