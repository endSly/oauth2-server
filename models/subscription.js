/* Model
 *
 */

var mongoose = require('mongoose');

var schema = mongoose.Schema({
  client_id:  {type: mongoose.Schema.ObjectId},
  plan_name:  String,
  user_id:    {type: mongoose.Schema.ObjectId},
  allowed:    {type: Boolean, default: false},
  created_at: {type: Date, default: Date.now },
  expires_at: Date
});

module.exports = mongoose.model('subscription', schema);