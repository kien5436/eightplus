const { Types } = require('mongoose');

const User = require('../../models/user');
const Token = require('../api/token');
const hash = require('../../helpers/hash');
const error = require('../../helpers/error');
const extractAssets = require('../../helpers/extract-assets');
const i18n = require('../../helpers/i18n');
const formatDate = require('../../helpers/format-date');
const show404 = require('../../helpers/404');

const rootUrl = `${process.env.HOST}:${process.env.PORT}/files`;

exports.loadProfile = async (req, res, next) => {

  const activeRoute = 'profile';
  const assets = extractAssets(res, 'profile', 'home~login-register~profile');
  const currentUser = req.user;
  const locale = req.cookies.locale || 'en';
  const dict = i18n(locale, 'profile', 'aside');

  try {
    if (!Types.ObjectId.isValid(req.params.id) && !/^[a-z0-9@]+$/i.test(req.params.id)) {

      show404({ dict, locale, currentUser, activeRoute }, res);
      return;
    }

    const cond = Types.ObjectId.isValid(req.params.id) ? { _id: req.params.id } : { aliasId: req.params.id };
    const user = await User.findOne(cond)
      .select('aliasId avatar dob email phone name sex metaData isOnline isDeleted').lean();

    if (null === user) {

      show404({ dict, locale, currentUser, activeRoute }, res);
      return;
    }

    for (const size in user.avatar) user.avatar[size] = rootUrl + user.avatar[size];
    user.dob = formatDate(locale, user.dob);
    dict[activeRoute]['title'] = user.name;

    if (currentUser.id != user._id) {

      const hidden = user.metaData.hidden;

      for (const field in user) {

        if (hidden.includes(field)) user[field] = 'hidden';
      }
    }

    res.render('users/profile', { ...assets, dict, user, currentUser, activeRoute });
  }
  catch (err) { next(err) }
};

exports.logout = (req, res, next) => {

  const token = req.signedCookies['token'];

  Token.invalidate(token);
  res.clearCookie('token', { signed: 1, httpOnly: 1 });
  res.clearCookie('uid');
  res.redirect('/login');
};

exports.loadViewLogin = (req, res, next) => {

  const isRegister = req.originalUrl === '/register';
  const assets = extractAssets(res, 'login-register', 'home~login-register~profile', 'vendors~login-register', 'vendors~login-register~profile');
  const locale = req.cookies.locale || 'en';
  const dict = i18n(locale, isRegister ? 'register' : 'login');

  res.render('users/login-register', { ...assets, isRegister, dict });
};

exports.loginOrRegister = (req, res, next) => {

  if ('/register' === req.originalUrl) register(req, res, next);
  else login(req, res, next);
};

async function login(req, res, next) {

  const { email, password } = req.body;

  try {
    const user = await User
      .findOne({ $or: [{ email: email }, { phone: email }] })
      .select('password salt role metaData').lean();

    if (null !== user) {

      const { password: hashedPassword } = hash(password, user.salt);

      if (hashedPassword === user.password) {

        user.iss = req.protocol + '://' + req.hostname.protocol + '://' + req.hostname;

        const token = Token.create(user);
        const referer = req.signedCookies['referer'] || '/';
        res.cookie('dark_mode', 'true' === user.metaData.darkMode);
        res.cookie('locale', user.metaData.locale);
        res.cookie('uid', user._id.toString());
        res.cookie('token', token, { signed: 1, httpOnly: 1 });
        res.clearCookie('referer', { signed: 1, httpOnly: 1 });
        res.status(200).json({
          ok: true,
          next: referer
        });

        return;
      }
    }

    throw error('', {
      status: 400,
      errors: [{
        field: 'email',
        message: 'user unexisted',
        value: email
      }]
    });
  }
  catch (err) { next(err) }
}

async function register(req, res, next) {

  const { name, password } = req.body;

  try {
    const firstLetter = name.substring(0, 1).toUpperCase();

    const user = new User(Object.assign({}, {
      avatar: {
        'x32': `/images/avatars/default/_${firstLetter}x32.png`,
        'x64': `/images/avatars/default/_${firstLetter}x64.png`,
        'x96': `/images/avatars/default/_${firstLetter}x96.png`,
        'x128': `/images/avatars/default/_${firstLetter}x128.png`,
      },
      metaData: {
        'locale': 'en',
        'hidden': ['email', 'phone'],
      }
    }, req.body));
    user.$locals.password = password || null;

    const newUser = (await user.save()).toObject();
    newUser.iss = req.protocol + '://' + req.hostname;

    const token = Token.create(newUser);

    res.cookie('dark_mode', false);
    res.cookie('locale', 'en');
    res.cookie('uid', newUser.id);
    res.cookie('token', token, { signed: 1, httpOnly: 1 });
    res.status(200).json({
      ok: true,
      next: '/'
    });
  }
  catch (err) { next(err) }
}