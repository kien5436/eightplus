const mongoose = require('mongoose');

const tokenSchema = mongoose.Schema({

	_id: mongoose.ObjectId,
	exp: Number,
});

module.exports = mongoose.model('BlacklistedToken', tokenSchema);