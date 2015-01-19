(function () {

  'use strict';

  function AcctModel (db, $q) {

    var acctModel = {};

    acctModel.getAll = function (cb) {

      return db.getAll('acct', cb);
    };

    acctModel.save = function (acct) {

      return db.save('acct', acct);
    };

    acctModel.new = function (name, strtBal) {

      return {
        name: name,
        strtBal: strtBal,
        currBal: 0,
        aliases: [name]
      };
    }
    acctModel.get = function (acctId, cb) {

      return db.get('acct', acctId, cb);
    };

    acctModel.remove = function (acctId, cb) {

      return db.remove('acct', acctId, cb);
    };

    return acctModel;
  }

  AcctModel.$inject = ['db', '$q'];

  angular
    .module('julep')
    .factory('acctModel', AcctModel);

})();
