'use strict';

var app = angular
  .module('app', [])
  .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
    
    $routeProvider.when('/admin/clients/:id/edit',   {templateUrl: '/admin/partials/clients/edit',  controller: ClientShowCtrl});
    $routeProvider.when('/admin/clients/new',        {templateUrl: '/admin/partials/clients/new',   controller: ClientShowCtrl});
    $routeProvider.when('/admin/clients/:id',        {templateUrl: '/admin/partials/clients/show',  controller: ClientShowCtrl});
    $routeProvider.when('/admin/clients',            {templateUrl: '/admin/partials/clients/index', controller: ClientIndexCtrl});
    
    $routeProvider.when('/admin/users/:id/edit',     {templateUrl: '/admin/partials/users/edit',    controller: UserShowCtrl});
    $routeProvider.when('/admin/users/new',          {templateUrl: '/admin/partials/users/new',     controller: UserShowCtrl});
    $routeProvider.when('/admin/users/:id',          {templateUrl: '/admin/partials/users/show',    controller: UserShowCtrl});
    $routeProvider.when('/admin/users',              {templateUrl: '/admin/partials/users/index',   controller: UserIndexCtrl});
    
    $locationProvider.html5Mode(true);
  }]);
  


function AdminCtrl($rootScope, $scope, $location){
  
};

function ClientIndexCtrl($rootScope, $scope, $location, $routeParams, $http){
  $http.get('/admin/clients.json')
  .success(function(response) {
    $scope.clients = response;
  });
};

function ClientShowCtrl($rootScope, $scope, $location, $routeParams, $http){

  $http.get('/admin/clients/'+$routeParams.id+'.json')
  .success(function(response) {
    $scope.client = response.client;
    $scope.plans = response.plans;
  });

  
  $scope.addPlan = function(){
    $scope.plans.push({name: 'new'});
  };
  
  $scope.removePlan = function(plan){
    $scope.plans.splice($scope.plans.indexOf(plan), 1);
  };
};

function UserIndexCtrl($rootScope, $scope, $location, $routeParams, $http){
  $scope.page = 0;
  
  $scope.loadRows = function(){
    $http.get('/admin/users.json', {skip: ($scope.page * 10), limit: 10})
    .success(function(response) {
      $scope.users = response.rows;
      $scope.count = response.count;
      $scope.pagesCount = parseInt(response.count / 10) + 1;
    });
  };
  $scope.loadRows();
};

function UserShowCtrl($rootScope, $scope, $location, $routeParams, $http){

  $http.get('/admin/users/'+$routeParams.id+'.json')
  .success(function(response) {
    $scope.user = response.user;
    $scope.subscriptions = response.subscriptions;
  });
};