const notificationsService = require('../modules/notifications/notifications.service');

async function notificationsRoutes(app) {
  app.get('/notifications', async () => notificationsService.listNotifications());

  app.get('/notifications/:id', async (request) =>
    notificationsService.getNotification(request.params.id)
  );
}

module.exports = notificationsRoutes;
