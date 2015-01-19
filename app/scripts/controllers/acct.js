(function() {

  'use strict';

  function parseAmt(amt) {

    return parseInt(amt.replace(/[^0-9\.-]+/g, '') * 100, 10);
  };

  function AcctCtrl($scope, acctModel, txModel) {

    $scope.accts = [];

    acctModel.getAll().then(function (result) {
        $scope.accts = result;
    });

    $scope.addAcct = function() {

      $scope.accts.push(acctModel.new('', 0));
    };

    $scope.keyUpSave = function(acct, $event) {
      if ($event.keyCode === 13) {

        acct.strtBal = parseAmt(acct.strtBal);
        acct.currBal = parseAmt(acct.currBal);
        $scope.saveAcct(acct);
      }
    };

    $scope.saveAcct = function(acct) {

      acct.edit = false;

      acctModel.save(acct);
    };

    $scope.deleteTxs = function(acct) {

      var index = $scope.accts.indexOf(acct);

      txModel.removeByIndex('acctId', acct.id, function() {

        acctModel.remove(acct.id, function () {

          $scope.accts.splice(index, 1);

          $scope.$apply();
        });
      });
    };
  }

  AcctCtrl.$inject = ['$scope', 'acctModel', 'txModel'];

  angular
    .module('julep')
    .controller('AcctCtrl', AcctCtrl);

})();
