const express = require('express');

const productsRouter = require('./routes/products');
const ordersRouter = require('./routes/orders');
const usersRouter = require('./routes/users');

function createServer() {
  const app = express();

  app.use(express.json());

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Routes
  app.use('/api/products', productsRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/users', usersRouter);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  return app;
}

// Start server if this file is run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  const app = createServer();
  app.listen(PORT, () => {
    console.log(`ecommerce-api running on http://localhost:${PORT}`);
  });
}

module.exports = { createServer };
