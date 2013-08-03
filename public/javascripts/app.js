'use strict';

var app = angular
  .module('app', ['ui.bootstrap'])
  .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
    
    $routeProvider.when('/admin/clients/:id/edit',   {templateUrl: '/admin/partials/clients/edit',  controller: ClientShowCtrl});
    $routeProvider.when('/admin/clients/new',        {templateUrl: '/admin/partials/clients/new',   controller: ClientShowCtrl});
    $routeProvider.when('/admin/clients/:id',        {templateUrl: '/admin/partials/clients/show',  controller: ClientShowCtrl});
    $routeProvider.when('/admin/clients',            {templateUrl: '/admin/partials/clients/index', controller: ClientIndexCtrl});
    
    $routeProvider.when('/admin/users/:id/edit',     {templateUrl: '/admin/partials/users/edit',    controller: UserShowCtrl});
    $routeProvider.when('/admin/users/new',          {templateUrl: '/admin/partials/users/new',     controller: UserShowCtrl});
    $routeProvider.when('/admin/users/:id',          {templateUrl: '/admin/partials/users/show',    controller: UserShowCtrl});
    $routeProvider.when('/admin/users',              {templateUrl: '/admin/partials/users/index',   controller: UserIndexCtrl});
    
    $routeProvider.when('/admin/users/:id/subscriptions/new', {templateUrl: '/admin/partials/users/subscriptions/new', controller: UserShowCtrl});
    
    $routeProvider.when('/admin',                    {templateUrl: '/admin/partials/index',         controller: AdminCtrl});
    
    $locationProvider.html5Mode(true);
  }]);

app.filter('iconBoolean', function() {
   return function(input) {
     return input ? 'icon-ok' : '';
   }
});


function AdminCtrl($rootScope, $scope, $location){
};

function ClientIndexCtrl($rootScope, $scope, $location, $routeParams, $http){
  $rootScope.menu = 'clients'; 
  
  $scope.loadRows = function(page){
    $scope.currentPage =  page;
    $http.get('/admin/clients.json?skip=' + ((page - 1) * 10) + '&limit=' + 10).success(function(response) {
      
      $scope.clients = response.rows;
      $scope.count = response.count;
      $scope.noOfPages = parseInt(response.count / 10) + 1;
    });
  };
  $scope.loadRows(1);
  
  $scope.remove = function(row) {
    $http.delete('/admin/clients/' + row._id + '.json', function(){
      $scope.users.splice($scope.users.indexOf(row), 1);
    });
  } 
};

function ClientShowCtrl($rootScope, $scope, $location, $routeParams, $http){
  $rootScope.menu = 'clients'; 
  
  if ($routeParams.id) {
    $http.get('/admin/clients/'+$routeParams.id+'.json').success(function(response) {
      $scope.client = response;
    });
  } else {
    $scope.client = {plans: []};
  }

  
  $scope.addPlan = function(){
    $scope.client.plans.push({});
  };
  
  $scope.removePlan = function(plan){
    $scope.client.plans.splice($scope.client.plans.indexOf(plan), 1);
  };
  
  $scope.saveApplication = function(){
    var url = '/admin/clients/' + ($scope.client._id || 'new') + '.json';
    $http.post(url, {client: $scope.client}).success(function(client){
      $location.path('/admin/clients/' + client._id);
    });
  };
};

function UserIndexCtrl($rootScope, $scope, $location, $routeParams, $http){
  $rootScope.menu = 'users'; 
  
  $scope.loadRows = function(page){
    $scope.currentPage =  page;
    $http.get('/admin/users.json?skip=' + ((page - 1) * 10) + '&limit=' + 10).success(function(response) {
      
      $scope.users = response.rows;
      $scope.count = response.count;
      $scope.noOfPages = parseInt(response.count / 10) + 1;
    });
  };
  $scope.loadRows(1);
  
  $scope.remove = function(row) {
    $http.delete('/admin/users/' + row._id + '.json', function(){
      $scope.users.splice($scope.users.indexOf(row), 1);
    });
  } 
};

function UserShowCtrl($rootScope, $scope, $location, $routeParams, $http){
  $rootScope.menu = 'users'; 

  $http.get('/admin/users/'+$routeParams.id+'.json').success(function(response) {
    $scope.user = response.user;
    $scope.subscriptions = response.subscriptions;
  });
  
  $scope.removeSubscription = function(row) {
    $http.delete('/admin/subscriptions/' + row._id + '.json', function(){
      $scope.subscriptions.splice($scope.subscriptions.indexOf(row), 1);
    });
  };
  
  $scope.newSubscription = {};
  
  $scope.createNewSubscription = function() {
    $scope.showNewSubscriptionForm = true;
    $http.get('/admin/clients.json').success(function(response) {
      $scope.clients = response.rows;
    });
  };
  
  $scope.saveNewSubscription = function() {
    var subscription = {
      user_id:    $scope.user._id,
      client_id:  $scope.newSubscription.client._id,
      plan_name:  $scope.newSubscription.plan.name,
      allowed:    $scope.newSubscription.allowed,
      expires_at: $scope.newSubscription.expires_at
    }
    
    $http.post('/admin/subscriptions.json', {subscription: subscription}).success(function(subscription) {
      $scope.subscriptions.push(subscription);
    });
  
    $scope.showNewSubscriptionForm = false;
  };
  
  $scope.deleteNewSubscription = function() {
    $scope.showNewSubscriptionForm = false;
  };
};
