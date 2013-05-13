
/**
 * Module dependencies.
 */

var express = require('express')
  , fs = require('fs')
  , http = require('http')
  , https = require('https')
  , path = require('path')
  , mongoose = require('mongoose')
  , MemoryStore = express.session.MemoryStore;

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('ssl port', process.env.PORT || 3443);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.query());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({store: new MemoryStore({reapInterval: 5 * 60 * 1000}), secret: 'abracadabra'}));
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.static(path.join(__dirname, 'public')));
});

// development only
app.configure('development', function(){
  app.use(express.errorHandler());
  mongoose.connect('mongodb://localhost/dev-oauth2-server');
});

app.configure('production', function(){
  mongoose.connect('mongodb://localhost/oauth2-server');
});

var provider = require('./provider');
app.use(provider.oauth());
app.use(provider.login());

var routes = require('./routes');
routes(app);

var server = http.createServer(app);

server.listen(app.get('port'), function(){
  console.log('OAuth 2 server listening on port ' + app.get('port') + ' in ' + app.get('env') + ' mode.');
});

if (process.env.OAUTH_SECURE) {
  var opts = {
    key: fs.readFileSync('ssl/server/keys/tenzing.urbegi.com.key'),
    cert: fs.readFileSync('ssl/server/certificates/tenzing.urbegi.com.crt'),
    ca: fs.readFileSync('ssl/ca/ca.crt'),
    requestCert: true,
    rejectUnauthorized: false,
    passphrase: "(N#*SY=mB58s+QQn\"mL?mb\"9<pE$Tc&Lvk?Vc&$p<Zx5ACd:"
  };
  var secureServer = https.createServer(opts, app);
  secureServer.listen(app.get('ssl port'), function(){
    console.log('Tenzing OAuth 2 secure server listening on port ' + app.get('ssl port') + ' in ' + app.get('env') + ' mode.');
  }); 
}
