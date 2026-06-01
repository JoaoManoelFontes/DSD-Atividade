import type { FastifyInstance } from "fastify";
import type { OrderService } from "../interfaces/order-service.js";
import type { CreateOrderInput } from "../types/order.js";

interface OrderParams {
  id: string;
}

const createOrderBodySchema = {
  type: "object",
  additionalProperties: false,
  required: ["items"],
  properties: {
    items: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["menuItemId", "quantity"],
        properties: {
          menuItemId: { type: "integer", minimum: 1 },
          quantity: { type: "integer", minimum: 1 },
        },
      },
    },
    observation: { type: "string" },
  },
} as const;

const orderParamsSchema = {
  type: "object",
  required: ["id"],
  properties: {
    id: { type: "string", pattern: "^[1-9][0-9]*$" },
  },
} as const;

export function registerOrderRoutes(
  app: FastifyInstance,
  orderService: OrderService,
) {
  app.post<{ Body: CreateOrderInput }>(
    "/orders",
    { schema: { body: createOrderBodySchema } },
    async (request, reply) => {
      const order = await orderService.createOrder(request.body);
      return reply.code(201).send(order);
    },
  );

  app.get("/orders", async () => orderService.listOrders());

  app.get<{ Params: OrderParams }>(
    "/orders/:id",
    { schema: { params: orderParamsSchema } },
    async (request, reply) => {
      const order = await orderService.getOrderById(Number(request.params.id));

      if (!order) {
        return reply.code(404).send({ message: "Order not found" });
      }

      return order;
    },
  );

  app.post<{ Params: OrderParams }>(
    "/orders/:id/cancel",
    { schema: { params: orderParamsSchema } },
    async (request) => orderService.cancelOrder(Number(request.params.id)),
  );
}
