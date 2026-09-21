const serverless = require('serverless-http');
const app = require('../Backend/app');

module.exports = serverless(app);
