const request = require('supertest');
const { createServer } = require('../src/index');
const users = require('../src/data/users');

describe('Users API', () => {
  let server;
  let app;

  beforeAll(() => {
    app = createServer();
    server = app.listen(0); // Use random available port
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('GET /api/users', () => {
    it('should return all users', async () => {
      const res = await request(app).get('/api/users');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveLength(users.length);
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('name');
      expect(res.body[0]).toHaveProperty('email');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return a single user', async () => {
      const userId = users[0].id;
      const res = await request(app).get(`/api/users/${userId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id', userId);
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app).get('/api/users/999');
      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error', 'User not found');
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const newUser = {
        name: 'Test User',
        email: 'test@example.com'
      };
      const res = await request(app)
        .post('/api/users')
        .send(newUser);
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toEqual(newUser.name);
      expect(res.body.email).toEqual(newUser.email);
      expect(res.body.role).toEqual('customer');
    });

    it('should return 400 when name and email are missing', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({});
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'name and email are required');
    });
  });
});