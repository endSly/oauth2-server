var _ = require('underscore')
  , async = require('async');

var User =          require('../models/user')
  , Client =        require('../models/client')
  , Subscription =  require('../models/subscription');

var checkAuthorized = function(req, res, next) {
  if(req.session.user) {
    User.findById(req.session.user, function(err, user) {
      if (user && user.is_admin) {
        req.current_user = user;
        return next()
      }
      console.log("[User] Unauthorized access with user " + user.email);
      res.status(404);
      res.render('404');
    });
  } else {
    res.status(404);
    res.render('404');
  }
  /*
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
    console.log('unauthorized!');
    res.status(404);
    res.render('404');
  }
  */
};

var load = function(model, name) {
  return function(req, res, next) {
    model.findById(req.params.id, function(err, doc){
      if (err)
        return res.json(500, {error: err});
      if (!doc)
        return res.json(404);
      
      if (name)
        req[name] = doc;
      next();
    });
  };
}

var loadUser =    load(User, 'user')
  , loadClient =  load(Client, 'client');

module.exports = function(app){

  /*
   *  Users
   */
  app.get('/admin/users.json', checkAuthorized, function(req, res) {
    var query = req.query.query 
    ? {name: new RegExp(req.query.query, "i"), email: new RegExp(req.query.query, "i")} 
    : {};
    User.find(query, '_id email name created_at is_admin', {skip: req.query.skip || 0, limit: req.query.limit || 10}, function(err, users){
      var rows = _.map(users, function(user){ return _.pick(user, '_id', 'email', 'name', 'email_md5', 'created_at', 'is_admin'); });
      User.count({}, function(err, count){
        res.json({rows: rows, count: count, skip: req.query.skip || 0, limit: req.query.limit || 10});
      });
    });
    
  });
  
  app.post('/admin/users/new.json', checkAuthorized, function(req, res) {
    var user = new User(req.body.user);
    user.save(function(err){
      res.json(user);
    });
  });
 
  app.post('/admin/users/:id/sign_in.json', checkAuthorized, loadUser, function(req, res) {
    req.session.user = req.user._id;
    res.json(req.user);
  });
   
  app.get('/admin/users/:id.json', checkAuthorized, loadUser, function(req, res) {
    var user = _.pick(req.user, '_id', 'email', 'name', 'email_md5', 'is_admin')
    
    Subscription.find({user_id: user._id}, function(err, subscriptions){
      async.map(subscriptions, function(subscription, cb){
        Client.findById(subscription.client_id, function(err, client){
          var subscriptionInfo =    _.pick(subscription, '_id', 'client_id', 'plan_name', 'allowed', 'created_at', 'expires_at');
          subscriptionInfo.client = _.pick(client, '_id', 'name', 'title');
          cb(err, subscriptionInfo);
        });
      }, function(err, subscriptions){
        res.json({user: user, subscriptions: subscriptions});
      });
    });
  });
  
  app.post('/admin/users/:id.json', checkAuthorized, loadUser, function(req, res){
    var userObj = _.omit(req.body.user, '_id', '__v');
    req.user.update(userObj, function(err){
      res.json(err);
    });
  });
  
  app.delete('/admin/users/:id.json', checkAuthorized, function(req, res) {
    User.findByIdAndRemove(req.params.id, function(err){
      res.json(err);
    });
  });
  
  /*
   *  Subscriptions
   */
  
  app.post('/admin/subscriptions.json', checkAuthorized, function(req, res){
    var subscription = new Subscription(req.body.subscription);
    subscription.save(function(err){
      Client.findById(subscription.client_id, function(err, client){
        var subscriptionInfo =    _.pick(subscription, 'client_id', 'plan_name', 'allowed', 'created_at', 'expires_at');
        subscriptionInfo.client = _.pick(client, '_id', 'name', 'title');
        res.json(subscriptionInfo);
      });
    });
  });
  
  app.delete('/admin/subscriptions/:id.json', checkAuthorized, function(req, res) {
    Subscription.findByIdAndRemove(req.params.id, function(err){
      res.json(err);
    });
  });
  
  /*
   *  Clients
   */
  
  app.get('/admin/clients.json', checkAuthorized, function(req, res) {
    Client.find({}, null, {skip: req.query.skip || 0, limit: req.query.limit || 100}, function(err, rows){
      Client.count({}, function(err, count){
        res.json({rows: rows, count: count, skip: req.query.skip || 0, limit: req.query.limit || 10});
      });
    });
  });
  
  app.post('/admin/clients/new.json', checkAuthorized, function(req, res) {
    var client = new Client(req.body.client);
    client.generateSecret();
    client.save(function(err){
      if (err) { return res.json(500, {error: err}); }
      res.json(client);
    });
  });
  
  app.get('/admin/clients/:id.json', checkAuthorized, loadClient, function(req, res) {
    res.json(req.client);
  });
  
  app.post('/admin/clients/:id.json', checkAuthorized, loadClient, function(req, res) {
    var clientObj = _.omit(req.body.client, '_id', '__v', 'secret');
    req.client.update(clientObj, function(err){
      if (err) { return res.json(500, {error: err}); }
      res.json(req.client);
    });
  });
  
  
  app.delete('/admin/clients/:id.json', checkAuthorized, function(req, res) {
    Client.findByIdAndRemove(req.params.id, function(err){
      if (err) { return res.json(500, {error: err}); }
        res.json("Ok");
    });
  });
  
  
  
  /*
   * Generic routes
   */
  app.get('/admin/partials/*', checkAuthorized, function(req, res){
    res.render('admin/partials/'+req.params[0]);
  });

  app.get('/admin(/*)?', checkAuthorized, function(req, res) {
    res.render('admin/app', {menu: 'home'});
  });

};