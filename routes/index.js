var User          = require('../models/user')
  , Subscription  = require('../models/subscription');

var adminRoutes = require('./admin');

module.exports = function(app){
  
  adminRoutes(app);
  
  app.get('/', function(req, res, next) {
    if(req.session.user) {
      res.json('loggedin');
    } else {
      res.redirect('/login')
    }
  });

  app.get('/login', function(req, res, next) {
    if(req.session.user) {
      res.redirect('/');
    }
    var next_url = req.query.next || '/';
    res.render('sessions/login', {next: next_url});
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
  
  app.get('/signup', function(req, res, next) {
    if(req.session.user) {
      res.redirect('/');
    }
    var next_url = req.query.next || '/';
    res.render('sessions/signup', {next: next_url});
  });
  
  app.post('/signup', function(req, res, next) {
    if (req.body.user.password != req.body.user.password_confirmation) {
      res.redirect('/signup');
      return
    }
    var user = new User(req.body.user);
    user.save(function(err){
      res.redirect(req.body.next || '/');
    });
  });
  
  app.get('/logout', function(req, res, next){
    req.session.destroy(function(err) {
      res.redirect('/');
    });
  });
  
  app.get('/api/v1/user_info', function(req, res){
    User.findById(req.session.user, function(err, user){
      if (!user) {
        return res.json(err, 403);
      }
      Subscription.findById(req.session.data.subscription_id, function(err, subscription){
        res.json({_id: user._id, name: user.name, email: user.email, subscription: subscription});
      });
    });
  });
  
}