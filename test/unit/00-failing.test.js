const request = require('supertest');
const { createIntegrationServer, closeIntegrationServer } = require('../../src/index.integration');

describe('First tests - Failing test at position 2', () => {
  let server;
  let app;

  beforeAll(async () => {
    app = await createIntegrationServer(true);
    server = app.listen(0);
  });

  afterAll(async () => {
    await closeIntegrationServer(server);
  });

  it('should pass - first test', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ userId: 1, productIds: [1, 2, 3] });
    expect(res.statusCode).toBe(201);
  });

  // it('should fail - this is an intentional failing test', async () => {
  //   const res = await request(app)
  //     .post('/api/orders')
  //     .send({ userId: 1, productIds: [1] });
  //   expect(res.body.status).toBe('shipped'); // ❌ FAIL
  // });
});
