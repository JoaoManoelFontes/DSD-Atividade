import type postgres from "postgres";
import { sql } from "../../../database/connection.js";
import type { Payment, PaymentStatus } from "../types/payment.js";

interface PaymentRow {
  id: number;
  order_id: number;
  amount: string;
  status: PaymentStatus;
  created_at: Date;
  paid_at: Date | null;
}

function toPayment(row: PaymentRow): Payment {
  return {
    id: row.id,
    orderId: row.order_id,
    amount: Number(row.amount),
    status: row.status,
    createdAt: row.created_at.toISOString(),
    paidAt: row.paid_at ? row.paid_at.toISOString() : null,
  };
}

export class PaymentRepository {
  constructor(private readonly database: postgres.Sql = sql) {}

  async createPending(orderId: number, amount: number): Promise<Payment> {
    const [row] = await this.database<PaymentRow[]>`
      INSERT INTO payments.payments (order_id, amount, status)
      VALUES (${orderId}, ${amount}, 'PENDING')
      RETURNING *
    `;

    return toPayment(row);
  }

  async updateStatus(id: number, status: PaymentStatus): Promise<Payment | null> {
    const paidAtValue = status === "APPROVED" ? this.database`now()` : null;
    const [row] = await this.database<PaymentRow[]>`
      UPDATE payments.payments
      SET status = ${status}, paid_at = ${paidAtValue}
      WHERE id = ${id}
      RETURNING *
    `;

    return row ? toPayment(row) : null;
  }

  async findById(id: number): Promise<Payment | null> {
    const [row] = await this.database<PaymentRow[]>`
      SELECT *
      FROM payments.payments
      WHERE id = ${id}
    `;

    return row ? toPayment(row) : null;
  }

  async findLatestByOrderId(orderId: number): Promise<Payment | null> {
    const [row] = await this.database<PaymentRow[]>`
      SELECT *
      FROM payments.payments
      WHERE order_id = ${orderId}
      ORDER BY id DESC
      LIMIT 1
    `;

    return row ? toPayment(row) : null;
  }
}
