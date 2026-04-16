const { createServer } = require('../src/index');

// Export a function to create a test server
module.exports = function createTestServer() {
  const app = createServer();
  return app.listen(0); // Use random available port
};