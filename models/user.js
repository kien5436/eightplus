const mongoose = require('mongoose');
const hash = require('../helpers/hash');

const userSchema = mongoose.Schema({

	_id: mongoose.ObjectId,
	avatar: String,
	blocked: {
		default: false,
		type: Boolean
	},
	blockList: [],
	email: {
		match: [/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/, 'Uh oh, seems {VALUE} is not an email'],
		required: [true, 'Why don\'t you provide your email?'],
		type: String,
	},
	lastActive: {
		default: 0,
		type: Number,
	},
	nickname: {
		minlength: 1,
		required: [true, 'What is your nickname?'],
		trim: true,
		type: String,
	},
	password: {
		minlength: [6, 'Password is too short'],
		required: [true, 'Password?'],
		type: String,
	},
	role: {
		default: 'member',
		enum: ['admin', 'member'],
		type: String,
	},
	salt: String,
	updatedAt: Number,
	visible: {
		default: true,
		type: Boolean,
	},
});

userSchema.index({ nickname: 'text' });

userSchema.pre('save', function(next) {

	if (this.$locals.password !== null) {

		const { password, salt } = hash(this.password);
		this.password = password;
		this.salt = salt;
	}
	next();
});

module.exports = mongoose.model('User', userSchema);