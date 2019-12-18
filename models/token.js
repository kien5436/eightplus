const { Schema, model } = require('mongoose');

const tokenSchema = Schema({
  userId: Schema.Types.ObjectId,
  refreshToken: {
    type: Map,
    of: String,
  },
});

module.exports = model('Token', tokenSchema);