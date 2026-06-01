require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 5434),
        user: process.env.DB_USER || 'monolito',
        password: process.env.DB_PASSWORD || 'monolito',
        database: process.env.DB_NAME || 'monolito_db',
      }
);

module.exports = {
  query(text, params) {
    return pool.query(text, params);
  },

  getClient() {
    return pool.connect();
  },

  close() {
    return pool.end();
  },
};
