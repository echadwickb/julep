(function () {

  'use strict';

  function JulepDate (dateFilter) {

    return {
      restrict: 'A',
      require: 'ngModel',
      link: function (scope, element, attr, ngModelCtrl) {

        ngModelCtrl.$formatters.unshift(function (modelValue) {
          return dateFilter(modelValue, 'yyyy-MM-dd');
        });

        ngModelCtrl.$parsers.unshift(function(viewValue) {
          var parts = viewValue.split('-');
          return new Date(parts[0], parts[1]-1, parts[2]);
        });
      }
    };
  }

  JulepDate.$inject = ['dateFilter'];

  angular.module('julep')
    .directive('julepDate', JulepDate);

})();
