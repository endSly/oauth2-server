/* Model
 *
 */

var mongoose = require('mongoose')
  , crypto = require('crypto');

var schema = mongoose.Schema({
  title:        String,
  name:         {type: String, index: {unique: true, dropDups: true}},
  secret:       String,
  redirect_uri: String,
  plans: [{
    title:        String,
    name:         String,
    open_access:  { type: Boolean, default: false },
    default:      { type: Boolean, default: false },
  }]
});

schema.methods.generateSecret = function(){
  this.secret = crypto.randomBytes(96).toString('base64');
};

module.exports = mongoose.model('client', schema);
