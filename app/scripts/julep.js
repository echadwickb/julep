'use strict';

// allows us to handle uncaught node exceptions
// more gracefully
process.on('uncaughtException', function(e) {
  console.error(e);
});

(function() {

  function JulepConfig($routeProvider) {
    $routeProvider.when('/import_tx', {
      templateUrl: 'partials/import_tx.html',
      controller: 'ImportTxCtrl'
    });

    $routeProvider.when('/account', {
      templateUrl: 'partials/account.html',
      controller: 'AcctCtrl'
    });

    $routeProvider.when('/category', {
      templateUrl: 'partials/category.html',
      controller: 'CatCtrl'
    });

    $routeProvider.when('/budget', {
      templateUrl: 'partials/budget.html',
      controller: 'BdgtCtrl'
    });

    $routeProvider.when('/', {
      templateUrl: 'partials/tx.html',
      controller: 'TxCtrl'
    });

    $routeProvider.otherwise({
      redirectTo: '/'
    });
  }

  angular.module('julep', [
    'julepControllers',
    'ngRoute',
    'underscore',
    'aggregation',
    'd3'
  ])
    .config(JulepConfig);

})();
