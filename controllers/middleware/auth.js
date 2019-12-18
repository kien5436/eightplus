const Token = require('../api/token');
const error = require('../../helpers/error');

module.exports = async (req, res, next) => {

  let token = req.signedCookies.token;

  if (req.header('Authorization'))
    token = req.header('Authorization').split(' ')[1];

  try {
    if (!token) throw error('No token provided', { status: 401 });

    req.user = await Token.isValid(token);
    next();
  }
  catch (err) { next(err) }
};