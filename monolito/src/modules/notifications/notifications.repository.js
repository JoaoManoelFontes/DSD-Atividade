const database = require('../../database');

function runner(db) {
  return db || database;
}

async function create(notification, db) {
  const result = await runner(db).query(
    `INSERT INTO notifications (order_id, status, message)
     VALUES ($1, $2, $3)
     RETURNING id,
               order_id AS "orderId",
               status,
               message,
               created_at`,
    [notification.orderId, notification.status, notification.message]
  );

  return result.rows[0];
}

async function findAll(db) {
  const result = await runner(db).query(
    `SELECT id,
            order_id AS "orderId",
            status,
            message,
            created_at
     FROM notifications
     ORDER BY id DESC`
  );

  return result.rows;
}

async function findById(id, db) {
  const result = await runner(db).query(
    `SELECT id,
            order_id AS "orderId",
            status,
            message,
            created_at
     FROM notifications
     WHERE id = $1`,
    [id]
  );

  return result.rows[0];
}

module.exports = {
  create,
  findAll,
  findById,
};
