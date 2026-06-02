const menuService = require('../modules/menu/menu.service');

async function menuRoutes(app) {
  app.post('/menu-items', async (request, reply) => {
    const item = await menuService.createMenuItem(request.body);
    return reply.code(201).send(item);
  });

  app.get('/menu-items', async () => menuService.listMenuItems());

  app.get('/menu-items/:id', async (request) =>
    menuService.getMenuItem(request.params.id)
  );

  app.put('/menu-items/:id', async (request) =>
    menuService.updateMenuItem(request.params.id, request.body)
  );

  app.delete('/menu-items/:id', async (request, reply) => {
    await menuService.deleteMenuItem(request.params.id);
    return reply.code(204).send();
  });
}

module.exports = menuRoutes;
