const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MembershipSchema = new Schema({
  code: String,
  type: String,
});

module.exports = mongoose.model('Membership', MembershipSchema);
