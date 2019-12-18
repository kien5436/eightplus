const { Schema, model } = require('mongoose');

const hash = require('../helpers/hash');
const error = require('../helpers/error');
const { validateOnSave, validateOnUpdate } = require('../helpers/validate/user');

const userSchema = new Schema({
  aliasId: {
    index: { unique: true, type: 'text' },
    type: String,
  },
  avatar: {
    type: Map,
    of: String,
    required: true,
  },
  dob: Number,
  email: {
    index: { unique: true, type: 'text' },
    type: String,
  },
  phone: {
    index: { unique: true, type: 'text' },
    trim: true,
    type: String,
  },
  name: {
    index: { unique: true, type: 'text' },
    type: String,
  },
  sex: String,
  password: String,
  salt: String,
  role: {
    default: 'user',
    enum: ['admin', 'user'],
    type: String,
  },
  createdAt: {
    default: Date.now,
    type: Number
  },
  updatedAt: Number,
  lastActive: {
    default: 0,
    type: Number,
  },
  isOnline: { // user is onlining or not show active status
    default: true,
    type: Boolean
  },
  isActive: { // user deactivates account or not
    default: true,
    type: Boolean
  },
  isDeleted: { // temporary delete account
    default: false,
    type: Boolean
  },
  metaData: {}
});

userSchema.pre('save', async function(next) {

  try {
    const user = {
      dob: this.dob,
      email: this.email,
      password: this.password,
      name: this.name,
      sex: this.sex,
    };
    const { errors, markError } = validateOnSave(user);

    if (!markError.email && 'email' in user) {

      const id = await this.constructor.findOne({ $or: [{ email: this.email }, { phone: this.email }] }).select('_id').lean();
      if (null !== id) errors.push({
        field: 'email',
        value: this.email,
        message: 'user existed'
      });
    }

    if (errors.length > 0) throw error('', { status: 400, errors });

    if (null !== this.$locals.password) {

      const { password, salt } = hash(this.password);
      this.password = password;
      this.salt = salt;
    }

    if (/^(\+[0-9]{1,4}|0)[0-9]{9,10}$/.test(this.email)) {

      this.phone = this.email;
      this.email = undefined;
    }

    next();
  }
  catch (err) { next(err) }
});

userSchema.pre(/^update/, async function(next) {

  const user = this._update;
  let id = null;

  try {
    if ('id' in user) {

      user.aliasId = user.id;
      delete user.id;
    }

    const { errors, markError } = validateOnUpdate(user);

    if (!markError.email && 'email' in user) {

      id = await this.model.findOne({ $or: [{ email: user.email }, { phone: user.email }] }).select('_id').lean();
      if (null !== id) errors.push({
        field: 'email',
        value: user.email,
        message: 'user existed'
      });
    }

    if (!markError.aliasId && 'aliasId' in user) {

      id = await this.model.findOne({ aliasId: user.aliasId }).select('_id').lean();
      if (null !== id) errors.push({
        field: 'id',
        value: user.aliasId,
        message: 'id existed'
      });
    }

    // validate password is correct or not
    // if ('password' in user) {

    //   id = await this.model.findOne({ $or: [{ email: user.email }, { phone: user.email }] }).select('_id').lean();
    //   const { password, salt } = hash(user.password);

    //   if (null !== id) errors.push({
    //     field: 'password',
    //     message: 'password unmatch'
    //   });
    // }

    if (errors.length > 0) throw error('', { status: 400, errors });

    if (/^(\+[0-9]{1,4}|0)[0-9]{9,10}$/.test(user.email)) {

      user.phone = user.email;
      delete user.email;
    }

    if ('password' in user) {

      const { password, salt } = hash(user.password);
      user.password = password;
      user.salt = salt;
    }

    if ('metaData' in user) {

      const hidden = ['email', 'phone', 'id', 'dob', 'sex'];

      for (const key in user.metaData) {

        const val = user.metaData[key];

        if ('hidden' === key) user.metaData[key] = val.filter(field => hidden.includes(field));

        if ('socialAccount' === key)
          for (const site in val) user['metaData.socialAccount.' + site] = val[site];
        else
          user['metaData.' + key] = val;
      }
      delete user.metaData;
    }

    this.setUpdate({ ...user });

    next();
  }
  catch (err) { next(err) }
});

module.exports = model('User', userSchema);