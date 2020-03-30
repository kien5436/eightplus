const { Schema, model } = require('mongoose');

const { User } = require('./user');

const contactSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  friends: [User],
  requesting: [User],
  pending: [User],
  blocked: [User],
  isBlocked: [User],
});

module.exports = model('Contact', contactSchema);