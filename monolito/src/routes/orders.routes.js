const ordersService = require('../modules/orders/orders.service');

async function ordersRoutes(app) {
  app.post('/orders', async (request, reply) => {
    const order = await ordersService.createOrder(request.body);
    return reply.code(201).send(order);
  });

  app.get('/orders', async () => ordersService.listOrders());

  app.get('/orders/:id', async (request) =>
    ordersService.getOrder(request.params.id)
  );

  app.post('/orders/:id/cancel', async (request) =>
    ordersService.cancelOrder(request.params.id)
  );
}

module.exports = ordersRoutes;
