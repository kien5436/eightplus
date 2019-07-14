const router = require('express').Router();

const user = require('./public');

router
    .use('/', user)

module.exports = router;