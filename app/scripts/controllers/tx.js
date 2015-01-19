(function () {

	'use strict';

	function organizeAcctsById(accts) {

		var indexedAccts = [];

		for (var z in accts) {

			indexedAccts[accts[z].id] = accts[z];
		}

		return indexedAccts;
	}

	function setBalances(accts, txs) {

		return txs.map(function (tx, i, txs) {

			accts[tx.acctId].currBal += tx.amt;

			tx.balance = accts[tx.acctId].currBal;

			return tx;
		});
	}

	function TxCtrl($scope, $q, txModel, catModel, acctModel) {

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

		var dataPromises = {};

		dataPromises['txs'] = txModel.getAll();
		dataPromises['cats'] = catModel.getAll();
		dataPromises['accts'] = acctModel.getAll();

		$q.all(dataPromises).then(function (result) {

			console.info(result);

			$scope.cats = result.cats;
			$scope.accts = result.accts;
			$scope.acctsById = organizeAcctsById($scope.accts);

			allTxs = setBalances($scope.acctsById, result.txs.reverse());

			$scope.txFilter();

		});

		$scope.updateTx = function (tx, $event) {

			console.info('somebody pressed something');

			// save on enter
			if ($event.keyCode === 13) {

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

	TxCtrl.$inject = ['$scope', '$q', 'txModel', 'catModel', 'acctModel'];

	angular.module('julep')
		.controller('TxCtrl', TxCtrl);
})();
