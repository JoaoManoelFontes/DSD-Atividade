import Fastify from "fastify";
import { eq } from "drizzle-orm";
import { closeDatabase, db } from "./db/client.js";
import { payments } from "./db/schema.js";
import type { PaymentEventPublisher } from "./publisher.js";

interface PaymentBody {
  orderId: number;
  amount: number;
}

interface PaymentParams {
  id: string;
}

interface OrderParams {
  orderId: string;
}

const paymentBodySchema = {
  type: "object",
  additionalProperties: false,
  required: ["orderId", "amount"],
  properties: {
    orderId: { type: "integer", minimum: 1 },
    amount: { type: "number", exclusiveMinimum: 0 },
  },
} as const;

const paymentParamsSchema = {
  type: "object",
  required: ["id"],
  properties: {
    id: { type: "string", pattern: "^[1-9][0-9]*$" },
  },
} as const;

const orderParamsSchema = {
  type: "object",
  required: ["orderId"],
  properties: {
    orderId: { type: "string", pattern: "^[1-9][0-9]*$" },
  },
} as const;

function serializePayment(payment: typeof payments.$inferSelect) {
  return {
    ...payment,
    amount: Number(payment.amount),
  };
}

export function buildApp(paymentEventPublisher: PaymentEventPublisher) {
  const app = Fastify({ logger: true });

  app.addHook("onClose", async () => {
    await paymentEventPublisher.close();
    await closeDatabase();
  });

  app.get("/health", async () => ({
    status: "ok",
    service: "payments-service",
  }));

  app.post<{ Body: PaymentBody }>(
    "/payments",
    { schema: { body: paymentBodySchema } },
    async (request, reply) => {
      const paidAt = new Date();

      request.log.info(
        { orderId: request.body.orderId, amount: request.body.amount },
        "Processing mock payment",
      );

      const [payment] = await db
        .insert(payments)
        .values({
          orderId: request.body.orderId,
          amount: request.body.amount.toFixed(2),
          status: "APPROVED",
          paidAt,
        })
        .returning();

      request.log.info(
        { paymentId: payment.id, orderId: payment.orderId, status: payment.status },
        "Mock payment processed",
      );

      await paymentEventPublisher.publishPaymentApproved({
        eventType: "payment.approved",
        paymentId: payment.id,
        orderId: payment.orderId,
        status: "APPROVED",
        occurredAt: paidAt.toISOString(),
      });

      request.log.info(
        { paymentId: payment.id, orderId: payment.orderId },
        "Payment approved event published",
      );

      return reply.code(201).send(serializePayment(payment));
    },
  );

  app.get<{ Params: OrderParams }>(
    "/payments/order/:orderId",
    { schema: { params: orderParamsSchema } },
    async (request) => {
      const orderPayments = await db
        .select()
        .from(payments)
        .where(eq(payments.orderId, Number(request.params.orderId)))
        .orderBy(payments.id);

      return orderPayments.map(serializePayment);
    },
  );

  app.get<{ Params: PaymentParams }>(
    "/payments/:id",
    { schema: { params: paymentParamsSchema } },
    async (request, reply) => {
      const [payment] = await db
        .select()
        .from(payments)
        .where(eq(payments.id, Number(request.params.id)));

      if (!payment) {
        return reply.code(404).send({ message: "Payment not found" });
      }

      return serializePayment(payment);
    },
  );

  return app;
}
