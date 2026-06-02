const menuRepository = require('./menu.repository');

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

function normalizeMenuItem(body) {
  if (!body || typeof body !== 'object') {
    throw httpError(400, 'Body do item de cardapio e obrigatorio.');
  }

  if (!body.name || typeof body.name !== 'string') {
    throw httpError(400, 'Nome do item e obrigatorio.');
  }

  const price = Number(body.price);

  if (!Number.isFinite(price) || price <= 0) {
    throw httpError(400, 'Preco do item deve ser maior que zero.');
  }

  return {
    name: body.name.trim(),
    description: body.description || null,
    price,
    available:
      typeof body.available === 'boolean' ? body.available : true,
  };
}

async function createMenuItem(body) {
  return menuRepository.create(normalizeMenuItem(body));
}

async function listMenuItems() {
  return menuRepository.findAll();
}

async function getMenuItem(id, db) {
  const item = await menuRepository.findById(parseId(id), db);

  if (!item) {
    throw httpError(404, 'Item do cardapio nao encontrado.');
  }

  return item;
}

async function updateMenuItem(id, body) {
  const parsedId = parseId(id);
  await getMenuItem(parsedId);

  return menuRepository.update(parsedId, normalizeMenuItem(body));
}

async function deleteMenuItem(id) {
  const deleted = await menuRepository.remove(parseId(id));

  if (!deleted) {
    throw httpError(404, 'Item do cardapio nao encontrado.');
  }
}

module.exports = {
  createMenuItem,
  listMenuItems,
  getMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
