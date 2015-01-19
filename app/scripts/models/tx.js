(function () {

	'use strict';

	function TxModel(db) {

		var txModel = {};

		txModel.getAll = function (cb) {

			return db.getAll('tx', cb);
		};

		txModel.save = function (tx) {

			// this prevents any unnecessary properties
			// from persisting
			var tempTx = {
				acctId: tx.acctId,
				amt: tx.amt,
				id: tx.id,
				cat: tx.cat,
				csv: tx.csv,
				date: tx.date,
				desc: tx.desc
			}

			return db.save('tx', tempTx);
		};

		txModel.get = function (id, cb) {

			return db.get('tx', id, cb);
		};

		txModel.remove = function (id, cb) {

			return db.remove('tx', id, cb);
		};

		txModel.removeByIndex = function (idx, idxValue, cb) {

			return db.removeByIndex('tx', idx, idxValue, cb);
		};

		return txModel;

	}

	TxModel.$inject = ['db'];

	angular
		.module('julep')
		.factory('txModel', TxModel);


})();
