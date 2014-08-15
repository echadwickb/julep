(function () {

	'use strict';

	function CatModel(db) {

		var catModel = {};

		catModel.getAll = function (cb) {

			db.then(function (db) {

				db.getAll('cat', cb);
			});
		};

		catModel.save = function (cat) {

			db.then(function (db) {

				db.save('cat', cat);
			});
		};

		catModel.get = function (cat, cb) {

			db.then(function (db) {

				db.get('cat', cat, cb);
			});
		};

		catModel.remove = function (cat, cb) {

			db.then(function (db) {

				db.remove('cat', cat, cb);
			});
		};

		return catModel;
	}

	CatModel.$inject = ['db'];

	angular
		.module('julep')
		.factory('catModel', CatModel);

})();
