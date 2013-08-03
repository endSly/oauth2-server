var _ = require('underscore')
  , async = require('async');

var User =          require('../models/user')
  , Client =        require('../models/client')
  , Subscription =  require('../models/subscription');

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
    console.log('unauthorized!');
    res.status(404);
    res.render('404');
  }
};

module.exports = function(app){

  /*
   *  Users
   */


  app.get('/admin/users.json', checkAuthorized, function(req, res) {
    User.find({}, '_id email name', {skip: req.query.skip || 0, limit: req.query.limit || 10}, function(err, users){
      var rows = _.map(users, function(user){ return _.pick(user, '_id', 'email', 'name', 'email_md5'); });
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
  
  app.get('/admin/users/:id.json', checkAuthorized, function(req, res){
    User.findById(req.params.id, function(err, user){
      user = _.pick(user, '_id', 'email', 'name', 'email_md5')
      Subscription.find({user_id: user._id}, function(err, subscriptions){
        async.map(subscriptions, function(subscription, cb){
          Client.findById(subscription.client_id, function(err, client){
            var subscriptionInfo =    _.pick(subscription, 'client_id', 'plan_name', 'allowed', 'created_at', 'expires_at');
            subscriptionInfo.client = _.pick(client, '_id', 'name', 'title');
            cb(err, subscriptionInfo);
          });
        }, function(err, subscriptions){
          res.json({user: user, subscriptions: subscriptions});
        })
        
      });
      
    });
  });
  
  app.post('/admin/users/:id.json', checkAuthorized, function(req, res){
    User.findById(req.body.user_id, function(err, user){
      var userObj = _.omit(req.body.user, '_id', '__v');
      user.update(userObj, function(err){
        res.json(err);
      });
    });
  });
  
  app.delete('/admin/users/:id.json', checkAuthorized, function(req, res) {
    User.findByIdAndRemove(req.params.id, function(err){
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
  
  app.get('/admin/clients/:id.json', checkAuthorized, function(req, res) {
    Client.findById(req.params.id, function(err, client){
      if (err) { return res.json(500, {error: err}); }
      res.json(client);
    });
  });
  
  app.post('/admin/clients/:id.json', checkAuthorized, function(req, res) {
    Client.findById(req.params.id, function(err, client){
      var clientObj = _.omit(req.body.client, '_id', '__v', 'secret');
      client.update(clientObj, function(err){
        if (err) { return res.json(500, {error: err}); }
        res.json(client);
      });
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