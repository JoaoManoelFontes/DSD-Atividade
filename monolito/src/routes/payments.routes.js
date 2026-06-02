const paymentsService = require('../modules/payments/payments.service');

async function paymentsRoutes(app) {
  app.post('/payments', async (request, reply) => {
    const result = await paymentsService.processPayment(request.body);
    return reply.code(201).send(result);
  });

  app.get('/payments/:id', async (request) =>
    paymentsService.getPayment(request.params.id)
  );

  app.get('/payments/order/:orderId', async (request) =>
    paymentsService.getPaymentByOrderId(request.params.orderId)
  );
}

module.exports = paymentsRoutes;
