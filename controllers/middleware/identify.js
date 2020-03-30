const Token = require('../api/token');

module.exports = async (req, res, next) => {

  try {
    const { token } = req.signedCookies;
    req.user = await Token.isValid(token);
  }
  catch (err) { req.user = { id: null, scopes: null } }
  finally { next() }
};