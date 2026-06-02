require('dotenv').config();

const buildApp = require('./app');
const database = require('./database');

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '0.0.0.0';

async function start() {
  const app = await buildApp();

  const shutdown = async () => {
    await app.close();
    await database.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  await app.listen({ port, host });
}

start().catch((error) => {
  console.error('Erro ao iniciar a aplicacao monolito:', error);
  process.exit(1);
});
