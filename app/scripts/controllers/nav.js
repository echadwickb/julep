(function () {

	'use strict';

	function NavCtrl($scope, $location) {

		$scope.goTo = function (path) {
			console.info('Navigating to %s', path);

			$location.path(path);
		};

		$scope.navs = [
			{ path: '/', label: 'Transactions' },
			{ path: '/category', label: 'Categories' },
			{ path: '/budget', label: 'Budgets' },
			{ path: '/import_tx', label: 'Import Transactions' },
			{ path: '/account', label: 'Accounts' }
		];
	}

	NavCtrl.$inject = ['$scope', '$location'];

	angular.module('julep')
		.controller('NavCtrl', NavCtrl);

})();
