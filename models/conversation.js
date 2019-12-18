const { Schema, model } = require('mongoose');

const { User } = require('./user');

const conversationSchema = Schema({
  aliasId: {
    index: { unique: true, type: 'text' },
    type: String,
    minlength: 1,
    trim: true,
  },
  name: {
    index: { type: 'text' },
    minlength: 1,
    trim: true,
    type: String,
  },
  accessScope: {
    default: 'private',
    enum: ['private', 'public'],
    type: String,
  },
  members: [User],
  color: String,
  createdAt: {
    default: Date.now,
    type: Number
  },
  updatedAt: Number,
});

module.exports = model('Conversation', conversationSchema);