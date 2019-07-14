const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const User = require('../../models/user');
const hash = require('../../helpers/hash');
const Token = require('./token');
const error = require('../../helpers/error');

exports.search = (req, res, next) => {


};

exports.delete = (req, res, next) => {

	User
		.deleteOne({ _id: req.params.id })
		.then(result => res.json({ ok: !!result.n }) )
		.catch(next);
};

exports.getInfo = (req, res, next) => {

	User
		.findOne({ _id: req.params.id })
		.select('avatar lastActive nickname visible')
		.then(user => res.json({ ok: true, user: user }) )
		.catch(next);
};

exports.update = (req, res, next) => {

	User
		.findOne({ _id: req.params.id })
		.select('avatar email lastActive nickname password salt visible')
		.then(user => {

			if (user === null) throw error('User does not exist');

			for (let prop in req.body)
				user[prop] = req.body[prop];
			user.$locals.password = req.body.password || null;
			user.updatedAt = Date.now();

			return user.save();
		})
		.then(user => {

			res.json({
				user: {
					avatar: user.avatar,
					nickname: user.nickname,
					visible: user.visible,
				}
			});
		})
		.catch(next);
};

exports.list = (req, res, next) => {

	User
		.find()
		.select('nickname')
		.limit(20)
		.skip(parseInt(req.query.step) || 0)
		.then(users => {
			res.json({
				ok: true,
				count: users.length,
				users: users,
			});
		})
		.catch(next);
};

exports.login = (req, res, next) => {

	User
		.findOne({ email: req.body.email })
		.select('email nickname password salt role')
		.then(user => {

			if (user !== null) {

				const { password } = hash(req.body.password, user.salt);

				if (password === user.password) {

					const { token, refreshToken } = Token.create(user);

					return res.json({
						ok: true,
						token: token,
						refreshToken: refreshToken
					});
				}
			}

			return Promise.reject({
				errors: {
					email: {
						message: 'user does not exist',
						value: req.body.email
					}
				}
			});
		})
		.catch(next);
};

exports.register = (req, res, next) => {

	User
		.findOne({ email: req.body.email })
		.select('_id')
		.then(id => {

			if (id !== null)
				return Promise.reject({
					errors: {
						email: {
							message: 'user existed',
							value: req.body.email
						}
					}
				});

			const user = new User({
				_id: mongoose.Types.ObjectId(),
				email: req.body.email,
				nickname: req.body.nickname,
				password: req.body.password
			});
			user.$locals.password = req.body.password || null;

			return user.save();
		})
		.then(newUser => {

			const { token, refreshToken } = Token.create(newUser);

			res.status(201).json({
				ok: true,
				token: token,
				refreshToken: refreshToken,
			});
		})
		.catch(next);
};