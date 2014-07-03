julepApp.factory('db', ['$q', function ($q) {
	var db,
		name = 'julep',
		version = 2
		deferred = $q.defer();

	var req = indexedDB.open(name, version);

	req.onsuccess = function (event) {
		db = this.result;

		db.onerror = function(event) {
			console.error("DB error: %O", event.target.errorCode);
		};

		db.getStore = function (name, mode) {
			var transaction = db.transaction(name, mode || 'readonly').objectStore(name);

			transaction.onerror = function (event) {
				console.error("Transaction error: %O", event.target.errCode);
			};

			return transaction;
		};

		deferred.resolve(db);

		console.info("Opened db %s ver %s", name);
	};

	req.onerror = function (event) {
		console.error("Error opening db %s ver %s: %s",
			name, version, event.target.errorCode);
	};

	req.onupgradeneeded = function (event) {

		console.info("Upgrading db %s to version %s", name, version);

		if (event.oldVersion < 1) {
			var txStore = event.currentTarget.result.createObjectStore(
				'tx', {	keyPath: 'id', autoIncrement: true }
			);

			txStore.createIndex('date', 'date', { unique: false });
			txStore.createIndex('cat', 'cat', { unique: false });

			var acctStore = event.currentTarget.result.createObjectStore(
				'acct', { keyPath: 'id', autoIncrement: true }
			);

			acctStore.createIndex('name', 'name', { unique: false });

			var catStore = event.currentTarget.result.createObjectStore(
				'cat', { keyPath: 'cat' }
			);

			catStore.createIndex('group', 'group', { unique: false });
			catStore.createIndex('cat', 'cat', { unique: true });
		}

		if (event.oldVersion < 2) {
			var bdgtStore = event.currentTarget.result.createObjectStore(
				'bdgt', { keyPath: 'id', autoIncrement: true }
			);

			bdgtStore.createIndex('strt', 'strt', { unique: false });
			bdgtStore.createIndex('end', 'end', { unique: false });
		}
	}

	return deferred.promise.then(function (db) {
		return db;
	});
}]);
