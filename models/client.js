/* Model
 *
 */

var mongoose = require('mongoose');

var schema = mongoose.Schema({
  name:   String,
  secret: String,
  redirect_uri: String
});

module.exports = mongoose.model('client', schema);