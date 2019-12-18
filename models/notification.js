const { Schema, model } = require('mongoose');

const notifSchema = new Schema({
  to: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  content: String,
  isRead: {
    default: false,
    type: Boolean,
  },
  createdAt: {
    default: Date.now,
    type: Number
  }
});

module.exports = model('Notif', notifSchema);