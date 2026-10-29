// Recognized Express entry for Vercel; reuse the existing app and every API route.
require('express');
module.exports = require('./server/index');
