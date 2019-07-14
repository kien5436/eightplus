const router = require('express').Router();

const User = require('../../controllers/web/user');

router
    .get('/login', User.loadViewLogin)

module.exports = router;