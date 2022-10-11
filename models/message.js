const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  userName: String,
  message: String,
  date: String,
});

module.exports = mongoose.model('Message', MessageSchema);
