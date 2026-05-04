const express = require('express');
const { initDb, initTables, clearDb, closeDb } = require('./db');
const ordersService = require('./services/orders');
const { sendOrderConfirmation } = require('./services/email');

/**
 * Create Express server with SQLite integration
 * @param {boolean} clearOnStart - Clear database on startup
 * @returns {Promise<express.Application>}
 */
async function createIntegrationServer(clearOnStart = true) {
  // Initialize database
  await initDb(':memory:');
  await initTables();
  
  if (clearOnStart) {
    await clearDb();
  }

  const app = express();

  app.use(express.json());

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Orders routes - Integration version
  app.get('/api/orders', async (req, res) => {
    try {
      const orders = await ordersService.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error('[API] Error fetching orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  });

  app.get('/api/orders/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await ordersService.getOrderById(id);
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      res.json(order);
    } catch (error) {
      console.error('[API] Error fetching order:', error);
      res.status(500).json({ error: 'Failed to fetch order' });
    }
  });

  app.post('/api/orders', async (req, res) => {
    try {
      const { userId, productIds } = req.body;
      
      if (!userId || !productIds || !Array.isArray(productIds)) {
        return res.status(400).json({ error: 'userId and productIds[] are required' });
      }

      const newOrder = await ordersService.createOrder({ userId, productIds });
      
      // Send confirmation email (fire and forget)
      try {
        await sendOrderConfirmation(newOrder);
      } catch (error) {
        console.error('[Email] Failed to send confirmation email:', error);
      }

      res.status(201).json(newOrder);
    } catch (error) {
      console.error('[API] Error creating order:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  });

  app.patch('/api/orders/:id/status', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      const validStatuses = ['pending', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
      }

      const order = await ordersService.updateOrderStatus(id, status);
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      res.json(order);
    } catch (error) {
      console.error('[API] Error updating order status:', error);
      res.status(500).json({ error: 'Failed to update order status' });
    }
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  return app;
}

/**
 * Close database connection and server
 * @param {import('http').Server} server - Express server instance
 * @returns {Promise<void>}
 */
async function closeIntegrationServer(server) {
  await closeDb();
  return new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}

module.exports = { createIntegrationServer, closeIntegrationServer };
