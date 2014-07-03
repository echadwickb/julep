julepApp.directive('julepDate', function (dateFilter) {
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function (scope, element, attr, ngModelCtrl) {

			ngModelCtrl.$formatters.unshift(function (modelValue) {
				return dateFilter(modelValue, 'yyyy-MM-dd');
			});

			ngModelCtrl.$parsers.unshift(function(viewValue) {
				var parts = viewValue.split("-");
				return new Date(parts[0], parts[1]-1, parts[2]);
			});
		}
	};
});

julepApp.directive('julepCurr', function () {
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function (scope, element, attr, ngModelCtrl) {

			ngModelCtrl.$formatters.unshift(function (modelValue) {

				if (modelValue == "-") {
					return modelValue
				} else {
					return (modelValue / 100).toFixed(2);
				}
			});

			ngModelCtrl.$parsers.unshift(function(viewValue) {

				if (viewValue == '-')
					return viewValue + '0';

				var i = parseFloat(viewValue);

				if (i != i) {
					return 0;
				} else {
					return viewValue * 100;
				}
			});
		}
	};
});

julepApp.directive('fileDialog', function () {
  return {
    restrict: 'A',
    link: function ($scope, element, attr) {

      element.bind('change', function () {

        try {

          console.info("Input element changed");
          var files = element[0].files;

          if (files.length > 0) {

            var file = files[0];
            console.info("file: %o", file);
            $scope.getFileContent(file);
          }

        } catch(exc) {
          console.error(exc);
        }

      });
    }
  };
});

/*
julepApp.directive('julepEditTable', function ($timeout) {
  return {
    restrict: 'A',
    link: function (scope, element, attr) {

      var UP_KEYPRESS = 38,
          DOWN_KEYPRESS= 40;

      element.on('keyup', function(event) {

        if (event.keyCode == UP_KEYPRESS) {
          console.info("we pressed up");
          scope.selectedTx = Math.max(scope.selectedTx - 1, 0);
        }

        if (event.keyCode == DOWN_KEYPRESS) {
          console.info("we pressed down");
          scope.selectedTx = Math.min(scope.selectedTx + 1, scope.txs.length);
        }

        event.stopPropagation();

        event.preventDefault();

      });


    }
  };
});
*/

julepApp.directive('julepEditRow', function() {
  return {
    restrict: 'A',
    scope: {
      tx: "=julepEditRow"
    },
    link: function (scope, element, attr) {

      var UP_KEYPRESS = 38,
          DOWN_KEYPRESS= 40,
          CTRL_E_KEYPRESS = 5,
          ESC_KEYPRESS = 27;

      element.on('keyup', function (event) {

        console.info("julep-edit-row detected keyup for " + event.keyCode);

        /*
        if (event.keyCode == UP_KEYPRESS) {

          if (element[0].previousElementSibling !== null) {
            element[0].previousElementSibling.focus();

            scope.tx.edit = false;
            scope.$apply();

            event.stopPropagation();

            event.preventDefault();
          }

        }

        if (event.keyCode == DOWN_KEYPRESS) {
          if (element[0].nextElementSibling !== null ) {
            element[0].nextElementSibling.focus();

            scope.tx.edit = false;
            scope.$apply();

            event.stopPropagation();

            event.preventDefault();
          }
        }
        */

        if (event.keyCode == ESC_KEYPRESS ) {
          scope.tx.edit = false;
          scope.$apply();
          element[0].focus();
        }
      });

      element.on('keypress', function (event) {

        console.info("julep-edit-row detected keypress for " + event.keyCode);

        if (event.keyCode == CTRL_E_KEYPRESS) {

          scope.tx.edit = true;

          scope.$apply();

          event.stopPropagation();

          event.preventDefault();
        }


      });

      scope.$watch('tx.edit', function (newValue, oldValue) {

        if (newValue) {

          // this feels like a dirty hack and will likely
          // break if/when I add more columns to the table
          element[0].children[4].children[0].focus();
          element[0].children[4].children[0].select();

        }

        if (!newValue && newValue !== oldValue) {
          element[0].focus();
        }

      });


    }
  };
});

julepApp.directive('julepSearch', ['$document',
  function($document) {
    return {
      restrict: 'A',
      link: function (scope, element, attr) {

        element[0].focus();
        var CTRL_F_KEYPRESS = 6,
            TAB_KEYPRESS = 9;

        angular.element($document[0].body).on('keypress', function(event) {
          console.info(event.keyCode);

          var input = element[0];

          if(event.keyCode == CTRL_F_KEYPRESS && document.activeElement != input) {

            event.stopPropagation();

            event.preventDefault();

            input.focus();
          }
        });
      }
    }
  }
]);

