'use strict';

var julepApp = angular.module('julep',[
	'julepControllers',
	'ngRoute'
]);

julepApp.config(function($routeProvider) {
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

	$routeProvider.otherwise({ redirectTo: '/' });
});
