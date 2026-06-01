import type postgres from "postgres";
import { sql } from "../../../database/connection.js";
import type { Order, OrderItemSnapshot, OrderStatus } from "../types/order.js";

interface OrderRow {
  id: number;
  items: unknown;
  status: OrderStatus;
  total: string;
  observation: string | null;
  created_at: Date;
  updated_at: Date;
}

interface CreateOrderRecord {
  items: OrderItemSnapshot[];
  status: OrderStatus;
  total: number;
  observation?: string;
}

function parseItems(items: unknown): OrderItemSnapshot[] {
  if (Array.isArray(items)) {
    return items as OrderItemSnapshot[];
  }

  return JSON.parse(String(items)) as OrderItemSnapshot[];
}

function toOrder(row: OrderRow): Order {
  return {
    id: row.id,
    items: parseItems(row.items),
    status: row.status,
    total: Number(row.total),
    observation: row.observation,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export class OrderRepository {
  constructor(private readonly database: postgres.Sql = sql) {}

  async create(input: CreateOrderRecord): Promise<Order> {
    const [row] = await this.database<OrderRow[]>`
      INSERT INTO orders.orders (items, status, total, observation)
      VALUES (
        ${this.database.json(input.items)},
        ${input.status},
        ${input.total},
        ${input.observation ?? null}
      )
      RETURNING *
    `;

    return toOrder(row);
  }

  async findAll(): Promise<Order[]> {
    const rows = await this.database<OrderRow[]>`
      SELECT *
      FROM orders.orders
      ORDER BY id
    `;

    return rows.map(toOrder);
  }

  async findById(id: number): Promise<Order | null> {
    const [row] = await this.database<OrderRow[]>`
      SELECT *
      FROM orders.orders
      WHERE id = ${id}
    `;

    return row ? toOrder(row) : null;
  }

  async updateStatus(id: number, status: OrderStatus): Promise<Order | null> {
    const [row] = await this.database<OrderRow[]>`
      UPDATE orders.orders
      SET status = ${status}, updated_at = now()
      WHERE id = ${id}
      RETURNING *
    `;

    return row ? toOrder(row) : null;
  }
}
