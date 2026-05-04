const { createOrder, getAllOrders, getOrderById, updateOrderStatus } = require('../../../src/services/orders');
const { initDb, closeDb, clearDb } = require('../../../src/db');

describe('Orders Service (SQLite)', () => {
  beforeAll(async () => {
    await initDb(':memory:');
    await require('../../../src/db').initTables();
    await clearDb();
  });

  afterAll(async () => {
    await closeDb();
  });

  beforeEach(async () => {
    await clearDb();
  });

  describe('createOrder', () => {
    it('should create and return a new order', async () => {
      const orderData = { userId: 1, productIds: [1, 2, 3] };
      const result = await createOrder(orderData);

      expect(result).toHaveProperty('id');
      expect(result.userId).toBe(orderData.userId);
      expect(result.productIds).toEqual(orderData.productIds);
      expect(result.status).toBe('pending');
      expect(result.createdAt).toBeDefined();
    });

    it('should store productIds as JSON string in database', async () => {
      const orderData = { userId: 1, productIds: [4, 5, 6] };
      const result = await createOrder(orderData);

      expect(Array.isArray(result.productIds)).toBe(true);
      expect(result.productIds).toEqual(orderData.productIds);
    });
  });

  describe('getAllOrders', () => {
    it('should return empty array when no orders exist', async () => {
      const result = await getAllOrders();
      expect(result).toEqual([]);
    });

    it('should return all orders from database', async () => {
      await createOrder({ userId: 1, productIds: [1] });
      await createOrder({ userId: 2, productIds: [2] });

      const result = await getAllOrders();
      expect(result.length).toBe(2);
    });

    it('should return orders with parsed productIds', async () => {
      await createOrder({ userId: 1, productIds: [1, 2] });

      const result = await getAllOrders();
      expect(Array.isArray(result[0].productIds)).toBe(true);
    });
  });

  describe('getOrderById', () => {
    it('should return order by ID', async () => {
      const created = await createOrder({ userId: 1, productIds: [1] });
      const result = await getOrderById(created.id);

      expect(result.id).toBe(created.id);
      expect(result.userId).toBe(1);
    });

    it('should return null for non-existent order', async () => {
      const result = await getOrderById(99999);
      expect(result).toBeNull();
    });

    it('should parse productIds from database', async () => {
      const created = await createOrder({ userId: 1, productIds: [1, 2] });
      const result = await getOrderById(created.id);

      expect(Array.isArray(result.productIds)).toBe(true);
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status', async () => {
      const created = await createOrder({ userId: 1, productIds: [1] });
      const result = await updateOrderStatus(created.id, 'shipped');

      expect(result.status).toBe('shipped');
    });

    it('should return null for non-existent order', async () => {
      const result = await updateOrderStatus(99999, 'shipped');
      expect(result).toBeNull();
    });

    it('should return updated order with parsed productIds', async () => {
      const created = await createOrder({ userId: 1, productIds: [1, 2] });
      const result = await updateOrderStatus(created.id, 'delivered');

      expect(Array.isArray(result.productIds)).toBe(true);
      expect(result.status).toBe('delivered');
    });

    it('should handle all valid statuses', async () => {
      const created = await createOrder({ userId: 1, productIds: [1] });
      
      for (const status of ['pending', 'shipped', 'delivered', 'cancelled']) {
        const result = await updateOrderStatus(created.id, status);
        expect(result.status).toBe(status);
      }
    });

    it('should return null when order not found for status update', async () => {
      const result = await updateOrderStatus(99999, 'shipped');
      expect(result).toBeNull();
    });
  });
});
