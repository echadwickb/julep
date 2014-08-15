(function() {

  'use strict';

  function AcctCtrl($scope, acctModel) {

    $scope.accts = [];

    acctModel.getAll(function(accts) {

      for (var acctId in accts) {
        $scope.accts.push(accts[acctId]);
      }

      // $scope.accts = accts;
      $scope.$apply();
    });

    $scope.addAcct = function() {

      var acct = {
        name: '',
        strtBal: 0,
        currBal: 0,
        edit: true
      };

      $scope.accts.push(acct);
    };

    $scope.keyUpSave = function(acct, $event) {
      if ($event.keyCode === 13) {
        $scope.saveAcct(acct);
      }
    };

    $scope.saveAcct = function(acct) {

      acct.edit = false;

      acctModel.save(acct);
    };
  }

  AcctCtrl.$inject = ['$scope', 'acctModel'];

  angular
    .module('julep')
    .controller('AcctCtrl', AcctCtrl);

})();
