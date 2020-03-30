const router = require('express').Router();

const extractAssets = require('../../helpers/extract-assets');

router
  // .use('/user', user)
  // .get(['/login', '/register'], [cookieParser, authWeb], loadViewLogin)
  // .post(['/login', '/register'], cookieParser, loginOrRegister)
  // .get('/logout', cookieParser, logout)
  // .get('/t', [cookieParser, authWeb, identify], (req, res, next) => {

  //   const currentUser = req.user;
  //   const locale = req.cookies.locale || 'en';
  //   const assets = extractAssets(res, 'chat');
  //   const dict = i18n(locale, 'chat', 'aside');

  //   res.render('users/chat', { ...assets, dict, currentUser, activeRoute: 'chat' });
  // })
  .get('/', (req, res, next) => {

    const assets = extractAssets(res, 'index', 'vendors~index');

    res.render('index', assets);
  });

module.exports = router;