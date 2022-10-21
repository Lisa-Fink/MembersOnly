const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  userName: String,
  message: String,
  title: String,
  date: Date,
});

module.exports = mongoose.model('Message', MessageSchema);
