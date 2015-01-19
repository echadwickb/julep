(function() {

  'use strict';

  // get transaction amount as integer
  function parseAmt(amt) {

    return parseInt(amt.replace(/[^0-9\.-]+/g, '') * 100, 10);
  };

  // returns -1 if signDesc = 'debit'
  function getSign(signDesc) {

    return (signDesc == 'debit') ? -1 : 1;
  }

  // using accountDesc, find a matching account by
  // account.name or match in account.aliases
  function matchAccount(_, accountDesc, accounts) {

      var acct = _.find(accounts, function (acct) {
        return acct.name == accountDesc || _.contains(acct.aliases, accountDesc);
      });

      return acct || false;
  };

  // assumes date format of mm/dd/yyyy
  function parseDate(d) {

    var dateParts = d.split('/');

    return new Date(dateParts[2], dateParts[0] - 1, dateParts[1]);
  };

  // figures out from the column headers the index of the data
  // columns
  function getColumnIndexes(headers) {

    var dataColumns = {};

    for (var i in headers) {
      if (headers[i] !== '') {
        dataColumns[headers[i]] = i;
      }
    }

    return dataColumns;
  };

  // returns distinct list of accounts from csv rows
  function getDistinctAccounts(_, csvRows, acctColIndex) {

    var distinctAccts = _.uniq(csvRows, false, function (item, key, acct) {

      return item[acctColIndex];
    });

    return _.pluck(distinctAccts, acctColIndex);

  };

  function getDataRows(_, csvRows) {

    return _.reject(csvRows, function (row ) {
      return row.ignore;
    });
  }

  function ImportTxCtrl($scope, $q, acctModel, txModel, d3, _) {

    $scope.csvRows = [];
    $scope.csvCols = [];
    $scope.accts = [];
    $scope.importResult = '';
    $scope.importFile = '';
    $scope.columnChoices = [
      { val: '', label: 'Ignore' },
      { val: 'date', label: 'Date' },
      { val: 'amt', label: 'Amount' },
      { val: 'desc', label: 'Description' },
      { val: 'cat', label: 'Category' },
      { val: 'amtType', label: 'Amount Type' },
      { val: 'acct', label: 'Account' }
    ];

    acctModel.getAll().then(function(accts) {
      $scope.accts = accts;
      // $scope.$apply();
    });

    $scope.selectImportFile = function() {
      // chrome.fileSystem.chooseEntry( {type: "openFile"}, getFileContent );
    };

    $scope.ignoreRow = function(r) {
      r.ignore = !r.ignore;
    };

    $scope.saveTx = function() {

      // get first row
      var headerRow = $scope.csvRows[0];

      // get the data columns with indexes
      var dataColumns = getColumnIndexes($scope.csvCols);
      var dataRows = getDataRows(_, $scope.csvRows);

      // create new accounts if necessary
      var csvAccts =
        getDistinctAccounts(_, dataRows, dataColumns['acct']);

      var newAccts = csvAccts.map(function (acctDesc) {

        var acct = matchAccount(_, acctDesc, $scope.accts);

        if (!acct) {
            return acctModel.save(acctModel.new(acctDesc, 0));
        }

        return acct;
      });

      $q.all(newAccts).then(function (newAccts) {

          $scope.accts = $scope.accts.concat(newAccts);

          console.info('accounts now %o', $scope.accts);

          for (var r in dataRows) {

              var csvRow = dataRows[r];

              var tx = {
                csv: csvRow,
                amt: parseAmt(csvRow[dataColumns['amt']])
                * getSign(csvRow[dataColumns['amtType']]),
                desc: csvRow[dataColumns['desc']],
                cat: []
              };

              tx.date = parseDate(csvRow[dataColumns['date']]);

              tx.cat.push({
                cat: csvRow[dataColumns['cat']],
                amt: tx.amt
              });

              var acct = matchAccount(
                            _,
                            csvRow[dataColumns['acct']].trim(),
                            $scope.accts
                        );

              tx['acctId'] = acct.id || 0;
              txModel.save(tx);
          }

          txModel.rebuildBalances().then( function () {

            $scope.importResult = 'Imported csv';
          });

        },
        function (e) { console.error(e); },
        function (e) { console.info(e); }
      );

    };

    $scope.getFileContent = function(file) {

      var reader = new FileReader();

      reader.onloadend = function(event) {

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

  ImportTxCtrl.$inject = ['$scope', '$q', 'acctModel', 'txModel', 'd3', '_'];

  angular.module('julep')
    .controller('ImportTxCtrl', ImportTxCtrl);
})();
