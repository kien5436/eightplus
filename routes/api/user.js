const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const User = require('../../controllers/api/user');
const auth = require('../../controllers/middleware/auth');

/**
 *
 * verify request user is in db before do anything
 */
router
	.delete('/:id', User.delete)
	.get('/', User.list) // ?uid=user_id&step=skip_number
	.get('/:id', User.getInfo)
	.get('/search', User.search)
	.post('/login', User.login)
	.post('/register', User.register)
	.put('/:id', User.update)

module.exports = router;