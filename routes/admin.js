var User = require('../models/user')
  , Client = require('../models/client')
  , Plan = require('../models/plan')
  , Subscription = require('../models/subscription');

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
    User.find({}, null, {skip: req.params.skip || 0, limit: req.params.limit || 10}, function(err, rows){
      User.count({}, function(err, count){
        res.json({rows: rows, count: count});
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
      Subscription.find({user_id: user._id}, function(err, subscriptions){
        res.json({user: user, subscriptions: subscriptions});
      });
      
    });
  });
  
  app.post('/admin/users/:id.json', checkAuthorized, function(req, res){
    User.findById(req.body.user_id, function(err, user){
      user.update(req.body.user, function(err){
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
    Client.find({}, function(err, clients){
      res.json(clients);
    });
  });
  
  app.post('/admin/clients/new.json', checkAuthorized, function(req, res) {
    var client = new Client(req.body.client);
    client.generateSecret();
    client.save(function(err){
      res.json(client);
    });
  });
  
  app.get('/admin/clients/:id.json', checkAuthorized, function(req, res) {
    Client.findById(req.params.id, function(err, client){
      Plan.find({client_id: client._id}, function(err, plans){
        res.json({client: client, plans: plans});
      });
    });
  });
  
  app.post('/admin/clients/:id.json', checkAuthorized, function(req, res) {
    Client.findById(req.params.id, function(err, app){
      app.update(req.body.client, function(err){
        for (idx in req.body.plans) {
          plan = new Plan(req.body.plans[idx]);
          plan.save();
        }
        res.json(err);
      });
    });
  });
  
  
  app.delete('/admin/clients/:id.json', checkAuthorized, function(req, res) {
    Client.findByIdAndRemove(req.params.id, function(err){
      res.json(err);
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