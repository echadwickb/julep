(function () {

  'use strict';

  function AcctModel (db) {

    var acctModel = {};

    acctModel.getAll = function (cb) {
      db.then(function (db) {
        db.getAll('acct', cb);
      });
    };

    acctModel.save = function (acct) {
      db.then(function (db) {

        db.save('acct', acct);
      });
    };

    acctModel.get = function (acctId, cb) {
      db.then(function (db) {

        db.get('acct', acctId, cb);
      });
    };

    acctModel.remove = function (acctId, cb) {
      db.then(function (db) {

        db.remove('acct', acctId, cb);
      });
    };

    return acctModel;
  }

  AcctModel.$inject = ['db'];

  angular
    .module('julep')
    .factory('acctModel', AcctModel);

})();
