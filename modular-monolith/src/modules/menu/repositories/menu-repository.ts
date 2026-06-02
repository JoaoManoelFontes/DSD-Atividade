import type postgres from "postgres";
import { sql } from "../../../database/connection.js";
import type {
  CreateMenuItemInput,
  MenuItem,
  UpdateMenuItemInput,
} from "../types/menu-item.js";

interface MenuItemRow {
  id: number;
  name: string;
  description: string;
  price: string;
  available: boolean;
  created_at: Date;
  updated_at: Date;
}

function toMenuItem(row: MenuItemRow): MenuItem {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    available: row.available,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export class MenuRepository {
  constructor(private readonly database: postgres.Sql = sql) {}

  async create(input: CreateMenuItemInput): Promise<MenuItem> {
    const [row] = await this.database<MenuItemRow[]>`
      INSERT INTO menu.menu_items (name, description, price, available)
      VALUES (${input.name}, ${input.description}, ${input.price}, ${input.available})
      RETURNING *
    `;

    return toMenuItem(row);
  }

  async findAll(): Promise<MenuItem[]> {
    const rows = await this.database<MenuItemRow[]>`
      SELECT *
      FROM menu.menu_items
      ORDER BY id
    `;

    return rows.map(toMenuItem);
  }

  async findById(id: number): Promise<MenuItem | null> {
    const [row] = await this.database<MenuItemRow[]>`
      SELECT *
      FROM menu.menu_items
      WHERE id = ${id}
    `;

    return row ? toMenuItem(row) : null;
  }

  async findAvailableByIds(ids: number[]): Promise<MenuItem[]> {
    if (ids.length === 0) {
      return [];
    }

    const rows = await this.database<MenuItemRow[]>`
      SELECT *
      FROM menu.menu_items
      WHERE id = ANY(${ids}) AND available = TRUE
      ORDER BY id
    `;

    return rows.map(toMenuItem);
  }

  async update(id: number, input: UpdateMenuItemInput): Promise<MenuItem | null> {
    const [row] = await this.database<MenuItemRow[]>`
      UPDATE menu.menu_items
      SET
        name = ${input.name},
        description = ${input.description},
        price = ${input.price},
        available = ${input.available},
        updated_at = now()
      WHERE id = ${id}
      RETURNING *
    `;

    return row ? toMenuItem(row) : null;
  }

  async delete(id: number): Promise<boolean> {
    const [row] = await this.database<{ id: number }[]>`
      DELETE FROM menu.menu_items
      WHERE id = ${id}
      RETURNING id
    `;

    return Boolean(row);
  }
}
