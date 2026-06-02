import type postgres from "postgres";
import { sql } from "../../../database/connection.js";
import type {
  Notification,
  NotificationStatus,
} from "../types/notification.js";

interface NotificationRow {
  id: number;
  order_id: number;
  status: NotificationStatus;
  created_at: Date;
}

function toNotification(row: NotificationRow): Notification {
  return {
    id: row.id,
    orderId: row.order_id,
    status: row.status,
    createdAt: row.created_at.toISOString(),
  };
}

export class NotificationRepository {
  constructor(private readonly database: postgres.Sql = sql) {}

  async create(orderId: number, status: NotificationStatus): Promise<Notification> {
    const [row] = await this.database<NotificationRow[]>`
      INSERT INTO notifications.notifications (order_id, status)
      VALUES (${orderId}, ${status})
      RETURNING *
    `;

    return toNotification(row);
  }

  async findAll(): Promise<Notification[]> {
    const rows = await this.database<NotificationRow[]>`
      SELECT *
      FROM notifications.notifications
      ORDER BY id
    `;

    return rows.map(toNotification);
  }

  async findById(id: number): Promise<Notification | null> {
    const [row] = await this.database<NotificationRow[]>`
      SELECT *
      FROM notifications.notifications
      WHERE id = ${id}
    `;

    return row ? toNotification(row) : null;
  }
}
