(function () {

	'use strict';

	function TxCtrl($scope, txModel, catModel, acctModel) {

		var allTxs = [];

		$scope.selectedTx = 0;
		$scope.txs = [];
		$scope.search = '';
		$scope.from = null;
		$scope.to = null;
		$scope.uncategorized = false;
		$scope.pageShow = 25;
		$scope.cats = [];
		$scope.accts = [];
		$scope.acctsById = [];
		$scope.acctId = '';

		txModel.getAll(function (txs) {
			allTxs = txs;
			// $scope.txs = txs;
			// $scope.$apply();
			$scope.txFilter();
			$scope.$apply();
		});

		catModel.getAll(function (cats) {
			$scope.cats = cats;
			$scope.$apply();
		});

		acctModel.getAll(function (accts) {
			$scope.accts = accts;
			for (var i in accts) {
				$scope.acctsById[accts[i].id] = accts[i];
			}
			console.info($scope.acctsById);

			$scope.$apply();
		});

		$scope.updateTxCat = function (tx, $event) {

			// we cancelled account
			if ($event.keyCode === 27) {
				tx.edit = false;
			}

			// save on enter
			if ($event.keyCode === 13) {

				// is this a new category? then save it

				console.info('Saving tx: %O', tx);
				delete tx.edit;
				txModel.save(tx);
				tx.edit = false;
			}
		};

		$scope.txFilter = function () {

			$scope.txs = [];

			angular.forEach(allTxs, function(tx) {

				var add = true;

				if ($scope.from !== null && tx.date < $scope.from) { add = false; }
				if ($scope.to !== null && tx.date > $scope.to) { add = false; }
				if ($scope.uncategorized && (typeof tx.cat !== 'undefined' || tx.cat === '')) { add = false; }
				if ($scope.acctId !== '' && $scope.acctId !== tx.acctId) { add = false; }

				if (add) {$scope.txs.push(tx); }

			});

		};

		$scope.setSelectedRow = function (i) {
			$scope.selectedTx = i;
		};
	}

	TxCtrl.$inject = ['$scope', 'txModel', 'catModel', 'acctModel'];

	angular.module('julep')
		.controller('TxCtrl', TxCtrl);
})();
