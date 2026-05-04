const request = require('supertest');
const { createIntegrationServer, closeIntegrationServer } = require('../../src/index.integration');
const { sendOrderConfirmation } = require('../../src/services/email');

// Mock the email service for integration tests
jest.mock('../../src/services/email', () => ({
  sendOrderConfirmation: jest.fn().mockResolvedValue({ success: true })
}));

describe('Orders Integration Tests (SQLite)', () => {
  let server;
  let app;

  beforeAll(async () => {
    app = await createIntegrationServer(true);
    server = app.listen(0);
  });

  afterAll(async () => {
    await closeIntegrationServer(server);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/orders', () => {
    it('should create order in database and return it', async () => {
      const newOrder = { userId: 1, productIds: [1, 2, 3] };
      
      const res = await request(app)
        .post('/api/orders')
        .send(newOrder);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.userId).toBe(newOrder.userId);
      expect(res.body.productIds).toEqual(newOrder.productIds);
      expect(res.body.status).toBe('pending');
      expect(res.body.createdAt).toBeDefined();
    });

    it('should persist order in database', async () => {
      const newOrder = { userId: 2, productIds: [4, 5] };
      
      // Create order
      const createRes = await request(app)
        .post('/api/orders')
        .send(newOrder);
      
      const orderId = createRes.body.id;

      // Retrieve it
      const getRes = await request(app)
        .get(`/api/orders/${orderId}`);

      expect(getRes.statusCode).toBe(200);
      expect(getRes.body.id).toBe(orderId);
      expect(getRes.body.userId).toBe(newOrder.userId);
    });

    it('should send confirmation email on order creation', async () => {
      const newOrder = { userId: 3, productIds: [6, 7] };
      
      await request(app)
        .post('/api/orders')
        .send(newOrder);

      expect(sendOrderConfirmation).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: newOrder.userId,
          productIds: newOrder.productIds
        })
      );
    });

    it('should return 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/orders', () => {
    it('should return empty array when no orders exist', async () => {
      const res = await request(app)
        .get('/api/orders');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should return all orders from database', async () => {
      // Create some orders first
      await request(app).post('/api/orders').send({ userId: 1, productIds: [1] });
      await request(app).post('/api/orders').send({ userId: 2, productIds: [2] });

      const res = await request(app)
        .get('/api/orders');

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should return a specific order by ID', async () => {
      // Create an order
      const createRes = await request(app)
        .post('/api/orders')
        .send({ userId: 1, productIds: [1] });
      
      const orderId = createRes.body.id;

      // Get it by ID
      const res = await request(app)
        .get(`/api/orders/${orderId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(orderId);
    });

    it('should return 404 for non-existent order', async () => {
      const res = await request(app)
        .get('/api/orders/99999');

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Order not found');
    });
  });

  describe('PATCH /api/orders/:id/status', () => {
    it('should update order status', async () => {
      // Create an order
      const createRes = await request(app)
        .post('/api/orders')
        .send({ userId: 1, productIds: [1] });
      
      const orderId = createRes.body.id;

      // Update status
      const res = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: 'shipped' });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('shipped');
    });

    it('should return 404 for non-existent order', async () => {
      const res = await request(app)
        .patch('/api/orders/99999/status')
        .send({ status: 'shipped' });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Order not found');
    });

    it('should return 400 for invalid status', async () => {
      // Create an order
      const createRes = await request(app)
        .post('/api/orders')
        .send({ userId: 1, productIds: [1] });
      
      const orderId = createRes.body.id;

      const res = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: 'invalid_status' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  // ============================================
  // ❌ TEST QUI ECHOUE VOLONTAIREMENT (pour démonstration)
  // ============================================
  describe('Failing test example', () => {
    it('should fail - this is an intentional failing test', async () => {
      // Ce test est volontairement faux pour montrer un échec
      const res = await request(app)
        .post('/api/orders')
        .send({ userId: 1, productIds: [1] });

      // Attente : le statut devrait être 'pending', mais on vérifie 'shipped'
      // → Ce test va ÉCHOUER
      expect(res.body.status).toBe('shipped'); // ❌ MAUVAIS : c'est 'pending' !
    });
  });
});
