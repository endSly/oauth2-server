/* User
 *
 */

var mongoose = require('mongoose')
  , crypto = require('crypto');

var schema = mongoose.Schema({
  name:           String,
  email:          {type: String, lowercase: true, trim: true, index: {unique: true, dropDups: true}},
  password_hash:  String,
  current_sign_in_ip: String,
  current_sign_in_at: Date,
  created_at:     {type: Date,    default: Date.now },
  is_admin:       {type: Boolean, default: false },
});

function generateHash(s){
  var shasum = crypto.createHash('sha256');
  shasum.update(s);
  return shasum.digest('base64');
}

schema.virtual('password').set(function(password){
  this.password_hash = generateHash(password);
});

schema.methods.checkPassword = function(password){
  return this.password_hash == generateHash(password);
};

schema.statics.findByEmailAndPassword = function(email, password, cb){
  this.findOne({email: email, password_hash: generateHash(password)}, cb);
};

schema.virtual('email_md5').get(function () {
  return crypto.createHash('md5').update(this.email || "").digest("hex");
});

module.exports = mongoose.model('user', schema);
