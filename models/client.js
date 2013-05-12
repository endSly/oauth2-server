/* Model
 *
 */

var mongoose = require('mongoose')
  , crypto = require('crypto');

var schema = mongoose.Schema({
  name:   String,
  secret: String,
  redirect_uri: String
});

schema.methods.generateSecret = function(){
  this.secret = crypto.randomBytes(96).toString('base64');
};

module.exports = mongoose.model('client', schema);
