const mongoose = require('mongoose');

const roomSchema = mongoose.Schema({

	_id: mongoose.ObjectId,
	name: {
		minlength: 1,
		trim: true,
		type: String,
	},
	users: [{
		_id: {
			ref: 'User._id',
			type: mongoose.ObjectId,
		},
		nickname: {
			ref: 'User.nickname',
			type: String,
		},
		role: {
			default: 'member',
			enum: ['admin', 'member'],
			type: String,
		},
	}]
});

roomSchema.index({ name: 'text' });

module.exports = mongoose.model('Room', roomSchema);