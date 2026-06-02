async function healthRoutes(app) {
  app.get('/health', async () => ({
    status: 'ok',
    architecture: 'monolito',
  }));
}

module.exports = healthRoutes;
