import {
  integer,
  numeric,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  menuItemId: integer("menu_item_id").notNull(),
  itemName: varchar("item_name", { length: 120 }).notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  requestedBy: varchar("requested_by", { length: 120 }).notNull(),
  paymentStatus: varchar("payment_status", { length: 30 })
    .notNull()
    .default("PENDING"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
