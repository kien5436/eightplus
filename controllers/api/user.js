const User = require('../../models/user');
const Token = require('./token');
const hash = require('../../helpers/hash');
const error = require('../../helpers/error');

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

exports.login = async (req, res, next) => {

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

exports.register = async (req, res, next) => {

  const { email, name, password, dob, sex } = req.body;
  // console.log(email, name, password, dob, sex, req.body);

  try {

    const id = await User.findOne({ email: email }).select('_id');

    if (null !== id)
      throw error('error', {
        status: 400,
        errors: [{
          field: 'email',
          message: 'user existed',
          value: email
        }]
      });

    const firstLetter = name.substring(0, 1);

    const user = new User({
      email,
      name,
      password,
      sex,
      dob,
      isOnline: true,
      avatar: {
        'x32': `/images/avatars/default/_${firstLetter}x32.png`,
        'x64': `/images/avatars/default/_${firstLetter}x64.png`,
        'x96': `/images/avatars/default/_${firstLetter}x96.png`,
        'x128': `/images/avatars/default/_${firstLetter}x128.png`,
      }
    });
    user.$locals.password = password || null;

    let newUser = await user.save();
    newUser = newUser.toObject();
    newUser.iss = req.protocol + '://' + req.hostname;
    const token = await Token.create(newUser);

    if (token instanceof Error) throw token;

    res.status(201).json({
      ok: true,
      token,
    });
  }
  catch (err) { next(err) }
};
// modified
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