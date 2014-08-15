(function () {

  'use strict';

  function JulepSearch ($document) {

    return {

      restrict: 'A',
      link: function (scope, element) {

        element[0].focus();
        var CTRL_F_KEYPRESS = 6;
            // TAB_KEYPRESS = 9;

        angular.element($document[0].body).on('keypress', function(event) {
          console.info(event.keyCode);

          var input = element[0];

          if(event.keyCode === CTRL_F_KEYPRESS && document.activeElement !== input) {

            event.stopPropagation();

            event.preventDefault();

            input.focus();
          }
        });
      }
    };
  }

  JulepSearch.$inject = ['$document'];

  angular.module('julep')
    .directive('julepSearch', JulepSearch);

})();
