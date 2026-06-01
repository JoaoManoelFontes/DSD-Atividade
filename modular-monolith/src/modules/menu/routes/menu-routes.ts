import type { FastifyInstance } from "fastify";
import type { MenuService } from "../interfaces/menu-service.js";
import type { CreateMenuItemInput } from "../types/menu-item.js";

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

export function registerMenuRoutes(app: FastifyInstance, menuService: MenuService) {
  app.post<{ Body: CreateMenuItemInput }>(
    "/menu-items",
    { schema: { body: menuItemBodySchema } },
    async (request, reply) => {
      const menuItem = await menuService.createMenuItem(request.body);
      return reply.code(201).send(menuItem);
    },
  );

  app.get("/menu-items", async () => menuService.listMenuItems());

  app.get<{ Params: MenuItemParams }>(
    "/menu-items/:id",
    { schema: { params: menuItemParamsSchema } },
    async (request, reply) => {
      const menuItem = await menuService.getMenuItem(Number(request.params.id));

      if (!menuItem) {
        return reply.code(404).send({ message: "Menu item not found" });
      }

      return menuItem;
    },
  );

  app.put<{ Params: MenuItemParams; Body: CreateMenuItemInput }>(
    "/menu-items/:id",
    { schema: { params: menuItemParamsSchema, body: menuItemBodySchema } },
    async (request) =>
      menuService.updateMenuItem(Number(request.params.id), request.body),
  );

  app.delete<{ Params: MenuItemParams }>(
    "/menu-items/:id",
    { schema: { params: menuItemParamsSchema } },
    async (request, reply) => {
      await menuService.deleteMenuItem(Number(request.params.id));
      return reply.code(204).send();
    },
  );
}
