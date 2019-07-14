const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({

	_id: mongoose.ObjectId,
	created: {
		default: Date.now(),
		type: Number,
	},
	msg: {
		file: {
			default: null,
			type: String,
		},
		text: {
			default: null,
			trim: true,
			type: String,
		},
	},
	sender: {
		type: [{
			id: {
				ref: 'User._id',
				type: mongoose.ObjectId,
			},
			name: {
				ref: 'User.name',
				type: String,
			}
		}]
	},
});

module.exports = mongoose.model('Message', messageSchema);