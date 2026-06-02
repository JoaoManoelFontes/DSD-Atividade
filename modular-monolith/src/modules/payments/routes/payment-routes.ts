import type { FastifyInstance } from "fastify";
import type { PaymentService } from "../interfaces/payment-service.js";
import type { ProcessPaymentInput } from "../types/payment.js";

interface PaymentParams {
  id: string;
}

interface PaymentOrderParams {
  orderId: string;
}

const processPaymentBodySchema = {
  type: "object",
  additionalProperties: false,
  required: ["orderId"],
  properties: {
    orderId: { type: "integer", minimum: 1 },
    approved: { type: "boolean" },
  },
} as const;

const paymentParamsSchema = {
  type: "object",
  required: ["id"],
  properties: {
    id: { type: "string", pattern: "^[1-9][0-9]*$" },
  },
} as const;

const paymentOrderParamsSchema = {
  type: "object",
  required: ["orderId"],
  properties: {
    orderId: { type: "string", pattern: "^[1-9][0-9]*$" },
  },
} as const;

export function registerPaymentRoutes(
  app: FastifyInstance,
  paymentService: PaymentService,
) {
  app.post<{ Body: ProcessPaymentInput }>(
    "/payments",
    { schema: { body: processPaymentBodySchema } },
    async (request, reply) => {
      const payment = await paymentService.processPayment(request.body);
      return reply.code(201).send(payment);
    },
  );

  app.get<{ Params: PaymentParams }>(
    "/payments/:id",
    { schema: { params: paymentParamsSchema } },
    async (request, reply) => {
      const payment = await paymentService.getPaymentById(
        Number(request.params.id),
      );

      if (!payment) {
        return reply.code(404).send({ message: "Payment not found" });
      }

      return payment;
    },
  );

  app.get<{ Params: PaymentOrderParams }>(
    "/payments/order/:orderId",
    { schema: { params: paymentOrderParamsSchema } },
    async (request, reply) => {
      const payment = await paymentService.getPaymentByOrderId(
        Number(request.params.orderId),
      );

      if (!payment) {
        return reply.code(404).send({ message: "Payment not found" });
      }

      return payment;
    },
  );
}
