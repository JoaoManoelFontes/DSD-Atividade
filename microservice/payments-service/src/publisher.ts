import amqp from "amqplib";
import { config } from "./config.js";

interface PaymentApprovedEvent {
  eventType: "payment.approved";
  paymentId: number;
  orderId: number;
  status: "APPROVED";
  observation: string | null;
  occurredAt: string;
}

export interface PaymentEventPublisher {
  publishPaymentApproved(event: PaymentApprovedEvent): Promise<void>;
  close(): Promise<void>;
}

export async function createPaymentEventPublisher(): Promise<PaymentEventPublisher> {
  const connection = await amqp.connect(config.rabbitmq.url);
  const channel = await connection.createConfirmChannel();

  await channel.assertExchange(config.rabbitmq.exchange, "direct", {
    durable: true,
  });

  return {
    async publishPaymentApproved(event) {
      channel.publish(
        config.rabbitmq.exchange,
        config.rabbitmq.routingKey,
        Buffer.from(JSON.stringify(event)),
        {
          contentType: "application/json",
          persistent: true,
        },
      );

      await channel.waitForConfirms();
    },

    async close() {
      await channel.close();
      await connection.close();
    },
  };
}
