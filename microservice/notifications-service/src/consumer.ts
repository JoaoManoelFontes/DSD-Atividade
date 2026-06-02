import amqp from "amqplib";
import type { FastifyBaseLogger } from "fastify";
import { config } from "./config.js";
import { sendEmail } from "./email.js";

interface PaymentApprovedEvent {
  eventType: "payment.approved";
  paymentId: number;
  orderId: number;
  status: "APPROVED";
  occurredAt: string;
}

function parsePaymentApprovedEvent(content: Buffer): PaymentApprovedEvent {
  const payload: unknown = JSON.parse(content.toString("utf8"));

  if (
    typeof payload !== "object" ||
    payload === null ||
    !("eventType" in payload) ||
    payload.eventType !== "payment.approved" ||
    !("paymentId" in payload) ||
    typeof payload.paymentId !== "number" ||
    !("orderId" in payload) ||
    typeof payload.orderId !== "number" ||
    !("status" in payload) ||
    payload.status !== "APPROVED" ||
    !("occurredAt" in payload) ||
    typeof payload.occurredAt !== "string"
  ) {
    throw new Error("Invalid payment approved event");
  }

  return payload as PaymentApprovedEvent;
}

export async function startNotificationConsumer(logger: FastifyBaseLogger) {
  const connection = await amqp.connect(config.rabbitmq.url);
  const channel = await connection.createChannel();

  await channel.assertExchange(config.rabbitmq.exchange, "direct", {
    durable: true,
  });
  await channel.assertQueue(config.rabbitmq.queue, { durable: true });
  await channel.bindQueue(
    config.rabbitmq.queue,
    config.rabbitmq.exchange,
    config.rabbitmq.routingKey,
  );
  await channel.prefetch(1);

  await channel.consume(config.rabbitmq.queue, async (message) => {
    if (!message) {
      return;
    }

    let event: PaymentApprovedEvent;

    try {
      event = parsePaymentApprovedEvent(message.content);
    } catch (error) {
      logger.error({ err: error }, "Discarding invalid payment approved event");
      channel.nack(message, false, false);
      return;
    }

    try {
      const info = await sendEmail({
        to: "cozinha@lanchonete.com",
        subject: "Novo pedido pago",
        text: `O pedido ${event.orderId} foi pago e já pode ser preparado.`,
      });

      logger.info(
        { messageId: info.messageId, orderId: event.orderId },
        "Notification email sent",
      );
      channel.ack(message);
    } catch (error) {
      logger.error(
        { err: error, orderId: event.orderId },
        "Failed to send notification email",
      );
      channel.nack(message, false, true);
    }
  });

  logger.info(
    {
      exchange: config.rabbitmq.exchange,
      queue: config.rabbitmq.queue,
      routingKey: config.rabbitmq.routingKey,
    },
    "RabbitMQ payment approval consumer started",
  );

  return async () => {
    await channel.close();
    await connection.close();
  };
}
