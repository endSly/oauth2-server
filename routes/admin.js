var User = require('../models/user')
  , Client = require('../models/client');

var checkAuthorized = function(req, res, next){

  if(req.client.authorized){
    var subject = req.connection.getPeerCertificate().subject;

    console.log('authorized',  {
      user:         subject.CN,
      email:        subject.emailAddress,
      organization: subject.O,
      unit:         subject.OU,
      location:     subject.L,
      state:        subject.ST,
      country:      subject.C
    }); 
   
    next();
  } else {
    res.render('404', 404);
  }
};

module.exports = function(app){
  
  app.get('/admin', checkAuthorized, function(req, res) {
    res.render('admin/index', {menu: 'home'});
  });

  app.get('/admin/users', checkAuthorized, function(req, res) {
    User.find({}, function(err, users){
      res.render('admin/users/index', {users: users, menu: 'users'});
    });
    
  });
  
  app.get('/admin/users/new', checkAuthorized, function(req, res) {
    var user = new User({});
    res.render('admin/users/new', {user: user, menu: 'users'});
  });
  
  app.post('/admin/users/new', checkAuthorized, function(req, res) {
    var user = new User(req.body.user);
    user.save(function(err){
      console.log(user);
      res.redirect('admin/users');
    });
  });
  
  app.get('/admin/users/:id', checkAuthorized, function(req, res){
    User.findOne({_id: req.params.id}, function(err, user){
      res.render('admin/users/show', {user: user, menu: 'users'});
    });
  });
  
  app.get('/admin/users/:id/edit', checkAuthorized, function(req, res){
    User.findOne({_id: req.params.id}, function(err, user){
      res.render('admin/users/edit', {user: user, menu: 'users'});
    });
  });
  
  app.post('/admin/users/:id', checkAuthorized, function(req, res){
    User.findOne({_id: req.body.user_id}, function(err, user){
      user.update(req.body.user, function(err){
        res.redirect('admin/users');
      });
    });
  });
  
  app.get('/admin/applications', checkAuthorized, function(req, res) {
    Client.find({}, function(err, apps){
      res.render('admin/applications/index', {apps: apps, menu: 'apps'});
    });
  });
  
  app.get('/admin/applications/new', checkAuthorized, function(req, res) {
    res.render('admin/applications/new', {menu: 'apps'});
  });
  
  app.post('/admin/applications/new', checkAuthorized, function(req, res) {
    var app = new Client(req.body.application);
    app.generateSecret();
    app.save(function(err){
      res.redirect('admin/applications');
    });
  });
  
  app.get('/admin/applications/:id', checkAuthorized, function(req, res) {
    Client.findOne({_id: req.params.id}, function(err, app){
      res.render('admin/applications/show', {app: app, menu: 'apps'});
    });
  });

};