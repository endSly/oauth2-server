
/**
 * Module dependencies.
 */

var express = require('express')
  , fs = require('fs')
  , http = require('http')
  , https = require('https')
  , path = require('path')
  , mongoose = require('mongoose')
  , MemoryStore = express.session.MemoryStore
  , RedisStore = require('connect-redis')(express);

var app = express();

var config = require('./config')[app.get('env')];

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
  //app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(require('connect-assets')());
  
  mongoose.connect(config.dbURL);
});

// development only
app.configure('development', function(){
  app.use(express.errorHandler());
  app.use(express.session({store: new MemoryStore({reapInterval: 5 * 60 * 1000}), secret: config.sessionSecret}));
});

app.configure('production', function(){
  app.use(express.session({store: new RedisStore(config.redisStore), secret: config.sessionSecret }));
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
