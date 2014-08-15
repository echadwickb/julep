(function() {

  'use strict';

  function BdgtModel(db) {
    var bdgtModel = {};

    bdgtModel.getAll = function(cb) {

      db.then(function(db) {

        db.getAll('bdgt', cb);
      });
    };

    bdgtModel.save = function(bdgt) {

      db.then(function(db) {

        db.save('bdgt', bdgt);
      });
    };

    bdgtModel.get = function(bdgtId, cb) {

      db.then(function(db) {

        db.get('bdgt', bdgtId, cb);
      });
    };

    bdgtModel.remove = function(bdgtId, cb) {

      db.then(function(db) {

        db.remove('bdgt', bdgtId, cb);
      });
    };

    return bdgtModel;
  }

  BdgtModel.$inject = ['db'];

  angular
    .module('julep')
    .factory('bdgtModel', BdgtModel);

})();
