const Token = require('../api/token');

module.exports = async (req, res, next) => {

  const destinations = ['/login', '/register'];

  try {
    const { token } = req.signedCookies;
    await Token.isValid(token);

    if (destinations.includes(req.originalUrl)) res.redirect('back');
    else next();
  }
  catch (err) {

    // console.log(err);
    if (destinations.includes(req.originalUrl)) next();
    else {
      res.cookie('referer', req.originalUrl, { signed: 1, httpOnly: 1 });
      res.redirect('/login');
    }
  }
};