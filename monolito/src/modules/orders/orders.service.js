const database = require('../../database');
const menuService = require('../menu/menu.service');
const ordersRepository = require('./orders.repository');

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

function normalizeItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw httpError(400, 'O pedido deve possuir pelo menos um item.');
  }

  return items.map((item) => {
    const menuItemId = Number(item.menuItemId);
    const quantity = Number(item.quantity);

    if (!Number.isInteger(menuItemId) || menuItemId <= 0) {
      throw httpError(400, 'menuItemId invalido.');
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw httpError(400, 'quantity deve ser maior que zero.');
    }

    return {
      menuItemId,
      quantity,
    };
  });
}

async function createOrder(body) {
  if (!body || typeof body !== 'object') {
    throw httpError(400, 'Body do pedido e obrigatorio.');
  }

  const requestedItems = normalizeItems(body.items);
  const client = await database.getClient();

  try {
    await client.query('BEGIN');

    const items = [];
    let total = 0;

    for (const requestedItem of requestedItems) {
      const menuItem = await menuService.getMenuItem(requestedItem.menuItemId, client);

      if (!menuItem.available) {
        throw httpError(400, `Item ${menuItem.id} nao esta disponivel.`);
      }

      const unitPrice = Number(menuItem.price);
      const subtotal = unitPrice * requestedItem.quantity;
      total += subtotal;

      items.push({
        menuItemId: menuItem.id,
        quantity: requestedItem.quantity,
        unitPrice,
        subtotal,
      });
    }

    const order = await ordersRepository.create(
      {
        status: 'CREATED',
        total,
        observation: body.observation || null,
      },
      client
    );

    for (const item of items) {
      await ordersRepository.createItem(
        {
          orderId: order.id,
          ...item,
        },
        client
      );
    }

    const createdOrder = await ordersRepository.findById(order.id, client);

    await client.query('COMMIT');

    console.log(`[orders] Pedido ${createdOrder.id} criado.`);

    return createdOrder;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function listOrders() {
  return ordersRepository.findAll();
}

async function getOrder(id, db) {
  const order = await ordersRepository.findById(parseId(id), db);

  if (!order) {
    throw httpError(404, 'Pedido nao encontrado.');
  }

  return order;
}

async function getOrderBasic(id, db) {
  const order = await ordersRepository.findBasicById(parseId(id), db);

  if (!order) {
    throw httpError(404, 'Pedido nao encontrado.');
  }

  return order;
}

async function cancelOrder(id) {
  const parsedId = parseId(id);
  const order = await getOrderBasic(parsedId);

  if (order.status === 'PAID' || order.status === 'SENT_TO_KITCHEN') {
    throw httpError(409, 'Pedido pago ou enviado para cozinha nao pode ser cancelado.');
  }

  if (order.status === 'CANCELLED') {
    return getOrder(parsedId);
  }

  await ordersRepository.updateStatus(parsedId, 'CANCELLED');

  return getOrder(parsedId);
}

async function markAsPaid(id, db) {
  return ordersRepository.updateStatus(parseId(id), 'PAID', db);
}

async function markAsSentToKitchen(id, db) {
  const order = await ordersRepository.updateStatus(parseId(id), 'SENT_TO_KITCHEN', db);
  console.log(`[orders] Pedido ${order.id} enviado para cozinha.`);
  return order;
}

module.exports = {
  createOrder,
  listOrders,
  getOrder,
  getOrderBasic,
  cancelOrder,
  markAsPaid,
  markAsSentToKitchen,
};
