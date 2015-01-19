(function() {

  'use strict';

  function BdgtModel(db) {
    var bdgtModel = {};

    bdgtModel.getAll = function(cb) {

      return db.getAll('bdgt', cb);
    };

    bdgtModel.save = function(bdgt) {

      return db.save('bdgt', bdgt);
    };

    bdgtModel.get = function(bdgtId, cb) {

      return db.get('bdgt', bdgtId, cb);
    };

    bdgtModel.remove = function(bdgtId, cb) {

      return db.remove('bdgt', bdgtId, cb);
    };

    bdgtModel.new = function () {
      return {
        strt: new Date(),
        end: new Date(),
        acctIds: [],
        name: '',
        strtAmt: 0,
        endAmt: 0,
        totals: {
          bdgt: 0,
          spent: 0,
          avg: 0,
          last: 0
        },
        groups: {},
        changed: true
      };
    };

    return bdgtModel;
  }

  BdgtModel.$inject = ['db'];

  angular
    .module('julep')
    .factory('bdgtModel', BdgtModel);

})();
