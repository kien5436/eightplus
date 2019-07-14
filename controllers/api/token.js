const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const Token = require('../../models/token');
const refreshTokenList = [];

/**
 * admin scopes: {
 * 	read: { user, current_user, message, token },
 *  	create: { user, message, token },
 *  	update: { user, current_user, token },
 *  	delete: { user, current_user, message, token }
 * }
 * mem scopes: {
 *		read: { current_user, message },
 *  	create: { message, token },
 *  	update: { current_user },
 *  	delete: { current_user, message }
 * }
 */

exports.isValid = (token) => {

	return new Promise((resolve, reject) => {

		jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {

			if (err) {

				err.status = 401;
				err.message = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid Token';
				return reject(err);
			}
			// check if token is in blacklist
			Token
				.findById(payload.jti)
				.select('_id')
				.then(token => {

					if (token !== null) {

						err.status = 401;
						err.message = 'Invalid token';
						reject(err);
					}
					else resolve(payload);
				});
		});
	});
};

/**
 *  	if (user is blocked) {
 *   		changeTokenScope() = removeAllTokens() + createLimitedToken()
 * 	}
 *
 * 	if (token expired) {
 *  		addToBlacklist(token)
 *  		return refresh()
 * 	}
 *
 * 	if (token in blacklist) then error(401)
 *
 *  	if (refreshToken is disabled || user logouts) {
 *  		delete it
 *  		removeAllTokens() // logout of current device
 * 	}
 */
exports.refresh = (req, res, next) => {

	if (!req.query.token || !req.query.refreshToken) {

		const err = new Error('Malformed token');
		err.status = 400;
		return next(err);
	}

	try {
		if (refreshTokenList.indexOf(req.query.refreshToken) < 0) {

			const err = new Error('Invalid token');
			err.status = 401;
			throw err;
		}
		const refreshPayload = jwt.verify(req.query.refreshToken, process.env.JWT_REFRESH_SECRET);
		const accessPayload = jwt.decode(req.query.token, process.env.JWT_SECRET);
		addToBlacklist(accessPayload);
		delete accessPayload.exp;
		delete accessPayload.iat;

		const payload = Object.assign({}, accessPayload);
		payload.jti = mongoose.Types.ObjectId();
		const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

		res.json({ token });
	}
	catch(err) {
		next(err);
	}
};

exports.create = (user) => {

	const token = createToken(user, 1);
	const refreshToken = createToken(user, 0);
	refreshTokenList.push(refreshToken);

	return { token, refreshToken };
};

function addToBlacklist(token) {

	(new Token({
		_id: token.jti,
		exp: token.exp
	})).save().catch(console.error);
};

/**
 * @param  {Object} user
 * @param  {Number} type [1: access token, 0: refresh token]
 * @return {String} token
 */
function createToken(user, type) {

	const payload = {
		jti: mongoose.Types.ObjectId(),
		uid: user._id,
	};
	const secret = (type === 0) ? process.env.JWT_REFRESH_SECRET : process.env.JWT_SECRET;
	const options = {};

	if (type > 0) {

		payload.nickname = user.nickname;

		switch (user.role) {
			case 'admin':
				payload.scopes = [
					'read:user',
					'read:current_user',
					'read:message',
					'read:token',
					'create:user',
					'create:message',
					'create:token',
					'update:user',
					'update:current_user',
					'update:token',
					'update:own_token',
					'delete:user',
					'delete:current_user',
					'delete:message',
					'delete:own_message',
					'delete:token',
				];
				break;
			case 'member':
				payload.scopes = [
					'read:current_user',
					'read:message',
					'create:message',
					'create:token',
					'update:current_user',
					'update:own_token',
					'delete:current_user',
					'delete:own_message',
				];
				break;
		}

		options.expiresIn = '1h';
	}

	return jwt.sign(payload, secret, options);
}