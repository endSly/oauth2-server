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
    
    $routeProvider.when('/admin',                    {templateUrl: '/admin/partials/index',         controller: AdminCtrl});
    
    $locationProvider.html5Mode(true);
  }]);

app.filter('iconBoolean', function() {
   return function(input) {
     return input ? 'icon-ok' : '';
   }
});


function AdminCtrl($rootScope, $scope, $location){
  console.log($location);
};

function ClientIndexCtrl($rootScope, $scope, $location, $routeParams, $http){
  $http.get('/admin/clients.json')
  .success(function(response) {
    $scope.clients = response;
  });
};

function ClientShowCtrl($rootScope, $scope, $location, $routeParams, $http){

  $http.get('/admin/clients/'+$routeParams.id+'.json').success(function(response) {
    $scope.client = response;
  });

  
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
  $scope.maxSize = 5;
  
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

  $http.get('/admin/users/'+$routeParams.id+'.json')
  .success(function(response) {
    $scope.user = response.user;
    $scope.subscriptions = response.subscriptions;
  });
};