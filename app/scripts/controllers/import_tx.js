(function() {

  'use strict';

  function ImportTxCtrl($scope, acctModel, txModel, d3) {

    $scope.csvRows = [];
    $scope.csvCols = [];
    $scope.accts = [];
    $scope.importResult = '';
    $scope.importFile = '';

    acctModel.getAll(function(accts) {
      $scope.accts = accts;
      $scope.$apply();
    });

    $scope.selectImportFile = function() {



      // chrome.fileSystem.chooseEntry( {type: "openFile"}, getFileContent );
    };

    $scope.ignoreRow = function(r) {
      r.ignore = !r.ignore;
    };

    $scope.saveTx = function() {
      console.info('called saveTx');

      for (var r in $scope.csvRows) {

        var csvRow = $scope.csvRows[r];

        if (!csvRow.ignore) {

          var tx = {
            acctId: $scope.acctId
          };

          for (var i in $scope.csvCols) {

            if ($scope.csvCols[i] === 'date') {

              var dateParts = csvRow[i].split('/');

              tx.date = new Date(dateParts[2], dateParts[0] - 1, dateParts[1]);

            } else if ($scope.csvCols[i] === 'amt') {

              tx.amt = parseInt(csvRow[i].replace(/[^0-9\.-]+/g, '') * 100, 10);
            } else if ($scope.csvCols[i] === 'desc') {

              var desc = tx.desc || '';
              tx.desc = (desc + ' ' + csvRow[i]).trim();
            } else if ($scope.csvCols[i] !== '') {

              tx[$scope.csvCols[i]] = csvRow[i];
            }
          }

          txModel.save(tx);
        }
      }

      $scope.importResult = 'Imported csv';
    };

    $scope.getFileContent = function(file) {

      var reader = new FileReader();

      reader.onloadend = function(event) {

        console.info('Are we doing anything??? %o', event);
        var maxColCount = 0;
        // var rows = [];

        d3.csv.parseRows(
          this.result,
          function(r) {
            $scope.csvRows.push(r);
            maxColCount = Math.max(maxColCount, r.length);
          }
        );

        for (var i = 0; i < maxColCount; i++) {
          $scope.csvCols.push('');
        }

        $scope.$apply($scope.csvRows);
        $scope.$apply($scope.csvCols);

      };

      reader.onerror = function(e) {
        console.error(e);
      };

      reader.onloadstart = function(e) {
        console.info(e);
      };

      reader.onprogress = function(e) {
        console.info(e);
      };

      reader.onabort = function(e) {
        console.info(e);
      };

      reader.readAsText(file);
    };
  }

  ImportTxCtrl.$inject = ['$scope', 'acctModel', 'txModel', 'd3'];

  angular.module('julep')
    .controller('ImportTxCtrl', ImportTxCtrl);
})();
