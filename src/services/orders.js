const { getDb } = require('../db');

/**
 * Create a new order in the database
 * @param {Object} orderData - Order data
 * @param {number} orderData.userId - User ID
 * @param {Array<number>} orderData.productIds - Product IDs
 * @returns {Promise<Object>} - Created order
 */
async function createOrder(orderData) {
  const db = getDb();
  
  return new Promise((resolve, reject) => {
    const { userId, productIds } = orderData;
    
    db.run(
      'INSERT INTO orders (userId, productIds, status, createdAt) VALUES (?, ?, ?, CURRENT_DATE)',
      [userId, JSON.stringify(productIds), 'pending'],
      function(err) {
        if (err) {
          console.error('[DB] Error creating order:', err);
          return reject(err);
        }
        
        // Fetch the created order to return it
        db.get('SELECT * FROM orders WHERE id = ?', [this.lastID], (err, row) => {
          if (err) {
            console.error('[DB] Error fetching created order:', err);
            return reject(err);
          }
          
          // Parse productIds back to array
          row.productIds = JSON.parse(row.productIds);
          resolve(row);
        });
      }
    );
  });
}

/**
 * Get all orders
 * @returns {Promise<Array<Object>>} - Array of orders
 */
async function getAllOrders() {
  const db = getDb();
  
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM orders', (err, rows) => {
      if (err) {
        console.error('[DB] Error fetching orders:', err);
        return reject(err);
      }
      
      // Parse productIds back to array for each row
      const orders = rows.map(row => ({
        ...row,
        productIds: JSON.parse(row.productIds)
      }));
      resolve(orders);
    });
  });
}

/**
 * Get order by ID
 * @param {number} id - Order ID
 * @returns {Promise<Object|null>} - Order or null
 */
async function getOrderById(id) {
  const db = getDb();
  
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
      if (err) {
        console.error('[DB] Error fetching order:', err);
        return reject(err);
      }
      
      if (!row) {
        return resolve(null);
      }
      
      row.productIds = JSON.parse(row.productIds);
      resolve(row);
    });
  });
}

/**
 * Update order status
 * @param {number} id - Order ID
 * @param {string} status - New status
 * @returns {Promise<Object>} - Updated order
 */
async function updateOrderStatus(id, status) {
  const db = getDb();
  
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id],
      function(err) {
        if (err) {
          console.error('[DB] Error updating order status:', err);
          return reject(err);
        }
        
        if (this.changes === 0) {
          return resolve(null); // No order found
        }
        
        // Fetch the updated order
        db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
          if (err) {
            console.error('[DB] Error fetching updated order:', err);
            return reject(err);
          }
          
          row.productIds = JSON.parse(row.productIds);
          resolve(row);
        });
      }
    );
  });
}

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus
};
