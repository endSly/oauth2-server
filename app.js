
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , mongoose = require('mongoose')
  , OAuth2Provider = require('oauth2-provider').OAuth2Provider
  , MemoryStore = express.session.MemoryStore;

var app = express();

var server = http.createServer(app);

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
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

app.get('/', function(req, res, next) {
  console.dir(req.session);
  res.end('home, logged in? ' + !!req.session.user);
});

app.get('/login', function(req, res, next) {
  if(req.session.user) {
    res.redirect('/');
  }
  var next_url = req.query.next ? req.query.next : '/';
  res.render('login', {next: next_url});
});

app.post('/login', function(req, res, next) {
  User.findByEmailAndPassword(req.body.email, req.body.password, function(err, user){
    if (!user) {
      res.redirect('back');
      
      return;
    }
    req.session.user = user._id;
    res.redirect(req.body.next || '/');
  });
});

app.get('/logout', function(req, res, next) {
  req.session.destroy(function(err) {
    res.redirect('/');
  });
});

server.listen(app.get('port'), function(){
  console.log('OAuth 2 server listening on port ' + app.get('port') + ' in ' + app.get('env') + ' mode.');
});
