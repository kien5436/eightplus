const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Token = require('../../controllers/api/token');

router
	.post('/', Token.refresh)

module.exports = router;