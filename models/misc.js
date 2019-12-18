const { Schema, model } = require('mongoose');

const miscSchema = new Schema({
  key: String,
  value: String
});

module.exports = model('MetaMisc', miscSchema);