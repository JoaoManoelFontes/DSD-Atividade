import type postgres from "postgres";

export async function runInitialMigration(sql: postgres.Sql) {
  await sql.begin(async (transaction) => {
    await transaction`CREATE SCHEMA IF NOT EXISTS menu`;
    await transaction`CREATE SCHEMA IF NOT EXISTS orders`;
    await transaction`CREATE SCHEMA IF NOT EXISTS payments`;
    await transaction`CREATE SCHEMA IF NOT EXISTS notifications`;

    await transaction`
      CREATE TABLE IF NOT EXISTS menu.menu_items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(120) NOT NULL UNIQUE,
        description TEXT NOT NULL,
        price NUMERIC(10, 2) NOT NULL CHECK (price > 0),
        available BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;

    await transaction`
      CREATE TABLE IF NOT EXISTS orders.orders (
        id SERIAL PRIMARY KEY,
        items JSONB NOT NULL,
        status VARCHAR(30) NOT NULL CHECK (
          status IN (
            'CREATED',
            'PENDING_PAYMENT',
            'PAID',
            'SENT_TO_KITCHEN',
            'CANCELLED'
          )
        ),
        total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
        observation TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;

    await transaction`
      CREATE TABLE IF NOT EXISTS payments.payments (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL,
        amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
        status VARCHAR(20) NOT NULL CHECK (
          status IN ('PENDING', 'APPROVED', 'REJECTED')
        ),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        paid_at TIMESTAMPTZ
      )
    `;

    await transaction`
      CREATE INDEX IF NOT EXISTS payments_order_id_idx
      ON payments.payments (order_id)
    `;

    await transaction`
      CREATE TABLE IF NOT EXISTS notifications.notifications (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL,
        status VARCHAR(60) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;

    await transaction`
      CREATE INDEX IF NOT EXISTS notifications_order_id_idx
      ON notifications.notifications (order_id)
    `;
  });
}
