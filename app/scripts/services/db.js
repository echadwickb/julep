(function() {

  'use strict';

  function Db($q) {

    var db,
      name = 'julep',
      version = 3,
      deferred = $q.defer();

    var req = indexedDB.open(name, version);

    req.onsuccess = function() {
      db = this.result;

      db.onerror = function(event) {
        console.error('DB error: %O', event.target.errorCode);
      };

      // Starts and returns a transaction in the
      // requested mode
      db.getStore = function(name, mode) {
        var transaction = db.transaction(name, mode || 'readonly').objectStore(name);

        transaction.onerror = function(event) {
          console.error('Transaction error: %O', event.target.errCode);
        };

        return transaction;
      };

      // passes all records from object store to
      // provided callback as array
      db.getAll = function(store, cb) {

        var coll = [];

        db.getStore(store, 'readonly').openCursor().onsuccess = function(event) {

          var c = event.target.result;

          if (c) {

            coll.push(c.value);
            c.continue();

          } else {

            cb(coll);
          }
        };

      };

      // passes object found by provided id to
      // provided callback
      db.get = function(store, id, cb) {

        db.getStore(store, 'readonly').get(id).onsuccess = function(event) {

          var item = event.target.result;

          cb(item);
        };
      };

      // saves object to datastore
      db.save = function(store, item, cb) {

        var s = db.getStore(store, 'readwrite');

        var putReq;

        try {

          putReq = s.put(item);
        } catch (e) {
          throw e;
        }

        putReq.onsuccess = function() {
          console.info('saved %O', item);

          if (cb) {
						cb(item);
					}

        };

        putReq.onerror = function() {
          console.info('error saving %O', item);
        };
      };

      // removes object from datastore
      db.remove = function(store, id, cb) {
        var s = db.getStore(store, 'readwrite');

        var removeReq;

        try {
          removeReq = s.delete(id);
        } catch (e) {
          throw e;
        }

        removeReq.onsuccess = function() {
          console.info('removed item ' + id);

          if (cb) {
						cb(id);
					}

        };

        removeReq.onerror = function() {
          console.info('error removing item ' + id);
        };
      };

      deferred.resolve(db);

      console.info('Opened db %s ver %s', name);
    };

    req.onerror = function(event) {
      console.error('Error opening db %s ver %s: %s',
        name, version, event.target.errorCode);
    };

    req.onupgradeneeded = function(event) {

      console.info('Upgrading db %s to version %s', name, version);



      if (event.oldVersion < 1) {

				var txStore = event.currentTarget.result.createObjectStore(
          'tx', {
            keyPath: 'id',
            autoIncrement: true
          }
        );

        txStore.createIndex('date', 'date', {
          unique: false
        });
        txStore.createIndex('cat', 'cat', {
          unique: false
        });

        var acctStore = event.currentTarget.result.createObjectStore(
          'acct', {
            keyPath: 'id',
            autoIncrement: true
          }
        );

        acctStore.createIndex('name', 'name', {
          unique: false
        });

        var catStore = event.currentTarget.result.createObjectStore(
          'cat', {
            keyPath: 'cat'
          }
        );

        catStore.createIndex('group', 'group', {
          unique: false
        });
        catStore.createIndex('cat', 'cat', {
          unique: true
        });
      }

      if (event.oldVersion < 2) {
        var bdgtStore = event.currentTarget.result.createObjectStore(
          'bdgt', {
            keyPath: 'id',
            autoIncrement: true
          }
        );

        bdgtStore.createIndex('strt', 'strt', {
          unique: false
        });
        bdgtStore.createIndex('end', 'end', {
          unique: false
        });
      }

      if (event.oldVersion < 3) {
        var txStore3 = event.currentTarget.transaction.objectStore('tx');
        txStore3.createIndex('acctId', 'acctId', {
          unique: false
        });
      }
    };

    return deferred.promise.then(function(db) {
      return db;
    });
  }

  Db.$inject = ['$q'];

  angular.module('julep')
    .factory('db', Db);

})();
