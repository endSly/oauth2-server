/* Model
 *
 */

var mongoose = require('mongoose');

var schema = mongoose.Schema({
  client_id:  {type: mongoose.Schema.ObjectId},
  name: String,
  open_access: Boolean
});

module.exports = mongoose.model('plan', schema);