const notificationsRepository = require('./notifications.repository');

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

async function notifyKitchen(order, db) {
  const notification = await notificationsRepository.create(
    {
      orderId: order.id,
      status: 'SENT',
      message: `Pedido ${order.id} liberado para preparo na cozinha.`,
    },
    db
  );

  console.log(`[notifications] Cozinha notificada sobre o pedido ${order.id}.`);

  return notification;
}

async function listNotifications() {
  return notificationsRepository.findAll();
}

async function getNotification(id) {
  const notification = await notificationsRepository.findById(parseId(id));

  if (!notification) {
    throw httpError(404, 'Notificacao nao encontrada.');
  }

  return notification;
}

module.exports = {
  notifyKitchen,
  listNotifications,
  getNotification,
};
