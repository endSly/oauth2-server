var User = require('../models/user');

var adminRoutes = require('./admin');

module.exports = function(app){
  
  adminRoutes(app);
  
  app.get('/', function(req, res, next) {
    res.redirect('/login');
  });

  app.get('/login', function(req, res, next) {
    if(req.session.user) {
      res.redirect('/');
    }
    var next_url = req.query.next ? req.query.next : '/';
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
    var next_url = req.query.next ? req.query.next : '/';
    res.render('sessions/signup', {next: next_url});
  });
  
  app.post('/signup', function(req, res, next) {
    if (req.body.user.password == req.body.password_confirmation) {
      
    }
    var user = new User({});
    User.findByEmailAndPassword(req.body.email, req.body.password, function(err, user){
      if (!user) {
        res.redirect('back');
        
        return;
      }
      req.session.user = user._id;
      res.redirect(req.body.next || '/');
    });
  });
  
  app.get('/logout', function(req, res, next){
    req.session.destroy(function(err) {
      res.redirect('/');
    });
  });
  
  app.get('/api/v1/user_info', function(req, res){
    User.findOne({_id: req.session.user}, function(err, user){
      if (!user) {
        res.json(err, 403);
      } else {
        res.json(user);
      }
      
    });
  });
  
}