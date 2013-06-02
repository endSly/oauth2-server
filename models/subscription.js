/* Model
 *
 */

var mongoose = require('mongoose');

var schema = mongoose.Schema({
  client_id:  {type: mongoose.Schema.ObjectId},
  plan_id:    {type: mongoose.Schema.ObjectId},
  user_id:    {type: mongoose.Schema.ObjectId},
  allowed:    {type: Boolean, default: false},
  created_at: Date,
  expires_at: Date
});

module.exports = mongoose.model('subscription', schema);