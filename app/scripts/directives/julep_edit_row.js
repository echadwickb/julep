(function () {

  'use strict';

  function JulepEditRow () {

    return {
      restrict: 'A',
      scope: {
        tx: '=julepEditRow'
      },
      link: function (scope, element) {

        // UP_KEYPRESS = 38,
        // DOWN_KEYPRESS= 40,
        var CTRL_E_KEYPRESS = 5,
            ESC_KEYPRESS = 27;

        element.on('keyup', function (event) {

          console.info('julep-edit-row detected keyup for ' + event.keyCode);

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

          if (event.keyCode === ESC_KEYPRESS ) {
            scope.tx.edit = false;
            scope.$apply();
            element[0].focus();
          }
        });

        element.on('keypress', function (event) {

          console.info('julep-edit-row detected keypress for ' + event.keyCode);

          if (event.keyCode === CTRL_E_KEYPRESS) {

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
  }

  angular.module('julep')
    .directive('julepEditRow', JulepEditRow);

})();
