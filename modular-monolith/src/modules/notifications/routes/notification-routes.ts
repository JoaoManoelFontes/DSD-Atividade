import type { FastifyInstance } from "fastify";
import type { NotificationService } from "../interfaces/notification-service.js";

interface NotificationParams {
  id: string;
}

const notificationParamsSchema = {
  type: "object",
  required: ["id"],
  properties: {
    id: { type: "string", pattern: "^[1-9][0-9]*$" },
  },
} as const;

export function registerNotificationRoutes(
  app: FastifyInstance,
  notificationService: NotificationService,
) {
  app.get("/notifications", async () =>
    notificationService.listNotifications(),
  );

  app.get<{ Params: NotificationParams }>(
    "/notifications/:id",
    { schema: { params: notificationParamsSchema } },
    async (request, reply) => {
      const notification = await notificationService.getNotificationById(
        Number(request.params.id),
      );

      if (!notification) {
        return reply.code(404).send({ message: "Notification not found" });
      }

      return notification;
    },
  );
}
