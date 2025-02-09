// api/index.js
const app = require('../app');

// Vercel will call this exported function on every request.
module.exports = (req, res) => {
  return app(req, res);
};
