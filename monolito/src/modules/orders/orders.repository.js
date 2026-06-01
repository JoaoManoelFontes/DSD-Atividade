const database = require('../../database');

function runner(db) {
  return db || database;
}

async function create(order, db) {
  const result = await runner(db).query(
    `INSERT INTO orders (status, total, observation)
     VALUES ($1, $2, $3)
     RETURNING id, status, total::float AS total, observation, created_at, updated_at`,
    [order.status, order.total, order.observation]
  );

  return result.rows[0];
}

async function createItem(item, db) {
  const result = await runner(db).query(
    `INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, subtotal)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id,
               order_id AS "orderId",
               menu_item_id AS "menuItemId",
               quantity,
               unit_price::float AS "unitPrice",
               subtotal::float AS subtotal`,
    [
      item.orderId,
      item.menuItemId,
      item.quantity,
      item.unitPrice,
      item.subtotal,
    ]
  );

  return result.rows[0];
}

async function findAll(db) {
  const result = await runner(db).query(
    `SELECT o.id,
            o.status,
            o.total::float AS total,
            o.observation,
            o.created_at,
            o.updated_at,
            COALESCE(
              json_agg(
                json_build_object(
                  'id', oi.id,
                  'menuItemId', oi.menu_item_id,
                  'name', mi.name,
                  'quantity', oi.quantity,
                  'unitPrice', oi.unit_price::float,
                  'subtotal', oi.subtotal::float
                )
                ORDER BY oi.id
              ) FILTER (WHERE oi.id IS NOT NULL),
              '[]'
            ) AS items
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.id
     LEFT JOIN menu_items mi ON mi.id = oi.menu_item_id
     GROUP BY o.id
     ORDER BY o.id DESC`
  );

  return result.rows;
}

async function findById(id, db) {
  const result = await runner(db).query(
    `SELECT o.id,
            o.status,
            o.total::float AS total,
            o.observation,
            o.created_at,
            o.updated_at,
            COALESCE(
              json_agg(
                json_build_object(
                  'id', oi.id,
                  'menuItemId', oi.menu_item_id,
                  'name', mi.name,
                  'quantity', oi.quantity,
                  'unitPrice', oi.unit_price::float,
                  'subtotal', oi.subtotal::float
                )
                ORDER BY oi.id
              ) FILTER (WHERE oi.id IS NOT NULL),
              '[]'
            ) AS items
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.id
     LEFT JOIN menu_items mi ON mi.id = oi.menu_item_id
     WHERE o.id = $1
     GROUP BY o.id`,
    [id]
  );

  return result.rows[0];
}

async function findBasicById(id, db) {
  const result = await runner(db).query(
    `SELECT id, status, total::float AS total, observation, created_at, updated_at
     FROM orders
     WHERE id = $1`,
    [id]
  );

  return result.rows[0];
}

async function updateStatus(id, status, db) {
  const result = await runner(db).query(
    `UPDATE orders
     SET status = $2,
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, status, total::float AS total, observation, created_at, updated_at`,
    [id, status]
  );

  return result.rows[0];
}

module.exports = {
  create,
  createItem,
  findAll,
  findById,
  findBasicById,
  updateStatus,
};
