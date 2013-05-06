/* Model
 *
 */

var mongoose = require('mongoose');

var schema = mongoose.Schema({
  client_id:  {type: mongoose.Schema.ObjectId},
  user_id:    {type: mongoose.Schema.ObjectId},
  secret:     String
});

module.exports = mongoose.model('grant', schema);