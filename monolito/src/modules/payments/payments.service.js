const database = require('../../database');
const notificationsService = require('../notifications/notifications.service');
const ordersService = require('../orders/orders.service');
const paymentsRepository = require('./payments.repository');

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function parseId(id) {
  const parsed = Number(id);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw httpError(400, 'Id invalido.');
  }

  return parsed;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function processPayment(body) {
  if (!body || typeof body !== 'object') {
    throw httpError(400, 'Body do pagamento e obrigatorio.');
  }

  const orderId = parseId(body.orderId);
  const order = await ordersService.getOrderBasic(orderId);

  if (order.status === 'CANCELLED') {
    throw httpError(409, 'Pedido cancelado nao pode ser pago.');
  }

  if (order.status !== 'CREATED') {
    throw httpError(409, 'Pedido ja foi pago ou enviado para cozinha.');
  }

  console.log(`[payments] Pagamento iniciado para o pedido ${order.id}.`);
  console.log('[payments] Simulacao de lentidao iniciada: aguardando 5 segundos.');
  await sleep(5000);

  const client = await database.getClient();

  try {
    await client.query('BEGIN');

    const currentOrder = await ordersService.getOrderBasic(orderId, client);

    if (currentOrder.status === 'CANCELLED') {
      throw httpError(409, 'Pedido cancelado nao pode ser pago.');
    }

    if (currentOrder.status !== 'CREATED') {
      throw httpError(409, 'Pedido ja foi pago ou enviado para cozinha.');
    }

    const payment = await paymentsRepository.create(
      {
        orderId: currentOrder.id,
        amount: currentOrder.total,
        status: 'APPROVED',
      },
      client
    );

    const paidOrder = await ordersService.markAsPaid(currentOrder.id, client);
    console.log(`[payments] Pagamento ${payment.id} aprovado.`);

    const notification = await notificationsService.notifyKitchen(paidOrder, client);
    const sentOrder = await ordersService.markAsSentToKitchen(currentOrder.id, client);

    await client.query('COMMIT');

    return {
      payment,
      order: sentOrder,
      notification,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function getPayment(id) {
  const payment = await paymentsRepository.findById(parseId(id));

  if (!payment) {
    throw httpError(404, 'Pagamento nao encontrado.');
  }

  return payment;
}

async function getPaymentByOrderId(orderId) {
  const payment = await paymentsRepository.findByOrderId(parseId(orderId));

  if (!payment) {
    throw httpError(404, 'Pagamento do pedido nao encontrado.');
  }

  return payment;
}

module.exports = {
  processPayment,
  getPayment,
  getPaymentByOrderId,
};
