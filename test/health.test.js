const request = require('supertest');
const { createServer } = require('../src/index');

describe('Health Check', () => {
  let server;
  let app;

  beforeAll(() => {
    app = createServer();
    server = app.listen(0); // Use random available port
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('timestamp');
    });
  });
});