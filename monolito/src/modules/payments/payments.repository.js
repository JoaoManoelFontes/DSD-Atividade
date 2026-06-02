const database = require('../../database');

function runner(db) {
  return db || database;
}

async function create(payment, db) {
  const result = await runner(db).query(
    `INSERT INTO payments (order_id, amount, status, paid_at)
     VALUES ($1, $2, $3, NOW())
     RETURNING id,
               order_id AS "orderId",
               amount::float AS amount,
               status,
               created_at,
               paid_at`,
    [payment.orderId, payment.amount, payment.status]
  );

  return result.rows[0];
}

async function findById(id, db) {
  const result = await runner(db).query(
    `SELECT id,
            order_id AS "orderId",
            amount::float AS amount,
            status,
            created_at,
            paid_at
     FROM payments
     WHERE id = $1`,
    [id]
  );

  return result.rows[0];
}

async function findByOrderId(orderId, db) {
  const result = await runner(db).query(
    `SELECT id,
            order_id AS "orderId",
            amount::float AS amount,
            status,
            created_at,
            paid_at
     FROM payments
     WHERE order_id = $1
     ORDER BY id DESC
     LIMIT 1`,
    [orderId]
  );

  return result.rows[0];
}

module.exports = {
  create,
  findById,
  findByOrderId,
};
