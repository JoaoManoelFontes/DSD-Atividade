import Fastify from "fastify";
import { eq } from "drizzle-orm";
import { db, closeDatabase } from "./db/client.js";
import { menuItems } from "./db/schema.js";

interface MenuItemBody {
  name: string;
  description: string;
  price: number;
  available: boolean;
}

interface MenuItemParams {
  id: string;
}

const menuItemBodySchema = {
  type: "object",
  additionalProperties: false,
  required: ["name", "description", "price", "available"],
  properties: {
    name: { type: "string", minLength: 1 },
    description: { type: "string" },
    price: { type: "number", exclusiveMinimum: 0 },
    available: { type: "boolean" },
  },
} as const;

const menuItemParamsSchema = {
  type: "object",
  required: ["id"],
  properties: {
    id: { type: "string", pattern: "^[1-9][0-9]*$" },
  },
} as const;

function serializeMenuItem(item: typeof menuItems.$inferSelect) {
  return {
    ...item,
    price: Number(item.price),
  };
}

export function buildApp() {
  const app = Fastify({ logger: true });

  app.addHook("onClose", async () => {
    await closeDatabase();
  });

  app.get("/health", async () => ({
    status: "ok",
    service: "menu-service",
  }));

  app.post<{ Body: MenuItemBody }>(
    "/menu-items",
    { schema: { body: menuItemBodySchema } },
    async (request, reply) => {
      const [menuItem] = await db
        .insert(menuItems)
        .values({
          ...request.body,
          price: request.body.price.toFixed(2),
        })
        .returning();

      return reply.code(201).send(serializeMenuItem(menuItem));
    },
  );

  app.get("/menu-items", async () => {
    const items = await db.select().from(menuItems).orderBy(menuItems.id);
    return items.map(serializeMenuItem);
  });

  app.get<{ Params: MenuItemParams }>(
    "/menu-items/:id",
    { schema: { params: menuItemParamsSchema } },
    async (request, reply) => {
      const [menuItem] = await db
        .select()
        .from(menuItems)
        .where(eq(menuItems.id, Number(request.params.id)));

      if (!menuItem) {
        return reply.code(404).send({ message: "Menu item not found" });
      }

      return serializeMenuItem(menuItem);
    },
  );

  app.put<{ Params: MenuItemParams; Body: MenuItemBody }>(
    "/menu-items/:id",
    { schema: { params: menuItemParamsSchema, body: menuItemBodySchema } },
    async (request, reply) => {
      const [menuItem] = await db
        .update(menuItems)
        .set({
          ...request.body,
          price: request.body.price.toFixed(2),
        })
        .where(eq(menuItems.id, Number(request.params.id)))
        .returning();

      if (!menuItem) {
        return reply.code(404).send({ message: "Menu item not found" });
      }

      return serializeMenuItem(menuItem);
    },
  );

  app.delete<{ Params: MenuItemParams }>(
    "/menu-items/:id",
    { schema: { params: menuItemParamsSchema } },
    async (request, reply) => {
      const [menuItem] = await db
        .delete(menuItems)
        .where(eq(menuItems.id, Number(request.params.id)))
        .returning({ id: menuItems.id });

      if (!menuItem) {
        return reply.code(404).send({ message: "Menu item not found" });
      }

      return reply.code(204).send();
    },
  );

  return app;
}
