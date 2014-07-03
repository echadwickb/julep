julepApp.factory('bdgtModel', ['db', function (db) {

	var bdgtModel = {};

	bdgtModel.getAll = function (cb) {

		var bdgts = [];

		db.then(function (db) {

			db.getStore('bdgt', 'readonly').openCursor().onsuccess = function(event) {

				var c = event.target.result;

				if (c) {
					bdgts.push(c.value);
					c.continue();
				} else {
					console.info("Finished retrieving budgets");
					cb(bdgts);
				}
			};
		});
	};

	bdgtModel.save = function (bdgt) {
		db.then(function (db) {

			var bdgtStore = db.getStore('bdgt', 'readwrite');

			var putReq;

			try {
				console.info("bdgt: %O", bdgt);
				putReq = bdgtStore.put(bdgt);
			} catch(e) {
				throw e;
			}

			putReq.onsuccess = function() { console.info("saved %O", bdgt); };
			putReq.onerror = function() { console.info("error saving %O", bdgt); };
		});
	};

	bdgtModel.get = function(bdgtId, cb) {
		db.then(function (db) {
			db.getStore("bdgt", "readonly").get(bdgtId).onsuccess = function (event) {
				var bdgt = event.target.result;

				cb(bdgt);
			};
		});
	};

	return bdgtModel;
}]);

julepApp.factory('acctModel', ['db', function (db) {

	var acctModel = {};

	acctModel.getAll = function (cb) {
		var accts = [];
		db.then(function (db) {
			db.getStore('acct', 'readonly').openCursor().onsuccess = function(event) {

				var c = event.target.result;

				if (c) {
					// accts[c.value.id] = c.value;
          accts.push(c.value);

					c.continue();
				} else {
					console.info("Finished retrieving accounts");
					cb(accts);
				}
			};
		});
	};

	acctModel.save = function (acct) {
		db.then(function (db) {
			var acctStore = db.getStore('acct', 'readwrite');

			var putReq;

			try {
				delete acct.edit;

				putReq = acctStore.put(acct);

			} catch(e) {
				throw e;
			}

			putReq.onsuccess = function() { console.info("saved %O", acct); };
			putReq.onerror = function() { console.info("error saving %O", acct); };
		});
	};

	acctModel.get = function(acctId, cb) {
		db.then(function (db) {
			db.getStore("acct", "readonly").get(acctId).onsuccess = function (event) {
				var acct = event.target.result;

				cb(acct);
			};
		});
	};

	return acctModel
}]);

julepApp.factory('txModel', ['db', 'acctModel', function (db, acctModel) {

	var txModel = {};

	txModel.save = function (tx) {
		db.then( function (db) {

			var putReq;

			try {
				putReq = db.getStore('tx', 'readwrite').put(tx);
			} catch(e) {
				throw e;
			}

			putReq.onerror = function() { console.info("error saving %O", tx); };
		});
	};

	txModel.getAll = function (cb) {

		acctModel.getAll(function (accts) {

			console.info(accts);
			var acctBals = {},
				txs = [];

			console.info('accts: %o', accts);

			for (var i in accts) {
        acctBals[accts[i].id] = accts[i].strtBal;
			}

      console.info("Accounts: %O", acctBals);

			db.then(function (db) {
				db.getStore('tx', 'readonly').index("date").openCursor().onsuccess = function(event) {

					var c = event.target.result;

					if (c) {
						acctBals[c.value.acctId] += c.value.amt;

						c.value.balance = acctBals[c.value.acctId];

						txs.push(c.value);

						c.continue();
					} else {
						console.info("Finished iterating over records");

						cb(txs);
					}

				};
			});
		});
	};

	return txModel;
}]);

julepApp.factory('catModel', ['db', function (db) {

	var catModel = {};

	catModel.save = function (cat) {
		db.then(function (db) {

			var putReq;

			try {
				delete cat.edit;

				putReq = db.getStore('cat', 'readwrite').put(cat);

			} catch(e) {
				throw e;
			}

			putReq.onsuccess = function() { console.info("saved %O", cat); };
			putReq.onerror = function() { console.info("error saving %O", cat); };
		});
	};

	catModel.getAll = function (cb) {
		db.then(function (db) {

			var txCats = [];
			var cats = [];

			db.getStore('tx', 'readonly')
				.index("cat")
				.openKeyCursor(null, 'nextunique')
				.onsuccess = function(event) {

				var c = event.target.result;

				if (c) {

					txCats.push(c.key);

					c.continue();
				} else {
					console.info("Got unique list of tx categories");

					db.getStore('cat', 'readonly')
						.openCursor()
						.onsuccess = function (event) {

						var c = event.target.result;

						if (c) {
							cats.push(c.value);

              var txCatIndex = txCats.indexOf(c.value.cat);
              if (txCatIndex > -1)
  							txCats.splice(txCatIndex, 1);

              c.continue();

						} else {
							console.info("Finished pulling categories");

							for (i=0;i<txCats.length;i++) {
								cats.push(
									{ group: 'ungrouped', cat: txCats[i] }
								);
							}

							cb(cats);
						}
					};
				}

			};
		});
	};

	return catModel;
}]);
