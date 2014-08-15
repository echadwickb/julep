(function () {

	'use strict';

	function TxModel(db) {

		var txModel = {};

		txModel.getAll = function (cb) {

			db.then(function (db) {

				db.getAll('tx', cb);
			});
		};

		txModel.save = function (cat) {

			db.then(function (db) {

				db.save('tx', cat);
			});
		};

		txModel.get = function (id, cb) {

			db.then(function (db) {

				db.get('tx', id, cb);
			});
		};

		txModel.remove = function (id, cb) {

			db.then(function (db) {

				db.remove('tx', id, cb);
			});
		};

		return txModel;

	}

	TxModel.$inject = ['db'];

	angular
		.module('julep')
		.factory('txModel', TxModel);


})();
