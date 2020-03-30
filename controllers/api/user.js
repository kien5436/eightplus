const uaParser = require('ua-parser-js');
const { Types } = require('mongoose');

const User = require('../../models/user');
const Token = require('./token');
const hash = require('../../helpers/hash');
const error = require('../../helpers/error');
const { validateOnLogin } = require('../../helpers/validate/user');

exports.search = (req, res, next) => {


};

exports.delete = (req, res, next) => {

  User
    .deleteOne({ _id: req.params.id })
    .then(result => res.json({ ok: !!result.n }))
    .catch(next);
};

exports.getInfo = (req, res, next) => {

  User
    .findOne({ _id: req.params.id })
    .select('avatar lastActive nickname visible')
    .then(user => res.json({ ok: true, user: user }))
    .catch(next);
};

// modified
exports.logout = (req, res, next) => {

  const token = req.signedCookies['token'] || req.header('Authorization').split(' ')[1];
  const ua = uaParser(req.header('user-agent'));

  Token.invalidate(token);

  if (undefined !== ua.browser.name) {

    res.clearCookie('token', { signed: 1, httpOnly: 1, secure: process.env.COOKIE_SECURE, maxAge: process.env.COOKIE_MAXAGE });
    res.clearCookie('ml_token', { secure: process.env.COOKIE_SECURE, maxAge: process.env.COOKIE_MAXAGE });
    res.status(200).json({ ok: true });
  }
};

exports.register = async (req, res, next) => {

  const { name, password } = req.body;
  const ua = uaParser(req.header('user-agent'));

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
    const markLoggedInToken = Token.create(user, Token.MARK_LOGGED_IN_TOKEN);

    if (undefined === ua.browser.name) {

      res.status(200).json({
        ok: true,
        token
      });
      return;
    }

    res.cookie('dark_mode', false, { secure: process.env.COOKIE_SECURE, maxAge: process.env.COOKIE_MAXAGE });
    res.cookie('locale', 'en', { secure: process.env.COOKIE_SECURE, maxAge: process.env.COOKIE_MAXAGE });
    res.cookie('uid', newUser.id, { secure: process.env.COOKIE_SECURE, maxAge: process.env.COOKIE_MAXAGE });
    res.cookie('token', token, { signed: 1, httpOnly: 1, secure: process.env.COOKIE_SECURE, maxAge: process.env.COOKIE_MAXAGE });
    res.cookie('ml_token', markLoggedInToken, { secure: process.env.COOKIE_SECURE, maxAge: process.env.COOKIE_MAXAGE });
    res.status(200).json({
      ok: true,
      ml_token: markLoggedInToken,
    });
  }
  catch (err) { next(err) }
};

exports.login = async (req, res, next) => {

  const ua = uaParser(req.header('user-agent'));
  const { email, password } = req.body;

  try {
    const { errors } = validateOnLogin({ email, password });

    if (Object.keys(errors).length > 0) throw error('', {
      status: 400,
      errors
    });

    const user = await User
      .findOne({ $or: [{ email: email }, { phone: email }] })
      .select('password salt role metaData').lean();

    if (null !== user) {

      const { password: hashedPassword } = hash(password, user.salt);

      if (hashedPassword === user.password) {

        user.iss = req.protocol + '://' + req.hostname;

        const token = Token.create(user, Token.ACCESS_TOKEN);
        const markLoggedInToken = Token.create(user, Token.MARK_LOGGED_IN_TOKEN);

        if (undefined === ua.browser.name) {

          res.status(200).json({
            ok: true,
            token
          });

          return;
        }

        const referer = req.signedCookies['referer'] || '/';
        res.cookie('dark_mode', 'true' === user.metaData.darkMode, { secure: process.env.COOKIE_SECURE, maxAge: process.env.COOKIE_MAXAGE });
        res.cookie('locale', user.metaData.locale, { secure: process.env.COOKIE_SECURE, maxAge: process.env.COOKIE_MAXAGE });
        res.cookie('token', token, { signed: 1, httpOnly: 1, secure: process.env.COOKIE_SECURE, maxAge: process.env.COOKIE_MAXAGE });
        res.cookie('ml_token', markLoggedInToken, { secure: process.env.COOKIE_SECURE, maxAge: process.env.COOKIE_MAXAGE });
        // res.clearCookie('referer', { signed: 1, httpOnly: 1, secure: process.env.COOKIE_SECURE });
        res.status(200).json({
          ok: true,
          next: referer,
          ml_token: markLoggedInToken,
        });

        return;
      }
    }

    throw error('', {
      status: 400,
      errors: {
        email: {
          field: 'email',
          message: 'user unexisted',
          value: email
        }
      }
    });
  }
  catch (err) { next(err) }

};

exports.list = async (req, res, next) => {

  try {
    const currentUser = req.user;
    const limit = 20;
    const { part = 0, q = '' } = req.query;
    let users = [];

    if (!/^\d+$/.test(part)) throw error('bad request');

    if ('' === q.trim())
      users = await listWithoutQuery(part, limit, currentUser);
    else if (Types.ObjectId.isValid(q.trim()))
      users = [await findById(q.trim())];
    else users = await findByText(part, limit, q.trim());

    for (let i = users.length; --i >= 0;) {

      const user = users[i];
      const hidden = user.metaData.hidden;

      if (/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(q.trim()) && hidden.includes('email') || /^(\+[0-9]{1,4}|0)[0-9]{9,10}$/.test(q.trim()) && hidden.includes('phone')) {

        users.length = 0;
        break;
      }

      for (const field in user)
        if (hidden.includes(field)) user[field] = undefined;

      delete user.metaData.hidden;
    }

    res.status(200).json({
      ok: true,
      users,
      end: part > 0 && 0 === users.length,
    });
  }
  catch (err) { next(err) }
};

exports.update = async (req, res, next) => {

  const { id } = req.user;

  try {
    if (req.params.id !== id) throw error('permission denied', { status: 403 });

    const result = await User.updateOne({ _id: id }, { ...req.body, updatedAt: Date.now() });

    if (result.ok === 0) throw error('update failed', { status: 400 });

    res.status(200).json({
      ok: true,
      message: 'updated'
    });
  }
  catch (err) { next(err) }
};

/**
 * @param {number} part partition where cursor is
 * @param {number} limit
 * @param {string} text query text for email, phone or id, name
 * IMPORTANT: needs to optimize query with email or phone is hidden
 * needs to implement partial text search
 */
function findByText(part, limit, text) {

  if (/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(text) || /^(\+[0-9]{1,4}|0)[0-9]{9,10}$/.test(text)) {

    return Promise.resolve(
        User.find({
          isDeleted: false,
          isActive: true,
          $or: [{ email: text }, { phone: text }]
        })
        .select('aliasId avatar dob email phone name metaData.socialAccount metaData.hidden')
        .lean()
      )
      .then(user => user);
  }

  return User
    .find({
      isDeleted: false,
      isActive: true,
      $text: { $search: text },
    }, { score: { $meta: 'textScore' } })
    .select('aliasId avatar dob email phone name metaData.socialAccount metaData.hidden')
    .skip(parseInt(part) * limit).limit(limit)
    .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
    .lean();
}

function findById(id) {

  return User
    .findById(id)
    .select('aliasId avatar dob email phone name metaData.socialAccount metaData.hidden')
    .lean();
}

function listWithoutQuery(part, limit, currentUser) {

  return User
    .find({
      isDeleted: false,
      isActive: true,
      _id: { $ne: currentUser.id },
    })
    .select('aliasId avatar dob email phone name metaData.socialAccount metaData.hidden')
    .skip(parseInt(part) * limit).limit(limit)
    .sort({ createdAt: -1 })
    .lean();
}