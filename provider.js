
var OAuth2Provider = require('oauth2-provider').OAuth2Provider
  , Client =  require('./models/client')
  , User =    require('./models/user')
  , Grant =   require('./models/grant');

var provider = new OAuth2Provider({crypt_key: 'encryption secret', sign_key: 'signing secret'});

// before showing authorization page, make sure the user is logged in
provider.on('enforce_login', function(req, res, authorize_url, next) {
  if(req.session.user) {
    next(req.session.user);
  } else {
    res.redirect('/login?next=' + encodeURIComponent(authorize_url));
  }
});

// render the authorize form with the submission URL
// use two submit buttons named "allow" and "deny" for the user's choice
provider.on('authorize_form', function(req, res, client_id, authorize_url) {
  Client.findById(client_id, function(err, client){
    if (!client) {
      res.json('error', 404);
      return;
    }
    res.render('authorize', {authorize_url: authorize_url, app: client});
  });
});

// save the generated grant code for the current user
provider.on('save_grant', function(req, client_id, code, next) {
  console.log("[oauth2] save_grant client_id: "+client_id+" code: "+code);
  
  Client.findById(client_id, function(err, client){
    if (!client) {
      res.json('unknown client', 404);
      return;
    }
    User.findById(req.session.user, function(err, user){
      if (!user) {
        res.json('access error', 404);
        return;
      }
      var grant = new Grant({user_id: user._id, client_id: client._id, secret: code});
      grant.save(function(err){
        if (err) {
          res.json('error saving grant', 500);
        return;
        }
        next();
      });
    });
  });
});

// remove the grant when the access token has been sent
provider.on('remove_grant', function(user_id, client_id, code) {
  console.log("[oauth2] remove_grant client_id: "+client_id+ " user_id: "+user_id+" code: "+code);
  
  Grant.find({user_id: user_id, client_id: client_id, secret: code}).remove(function(err, grant){
    if (!grant) {
      console.log('\033[31m'+'[oauth2] grant not found'+'\033[0m');
      return;
    }
    console.log('[oauth2] grant removed');
  });
});

// find the user for a particular grant
provider.on('lookup_grant', function(client_id, client_secret, code, next) {
  console.log("[oauth2] lookup_grant");
  
  // verify that client id/secret pair are valid
  Client.findOne({_id: client_id, secret: client_secret}, function(err, client){
    if (!client) return next(new Error('client not found'));
    
    Grant.findOne({client_id: client_id, secret: code}, function(err, grant){
      if (!grant) return next(new Error('no such grant'));
      
      User.findOne({_id: grant.user_id}, function(err, user){
        if (!user) {
          next(new Error('user not found'));
          return;
        }
        next(null, user._id);
      });
    });
  });
});

// embed an opaque value in the generated access token
provider.on('create_access_token', function(user_id, client_id, next) {
  console.log("[oauth2] create_access_token user_id: "+user_id+" client_id: "+client_id);
  var extra_data = null; // can be any data type or null
  //var oauth_params = {token_type: 'bearer'};

  next(extra_data/*, oauth_params*/);
});

// (optional) do something with the generated access token
provider.on('save_access_token', function(user_id, client_id, access_token) {
  console.log('[oauth2] saving access token user_id: '+user_id+' client_id: '+client_id);
  /*
  var token = new AccessToken({user_id: user_id, token: access_token.access_token});
  token.save(function(err){
    if (err) {
      console.log('\033[31m'+'[oauth2] Error saving access token :'+err+'\033[0m');
    }
  });
  */
});

// an access token was received in a URL query string parameter or HTTP header
provider.on('access_token', function(req, token, next) {
  console.log("[oauth2] access_token "+JSON.stringify(token));
  
  var TOKEN_TTL = 10 * 60 * 1000; // 10 minutes

  if(token.grant_date.getTime() + TOKEN_TTL > Date.now()) {
    req.session.user = token.user_id;
    req.session.data = token.extra_data;
  } else {
    console.warn('access token for user %s has expired', token.user_id);
  }

  next();
});

// (optional) client authentication (xAuth) for trusted clients
provider.on('client_auth', function(client_id, client_secret, username, password, next) {
  console.log("[oauth2] client_auth client_id: "+client_id+" client_secret: "+client_secret+" username: "+ username);
  if(client_id == '1' && username == 'guest') {
    var user_id = '1337';

    return next(null, user_id);
  }

  return next(new Error('client authentication denied'));
});

module.exports = provider;