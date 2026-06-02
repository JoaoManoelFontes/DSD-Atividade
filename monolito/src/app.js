const Fastify = require('fastify');

const healthRoutes = require('./routes/health.routes');
const menuRoutes = require('./routes/menu.routes');
const ordersRoutes = require('./routes/orders.routes');
const paymentsRoutes = require('./routes/payments.routes');
const notificationsRoutes = require('./routes/notifications.routes');

async function buildApp() {
  const app = Fastify({
    logger: true,
  });

  app.setErrorHandler((error, request, reply) => {
    const statusCode = error.statusCode || 500;

    if (statusCode >= 500) {
      request.log.error(error);
    }

    reply.code(statusCode).send({
      error: statusCode >= 500 ? 'Internal Server Error' : error.message,
    });
  });

  await app.register(healthRoutes);
  await app.register(menuRoutes);
  await app.register(ordersRoutes);
  await app.register(paymentsRoutes);
  await app.register(notificationsRoutes);

  return app;
}

module.exports = buildApp;
