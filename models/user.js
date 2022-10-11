const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  userName: String,
  email: String,
  password: String,
  isMember: Boolean,
  isAdmin: Boolean,
});

module.exports = mongoose.model('User', UserSchema);
