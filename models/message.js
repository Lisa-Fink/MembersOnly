const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  username: String,
  message: String,
  title: String,
  date: Date,
});

module.exports = mongoose.model('Message', MessageSchema);
