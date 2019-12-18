const { Schema, model } = require('mongoose');

const messageSchema = new Schema({
  cid: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation'
  },
  origin: {
    type: Schema.Types.ObjectId,
    ref: 'Message'
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  content: {
    type: String,
    required: true,
  },
  type: {
    default: 'text',
    enum: ['text', 'video', 'image', 'sound', 'file'],
    type: String,
  },
  createdAt: {
    default: Date.now,
    type: Number
  },
});

module.exports = model('Message', messageSchema);