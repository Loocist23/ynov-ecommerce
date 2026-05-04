/**
 * Email service for sending order confirmation emails
 */

/**
 * Sends an order confirmation email
 * @param {Object} order - The order object
 * @param {number} order.id - Order ID
 * @param {number} order.userId - User ID
 * @param {Array<number>} order.productIds - Product IDs
 * @param {string} order.status - Order status
 * @returns {Promise<Object>} - Resolves with email send result
 */
async function sendOrderConfirmation(order) {
  // In a real application, this would connect to an email service
  // (e.g., SendGrid, Nodemailer, Mailgun, etc.)
  
  console.log(`[Email] Sending confirmation for order #${order.id} to user #${order.userId}`);
  console.log(`[Email] Products: ${order.productIds.join(', ')}`);
  console.log(`[Email] Status: ${order.status}`);
  
  // Simulate async email sending
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    success: true,
    orderId: order.id,
    message: 'Order confirmation email sent successfully'
  };
}

module.exports = { sendOrderConfirmation };
