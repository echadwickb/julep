var julepControllers = angular.module('julepControllers', []);

julepControllers.controller('navCtrl', ['$scope', '$location',
	function ($scope, $location) {

		$scope.goTo = function (path) {
			console.info('Navigating to %s', path);

			$location.path(path);
		};

		$scope.navs = [
			{ path: '/', label: 'Transactions' },
			{ path: '/category', label: 'Categories' },
			{ path: '/budget', label: 'Budgets' },
			{ path: '/import_tx', label: 'Import Transactions' },
			{ path: '/account', label: 'Accounts' }
		];
	}
]);

julepControllers.controller('BdgtCtrl',
	['$scope', 'acctModel', 'txModel', 'catModel', 'bdgtModel',
	function ($scope, acctModel, txModel, catModel, bdgtModel) {

		$scope.bdgts = [];
		$scope.bdgt = {};
		$scope.accts = [];

		acctModel.getAll(function (accts) {
				$scope.accts = accts;
				$scope.$apply();
			});

		bdgtModel.getAll(function (bdgts) {
			$scope.bdgts = bdgts;
			$scope.$apply();
		});

		$scope.addBdgt = function () {

			$scope.bdgt = {
				strt: new Date(),
				end: new Date(),
				name: '',
				strtAmt: 0,
				endAmt: 0,
				totals: {
					bdgt: 0,
					spent: 0,
					avg: 0,
					last: 0
				},
				groups: [],
				changed: true
			};

			$scope.bdgts.push($scope.bdgt);
		};

		$scope.loadBdgt = function (bdgt) {

			aggTxs(bdgt, function (bdgt) {
				$scope.bdgt = bdgt;
				$scope.$apply();
			});
		};

		$scope.updateBdgt = function (bdgt, $event) {

				// get updated numbers
				bdgt = aggTxs(bdgt, function (bdgt) {

          bdgtModel.save(bdgt);
					bdgt.changed = false;
				});
		};

    $scope.moveGroup = function (groups, index, dir) {
      console.info("Groups before move %o", groups);
      var group = groups.splice(index, 1)[0];
      groups.splice(index + dir, 0, group);
      console.info("Groups after move %o", groups);
    };

		$scope.moveOrder = function (group, item, d) {

			console.info("moving %O", item);

			var oldOrder = item.order;
			var newOrder = item.order + d;
			if (newOrder >= 0) {

				for (var i in group) {

					if (d < 0 && group[i].order < oldOrder && group[i].order >= newOrder) {

						group[i].order++;
					}

					if (d > 0 && group[i].order > oldOrder && group[i].order <= newOrder) {

						group[i].order--;
					}
				}

				item.order = newOrder;
			}

			console.info('finished reordering: %O', group);

		};

		$scope.updateCat = function (cat, group , bdgt, $event) {

			group.bdgt = group.cats.reduce(function (p, c) {
				return p + c.bdgt;
			}, 0);

			bdgt.totals.bdgt = bdgt.groups.reduce(function (p, c) {
				return p + c.bdgt;
			}, 0);
		};

		// sums txs for bdgt date range by group/category
		var aggTxs = function (bdgt, cb) {

      var STRTLASTYR = new Date(
					bdgt.strt.getFullYear() -1,
					bdgt.strt.getMonth(),
					bdgt.strt.getDate()
				);

      var ENDLASTYR = new Date(
                bdgt.end.getFullYear() -1,
                bdgt.end.getMonth(),
                bdgt.end.getDate()
              );

      var LASTSIXMOS = new Date(
                bdgt.strt.getFullYear(),
                bdgt.strt.getMonth()-6,
                bdgt.strt.getDate()
              );

      var LASTMO = new Date(
                bdgt.strt.getFullYear(),
                bdgt.strt.getMonth()-1,
                bdgt.strt.getDate()
              );

			// create associative array of categories
			var assocCats = {
				uncategorized: {
							order: 10000,
							group: 'ungrouped',
							cat: 'uncategorized',
							bdgt: 0,
							spent: 0,
							avg: 0,
							last: 0,
							lastYr: 0
						}
			};

			var assocGroups = {};

			catModel.getAll(function (categories) {
				for (c in categories) {

					assocCats[categories[c].cat] = {
							order: 0,
							group: categories[c].group,
							cat: categories[c].cat,
							bdgt: 0,
							spent: 0,
							avg: 0,
							last: 0,
							lastYr: 0,
							show: true
						};
				}
			});

			txModel.getAll(function (txs) {

				// aggregate transactions into categories
				for (var i in txs) {

					if (txs[i].acctId == bdgt.acctId) {

						txs[i].cat = txs[i].cat || 'uncategorized';

						if (txs[i].date >= STRTLASTYR && txs[i].date <= ENDLASTYR) {

							assocCats[txs[i].cat].lastYr += txs[i].amt;

						} else if (txs[i].date >= LASTSIXMOS && txs[i].date < LASTMO) {

							assocCats[txs[i].cat].avg += txs[i].amt;

						} else if (txs[i].date >= LASTMO && txs[i].date < bdgt.strt) {

							assocCats[txs[i].cat].last += txs[i].amt;

							bdgt.strtAmt = txs[i].balance;

						} else if (txs[i].date >= bdgt.strt && txs[i].date < bdgt.end) {

							assocCats[txs[i].cat].spent += txs[i].amt;
						}
					}
				}

				// mix in budget numbers and category order from saved budget
				for (var i in bdgt.groups) {

					for (var z in bdgt.groups[i].cats) {

						assocCats[bdgt.groups[i].cats[z].cat].bdgt = bdgt.groups[i].cats[z].bdgt;
						assocCats[bdgt.groups[i].cats[z].cat].order = bdgt.groups[i].cats[z].order;
						assocCats[bdgt.groups[i].cats[z].cat].show = bdgt.groups[i].cats[z].show || true;
					}
				}

				// reset budget totals
				bdgt.totals = {
					bdgt: 0,
					spent: 0,
					avg: 0,
					last: 0,
					lastYr: 0
				};

				// aggregate into groups and total budget
				for (var i in assocCats) {

					assocGroups[assocCats[i].group] = assocGroups[assocCats[i].group] || {
						cats: {},
						bdgt: 0,
						spent: 0,
						avg: 0,
						last: 0,
						lastYr: 0,
						show: true
					};

					assocGroups[assocCats[i].group].cats[assocCats[i].cat] = assocCats[i];

					assocGroups[assocCats[i].group].bdgt += assocCats[i].bdgt;
					assocGroups[assocCats[i].group].spent += assocCats[i].spent;
					assocGroups[assocCats[i].group].last += assocCats[i].last;
					assocGroups[assocCats[i].group].lastYr += assocCats[i].lastYr;
					assocGroups[assocCats[i].group].avg += assocCats[i].avg;

					bdgt.totals.bdgt += assocCats[i].bdgt;
					bdgt.totals.spent += assocCats[i].spent;

				};

				// mix in group order from saved budget
				for (var i in bdgt.groups) {
					assocGroups[bdgt.groups[i].group].order = bdgt.groups[i].order;
					assocGroups[bdgt.groups[i].group].show = bdgt.groups[i].show || true;
				}

				bdgt.groups = [];

        var orderCounter = 0;
				// convert to array
				for (var i in assocGroups) {

					var cats = [];
					for (var z in assocGroups[i].cats) {
						cats.push(assocGroups[i].cats[z]);
					}

					bdgt.groups.push({
						group: i,
						order: assocGroups[i].order || orderCounter,
						bdgt: assocGroups[i].bdgt,
						spent: assocGroups[i].spent,
						avg: assocGroups[i].avg,
						last: assocGroups[i].last,
						lastYr: assocGroups[i].lastYr,
						show: assocGroups[i].show,
						cats: cats
					});

          orderCounter++;
				}

				if (typeof cb != 'undefined') {

					cb(bdgt);
				}
			});
		};

		$scope.setBudget = function (amt, cat, group, bdgt) {
			cat.bdgt = amt;

			$scope.updateCat(cat, group, bdgt);
		};

	}
]);

julepControllers.controller('CatCtrl', ['$scope', 'catModel',
	function ($scope, catModel) {

		$scope.cats = [];

		$scope.keyUpSave = function (cat, $event) {
			if ($event.keyCode == 13) {
				$scope.saveCat(cat);
			}
		};

		$scope.saveCat = function (cat) {
			cat.edit = false;

			catModel.save(cat);
		};

		catModel.getAll(function (cats) {
			$scope.cats = cats;
			$scope.$apply();
		});

	}
]);

julepControllers.controller('AcctCtrl', ['$scope', 'acctModel',
	function ($scope, acctModel) {
		$scope.accts = [];

		acctModel.getAll(function(accts) {

      console.info(accts);
      for (acctId in accts) {
        $scope.accts.push(accts[acctId]);
      };
      console.info($scope.accts);
      // $scope.accts = accts;
      $scope.$apply();
    });

		$scope.addAcct = function () {

			var acct = {
				name: "",
				strtBal: 0,
				currBal: 0,
				edit: true
			};

			$scope.accts.push(acct);
		};

		$scope.keyUpSave = function (acct, $event) {
			if ($event.keyCode == 13) {
				$scope.saveAcct(acct);
			}
		};

		$scope.saveAcct = function (acct) {

			acct.edit = false;

			acctModel.save(acct);
		};
	}
]);

julepControllers.controller('TxCtrl', ['$scope', 'txModel', 'catModel', 'acctModel',

	function ($scope, txModel, catModel, acctModel) {

    var allTxs = [];

    $scope.selectedTx = 0;
    $scope.txs = [];
		$scope.search = '';
		$scope.from = null;
		$scope.to = null;
		$scope.uncategorized = false;
		$scope.pageShow = 25;
    $scope.cats = [];
    $scope.accts = [];
    $scope.acctsById = [];
    $scope.acctId = '';

		txModel.getAll(function (txs) {
			allTxs = txs;
      // $scope.txs = txs;
      // $scope.$apply();
      $scope.txFilter();
      $scope.$apply();
		});

    catModel.getAll(function (cats) {
			$scope.cats = cats;
			$scope.$apply();
		});

    acctModel.getAll(function (accts) {
			$scope.accts = accts;
      for (i in accts) {
        $scope.acctsById[accts[i].id] = accts[i];
      }
      console.info($scope.acctsById);

      $scope.$apply();
		});

    $scope.updateTxCat = function (tx, $event) {

      // we cancelled account
      if ($event.keyCode == 27) {
        tx.edit = false;
      };

      // save on enter
			if ($event.keyCode == 13) {

        // is this a new category? then save it

        console.info('Saving tx: %O', tx);
        delete tx.edit;
				txModel.save(tx);
        tx.edit = false;
			}
		};

    $scope.txFilter = function () {

      $scope.txs = [];

      angular.forEach(allTxs, function(tx, key) {

        var add = true;

        if ($scope.from != null && tx.date < $scope.from) add = false;
        if ($scope.to != null && tx.date > $scope.to) add = false;
        if ($scope.uncategorized && (typeof tx.cat != 'undefined' || tx.cat == '')) add = false;
        if ($scope.acctId != '' && $scope.acctId != tx.acctId) add = false;

        if (add) $scope.txs.push(tx);

      });

    };

    $scope.setSelectedRow = function (i) {
      $scope.selectedTx = i;
    };
	}
]);

julepControllers.controller('ImportTxCtrl', ['$scope', 'acctModel', 'txModel',
	function ($scope, acctModel, txModel) {

		$scope.csvRows = [];
		$scope.csvCols = [];
		$scope.accts = [];
		$scope.importResult = "";
    $scope.importFile = "";

		acctModel.getAll(function (accts) {
			$scope.accts = accts;
			$scope.$apply();
		});

		$scope.selectImportFile = function() {



			// chrome.fileSystem.chooseEntry( {type: "openFile"}, getFileContent );
		};

		$scope.ignoreRow = function(r) {
			r['ignore'] = !r['ignore'];
		};

		$scope.saveTx = function() {
			console.info("called saveTx");

			for (var r in $scope.csvRows) {

				var csvRow = $scope.csvRows[r];

				if (!csvRow['ignore']) {

					var tx = {
						acctId: $scope.acctId
					};

					for (var i in $scope.csvCols) {

						if ($scope.csvCols[i] == "date") {

							var dateParts = csvRow[i].split('/');

							tx.date = new Date(dateParts[2], dateParts[0] - 1, dateParts[1]);

						} else if ($scope.csvCols[i] == "amt") {

							tx.amt = parseInt(csvRow[i].replace(/[^0-9\.-]+/g,"") * 100);
            } else if ($scope.csvCols[i] == "desc") {

              var desc = tx.desc || "";
              tx.desc = (desc + " " + csvRow[i]).trim();
						} else if ($scope.csvCols[i] != "") {

							tx[$scope.csvCols[i]] = csvRow[i];
						}
					}

					txModel.save(tx);
				}
			}

			$scope.importResult = "Imported csv";
		};

		$scope.getFileContent = function(file) {

        var reader = new FileReader();

        reader.onloadend = function(event) {

          console.info("Are we doing anything??? %o", event);
          var maxColCount = 0;
          var rows = [];

          d3.csv.parseRows(
            this.result,
            function(r) {
              $scope.csvRows.push(r);
              maxColCount = Math.max(maxColCount, r.length);
            }
          );

          for (i=0;i<maxColCount;i++) {
            $scope.csvCols.push("");
          }

          $scope.$apply($scope.csvRows);
          $scope.$apply($scope.csvCols);

        };

        reader.onerror = function (e) {
          console.error(e);
        };

        reader.onloadstart = function (e) {
          console.info(e);
        };

        reader.onprogress = function (e) {
          console.info(e);
        };

        reader.onabort = function (e) {
          console.info(e);
        };

        reader.readAsText(file);
		}
	}
]);
