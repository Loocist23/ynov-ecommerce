const request = require('supertest');
const { createServer } = require('../src/index');
const orders = require('../src/data/orders');

describe('Orders API', () => {
  let server;
  let app;

  beforeAll(() => {
    app = createServer();
    server = app.listen(0); // Use random available port
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('GET /api/orders', () => {
    it('should return all orders', async () => {
      const res = await request(app).get('/api/orders');
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should return simplified orders when FLAG_CICD is true', async () => {
      process.env.FLAG_CICD = 'true';
      const res = await request(app).get('/api/orders');
      expect(res.statusCode).toEqual(200);
      expect(res.body[0]).toEqual({ id: orders[0].id });
      delete process.env.FLAG_CICD;
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should return a single order', async () => {
      const orderId = orders[0].id;
      const res = await request(app).get(`/api/orders/${orderId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id', orderId);
    });

    it('should return simplified order when FLAG_CICD is true', async () => {
      process.env.FLAG_CICD = 'true';
      const orderId = orders[0].id;
      const res = await request(app).get(`/api/orders/${orderId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({ id: orderId });
      delete process.env.FLAG_CICD;
    });

    it('should return 404 for non-existent order', async () => {
      const res = await request(app).get('/api/orders/999');
      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error', 'Order not found');
    });
  });

  describe('POST /api/orders', () => {
    it('should create a new order', async () => {
      const newOrder = {
        userId: 1,
        productIds: [1, 2, 3]
      };
      const res = await request(app)
        .post('/api/orders')
        .send(newOrder);
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.userId).toEqual(newOrder.userId);
      expect(res.body.productIds).toEqual(newOrder.productIds);
    });

    it('should return 400 when userId and productIds are missing', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({});
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'userId and productIds[] are required');
    });
  });

  describe('PATCH /api/orders/:id/status', () => {
    it('should update order status', async () => {
      const orderId = orders[0].id;
      const res = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: 'shipped' });
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('shipped');
    });

    it('should return 400 for invalid status', async () => {
      const orderId = orders[0].id;
      const res = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: 'invalid' });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent order', async () => {
      const res = await request(app)
        .patch('/api/orders/999/status')
        .send({ status: 'shipped' });
      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error', 'Order not found');
    });
  });
});