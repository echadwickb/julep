(function () {

	'use strict';

	function CatModel(db) {

		var catModel = {};

		catModel.getAll = function (cb) {

			return db.getAll('cat', cb);
		};

		catModel.save = function (cat) {

			return db.save('cat', cat);
		};

		catModel.get = function (cat, cb) {

			return db.get('cat', cat, cb);
		};

		catModel.remove = function (cat, cb) {

			return db.remove('cat', cat, cb);
		};

		return catModel;
	}

	CatModel.$inject = ['db'];

	angular
		.module('julep')
		.factory('catModel', CatModel);

})();
