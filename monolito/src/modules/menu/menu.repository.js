const database = require('../../database');

function runner(db) {
  return db || database;
}

async function create(item, db) {
  const result = await runner(db).query(
    `INSERT INTO menu_items (name, description, price, available)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, description, price::float AS price, available, created_at, updated_at`,
    [item.name, item.description, item.price, item.available]
  );

  return result.rows[0];
}

async function findAll(db) {
  const result = await runner(db).query(
    `SELECT id, name, description, price::float AS price, available, created_at, updated_at
     FROM menu_items
     ORDER BY id`
  );

  return result.rows;
}

async function findById(id, db) {
  const result = await runner(db).query(
    `SELECT id, name, description, price::float AS price, available, created_at, updated_at
     FROM menu_items
     WHERE id = $1`,
    [id]
  );

  return result.rows[0];
}

async function update(id, item, db) {
  const result = await runner(db).query(
    `UPDATE menu_items
     SET name = $2,
         description = $3,
         price = $4,
         available = $5,
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, name, description, price::float AS price, available, created_at, updated_at`,
    [id, item.name, item.description, item.price, item.available]
  );

  return result.rows[0];
}

async function remove(id, db) {
  const result = await runner(db).query(
    `DELETE FROM menu_items
     WHERE id = $1
     RETURNING id`,
    [id]
  );

  return result.rows[0];
}

module.exports = {
  create,
  findAll,
  findById,
  update,
  remove,
};
