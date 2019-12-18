const router = require('express').Router();
const cookieParser = require('cookie-parser')(process.env.COOKIE_SECRET);

const { loginOrRegister, loadViewLogin, logout } = require('../../controllers/web/user');
const authWeb = require('../../controllers/middleware/auth-web');
const extractAssets = require('../../helpers/extract-assets');
const i18n = require('../../helpers/i18n');
const identify = require('../../controllers/middleware/identify');
const user = require('./user');

router
  .use('/user', user)
  .get(['/login', '/register'], [cookieParser, authWeb], loadViewLogin)
  .post(['/login', '/register'], cookieParser, loginOrRegister)
  .get('/logout', cookieParser, logout)
  .get('/t', [cookieParser, authWeb, identify], (req, res, next) => {

    const currentUser = req.user;
    const locale = req.cookies.locale || 'en';
    const assets = extractAssets(res, 'chat');
    const dict = i18n(locale, 'chat', 'aside');

    res.render('users/chat', { ...assets, dict, currentUser, activeRoute: 'chat' });
  })
  .get('/', [cookieParser, authWeb, identify], (req, res, next) => {

    const currentUser = req.user;
    const locale = req.cookies.locale || 'en';
    const assets = extractAssets(res, 'home');
    const dict = i18n(locale, 'home', 'aside');

    res.render('users/home', { ...assets, dict, currentUser, activeRoute: 'home' });
  })

module.exports = router;