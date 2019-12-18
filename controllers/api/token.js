const jwt = require('jsonwebtoken');
const { Types } = require('mongoose');

const Token = require('../../models/token');
const error = require('../../helpers/error');

const blacklist = {};

const roles = {
  "user": {
    "read": [
      "messages",
      "public_user_info",
      "conversation_roles"
    ],
    "create": [
      "conversations",
      "messages",
      "conversation_roles",
      "contacts"
    ],
    "update": [
      "conversations",
      "user_info",
      "conversation_roles",
      "contacts",
      "token"
    ],
    "delete": [
      "user_info",
      "conversations",
      "messages",
      "conversation_roles",
      "contacts",
      "token"
    ]
  },
  "admin": {
    "read": [
      "messages",
      "public_user_info",
      "private_user_info",
      "conversation_roles"
    ],
    "create": [
      "conversations",
      "messages",
      "conversation_roles",
      "contacts"
    ],
    "update": [
      "conversations",
      "user_info",
      "conversation_roles",
      "contacts",
      "token"
    ],
    "delete": [
      "user_info",
      "conversations",
      "messages",
      "conversation_roles",
      "contacts",
      "token"
    ]
  }
};
const ACCESS_TOKEN = 1;
const REFRESH_TOKEN = 0;

exports.invalidate = (token) => {

  const payload = jwt.decode(token);
  blacklist[token] = payload.uid;
}

exports.isValid = (token) => {

  return new Promise((resolve, reject) => {

    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {

      // check if token is in blacklist
      if (err || (token in blacklist && blacklist[token] === payload.uid)) {

        return reject(error('Invalid token', { name: 'InvalidToken', status: 401 }));
      }
      else
        resolve({ id: payload.uid, scopes: payload.scopes });
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
  catch (err) {
    next(err);
  }
};

/**
 * @returns {<String>} access token
 */
exports.create = (user) => {

  const token = createToken(user, ACCESS_TOKEN);
  // const refreshToken = createToken(user, REFRESH_TOKEN);
  // const payload = jwt.decode(token);

  // try {
  //   await Token.updateOne({ userId: user._id }, {
  //     refreshToken: {
  //       [payload.jti]: refreshToken
  //     }
  //   }, { upsert: 1 });
  // }
  // catch (err) { return err }

  return token;
};

/**
 * @param  {Object} user
 * @param  {Number} type [1: access token, 0: refresh token]
 * @returns {String} token
 */
function createToken(user, type) {

  const secret = (type === 0) ? process.env.JWT_REFRESH_SECRET : process.env.JWT_SECRET;
  const payload = { uid: user._id, iss: user.iss, jti: new Types.ObjectId() };
  const options = {};

  if (type !== REFRESH_TOKEN) {

    switch (user.role) {
      case 'admin':
        payload.scopes = roles.admin;
        break;
      case 'user':
        payload.scopes = roles.user;
        break;
    }

    options.expiresIn = '1y';
  }

  return jwt.sign(payload, secret, options);
}