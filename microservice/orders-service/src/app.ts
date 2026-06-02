import Fastify from "fastify";
import { eq } from "drizzle-orm";
import { db, closeDatabase } from "./db/client.js";
import { orders } from "./db/schema.js";
import {
  getAvailableMenuItem,
  MenuItemValidationError,
  MenuServiceUnavailableError,
} from "./menu-client.js";
import { processPayment, PaymentsServiceError } from "./payments-client.js";

interface OrderBody {
  menuItemId: number;
  requestedBy: string;
  observation?: string | null;
}

interface OrderParams {
  id: string;
}

const orderBodySchema = {
  type: "object",
  additionalProperties: false,
  required: ["menuItemId", "requestedBy"],
  properties: {
    menuItemId: { type: "integer", minimum: 1 },
    requestedBy: { type: "string", minLength: 1, maxLength: 120 },
    observation: { type: ["string", "null"], maxLength: 500 },
  },
} as const;

const orderParamsSchema = {
  type: "object",
  required: ["id"],
  properties: {
    id: { type: "string", pattern: "^[1-9][0-9]*$" },
  },
} as const;

function serializeOrder(order: typeof orders.$inferSelect) {
  return {
    ...order,
    price: Number(order.price),
  };
}

function sendMenuError(
  error: unknown,
  reply: { code: (statusCode: number) => { send: (payload: object) => unknown } },
) {
  if (error instanceof MenuItemValidationError) {
    return reply.code(400).send({ message: error.message });
  }

  if (error instanceof MenuServiceUnavailableError) {
    return reply.code(503).send({ message: error.message });
  }

  throw error;
}

export function buildApp() {
  const app = Fastify({ logger: true });

  app.addHook("onClose", async () => {
    await closeDatabase();
  });

  app.get("/health", async () => ({
    status: "ok",
    service: "orders-service",
  }));

  app.post<{ Body: OrderBody }>(
    "/orders",
    { schema: { body: orderBodySchema } },
    async (request, reply) => {
      try {
        const menuItem = await getAvailableMenuItem(request.body.menuItemId);
        const [order] = await db
          .insert(orders)
          .values({
            menuItemId: menuItem.id,
            itemName: menuItem.name,
            price: menuItem.price.toFixed(2),
            requestedBy: request.body.requestedBy,
            observation: request.body.observation,
          })
          .returning();

        request.log.info({ orderId: order.id }, "Order created");

        try {
          await processPayment({
            orderId: order.id,
            amount: Number(order.price),
            observation: order.observation,
          });
        } catch (error) {
          if (error instanceof PaymentsServiceError) {
            request.log.error(
              { err: error, orderId: order.id },
              "Failed to request payment processing",
            );

            return reply.code(502).send({
              message: error.message,
              orderId: order.id,
            });
          }

          throw error;
        }

        return reply.code(201).send(serializeOrder(order));
      } catch (error) {
        return sendMenuError(error, reply);
      }
    },
  );

  app.get("/orders", async () => {
    const persistedOrders = await db.select().from(orders).orderBy(orders.id);
    return persistedOrders.map(serializeOrder);
  });

  app.get<{ Params: OrderParams }>(
    "/orders/:id",
    { schema: { params: orderParamsSchema } },
    async (request, reply) => {
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, Number(request.params.id)));

      if (!order) {
        return reply.code(404).send({ message: "Order not found" });
      }

      return serializeOrder(order);
    },
  );

  app.put<{ Params: OrderParams; Body: OrderBody }>(
    "/orders/:id",
    { schema: { params: orderParamsSchema, body: orderBodySchema } },
    async (request, reply) => {
      const [persistedOrder] = await db
        .select({ id: orders.id })
        .from(orders)
        .where(eq(orders.id, Number(request.params.id)));

      if (!persistedOrder) {
        return reply.code(404).send({ message: "Order not found" });
      }

      try {
        const menuItem = await getAvailableMenuItem(request.body.menuItemId);
        const [order] = await db
          .update(orders)
          .set({
            menuItemId: menuItem.id,
            itemName: menuItem.name,
            price: menuItem.price.toFixed(2),
            requestedBy: request.body.requestedBy,
            observation: request.body.observation ?? null,
            updatedAt: new Date(),
          })
          .where(eq(orders.id, Number(request.params.id)))
          .returning();

        request.log.info({ orderId: order.id }, "Order updated");

        return serializeOrder(order);
      } catch (error) {
        return sendMenuError(error, reply);
      }
    },
  );

  app.delete<{ Params: OrderParams }>(
    "/orders/:id",
    { schema: { params: orderParamsSchema } },
    async (request, reply) => {
      const [order] = await db
        .delete(orders)
        .where(eq(orders.id, Number(request.params.id)))
        .returning({ id: orders.id });

      if (!order) {
        return reply.code(404).send({ message: "Order not found" });
      }

      request.log.info({ orderId: order.id }, "Order deleted");

      return reply.code(204).send();
    },
  );

  return app;
}
