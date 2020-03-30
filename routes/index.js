const router = require('express').Router();

const error = require('../helpers/error');
const api = require('./api');
const web = require('./web');

router
  // CORS: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
  .use((req, res, next) => {

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    // accepted requests
    if (req.method === 'OPTIONS') {

      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
      return res.status(200).json({});
    }
    next();
  })
  .use('/api/v1', api)
  .use('*', web);

module.exports = router;