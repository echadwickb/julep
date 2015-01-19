(function () {

  'use strict';

  function FileDialog () {

    return {
      restrict: 'A',
      link: function ($scope, element) {

        element.bind('change', function () {

          try {

            console.info('Input element changed');
            var files = element[0].files;

            if (files.length > 0) {

              var file = files[0];
              // console.info('file: %o', file);
              $scope.getFileContent(file);
            }

          } catch(exc) {
            console.error(exc);
          }

        });
      }
    };
  }

  angular.module('julep')
    .directive('fileDialog', FileDialog);

})();
