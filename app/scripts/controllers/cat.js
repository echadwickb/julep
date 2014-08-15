(function () {

	'use strict';

	function CatCtrl($scope, catModel) {

		$scope.cats = [];

		$scope.keyUpSave = function (cat, $event) {
			if ($event.keyCode === 13) {
				$scope.saveCat(cat);
			}
		};

		$scope.saveCat = function (cat) {
			cat.edit = false;

			catModel.save(cat);
		};

		catModel.getAll(function (cats) {
			$scope.cats = cats;
			$scope.$apply();
		});
	}

	CatCtrl.$inject = ['$scope', 'catModel'];

	angular.module('julep')
		.controller('CatCtrl', CatCtrl);

})();
