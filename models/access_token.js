/* Model
 *
 */

var mongoose = require('mongoose');

var schema = mongoose.Schema({
  user_id:    {type: mongoose.Schema.ObjectId},
  token:      String
});

module.exports = mongoose.model('access_token', schema);