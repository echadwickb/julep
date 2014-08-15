(function () {

  'use strict';

  function JulepCurr () {

    return {
      restrict: 'A',
      require: 'ngModel',
      link: function (scope, element, attr, ngModelCtrl) {

        ngModelCtrl.$formatters.unshift(function (modelValue) {

          if (modelValue === '-') {
            return modelValue;
          } else {
            return (modelValue / 100).toFixed(2);
          }
        });

        ngModelCtrl.$parsers.unshift(function(viewValue) {

          if (viewValue === '-') {
            return viewValue + '0';
          }

          var i = parseFloat(viewValue);

          if (i !== i) {
            return 0;
          } else {
            return viewValue * 100;
          }
        });
      }
    };
  }

  angular.module('julep')
    .directive('julepCurr', JulepCurr);

})();
