(function() {

  'use strict';

  function BdgtCtrl($scope, acctModel, txModel, catModel, bdgtModel, aggregation, _) {

    $scope.bdgts = [];
    $scope.bdgt = {};
    $scope.accts = [];
    $scope.cats = [];

    acctModel.getAll(function(accts) {
      $scope.accts = accts;
      $scope.$apply();
    });

    bdgtModel.getAll(function(bdgts) {
      $scope.bdgts = bdgts;
      $scope.$apply();
    });

    catModel.getAll(function(cats) {
      $scope.cats = cats;
    });

    $scope.add = function() {

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

    $scope.remove = function(event, bdgt) {

      var index = $scope.bdgts.indexOf(bdgt);

      bdgtModel.remove(bdgt.id, function() {

        $scope.bdgts.splice(index, 1);

        if ($scope.bdgt.id === bdgt.id) {

          $scope.bdgt = {};

        }

        $scope.$apply();

      });

      event.stopPropagation();
      event.preventDefault();
    };

    $scope.load = function(bdgt) {

      aggTxs(bdgt, function(bdgt) {
        $scope.bdgt = bdgt;
        $scope.$apply();
      });
    };

    $scope.update = function(bdgt) {

      // get updated numbers
      bdgt = aggTxs(bdgt, function(bdgt) {

        bdgtModel.save(bdgt);
        bdgt.changed = false;
      });
    };

    $scope.moveGroup = function(groups, index, dir) {
      console.info('Groups before move %o', groups);
      var group = groups.splice(index, 1)[0];
      groups.splice(index + dir, 0, group);
      console.info('Groups after move %o', groups);
    };

    $scope.moveOrder = function(group, item, d) {

      console.info('moving %O', item);

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

    $scope.updateCat = function(cat, group, bdgt) {

      group.bdgt = group.cats.reduce(function(p, c) {
        return p + c.bdgt;
      }, 0);

      bdgt.totals.bdgt = bdgt.groups.reduce(function(p, c) {
        return p + c.bdgt;
      }, 0);
    };

    // sums txs for bdgt date range by group/category
    var aggTxs = function(bdgt, cb) {

      var ranges = {
        'spent': {
          'start': bdgt.strt,
          'end': bdgt.end
        },
        'lastMo': {
          'start': aggregation.dateMath(bdgt.strt, 0, -1, 0),
          'end': aggregation.dateMath(bdgt.strt, 0, 0, -1)
        },
        'lastSixMos': {
          'start': aggregation.dateMath(bdgt.strt, 0, -6, 0),
          'end': aggregation.dateMath(bdgt.strt, 0, 0, -1)
        },
        'thisMoLastYr': {
          'start': aggregation.dateMath(bdgt.strt, -1, 0, 0),
          'end': aggregation.dateMath(bdgt.end, -1, 0, 0)
        }
      };



      var STRTLASTYR = new Date(
        bdgt.strt.getFullYear() - 1,
        bdgt.strt.getMonth(),
        bdgt.strt.getDate()
      );

      var ENDLASTYR = new Date(
        bdgt.end.getFullYear() - 1,
        bdgt.end.getMonth(),
        bdgt.end.getDate()
      );

      var LASTSIXMOS = new Date(
        bdgt.strt.getFullYear(),
        bdgt.strt.getMonth() - 6,
        bdgt.strt.getDate()
      );

      var LASTMO = new Date(
        bdgt.strt.getFullYear(),
        bdgt.strt.getMonth() - 1,
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

      catModel.getAll(function(categories) {
        for (var c in categories) {

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

      txModel.getAll(function(txs) {

        // summarize transactions by category for each
        // set of date ranges
        var txsByCat = aggregation.txByGroupCatTime(txs, ranges);

        // mixin categories and transactions summarized by category
        var groupsCategories = _.chain($scope.cats)
          // organize categories by group
          .groupBy(function(cat) {

            return cat.group || 'ungrouped';
          })
          // The result here should be an array of groups
          // containing an array of categories with transaction
          // totals were relevant or 0s if category doesn't have
          // any transactions. We also need to pull in budgets
          // if present in the current bdgt object
          .map(function(group, name) {

            var cats = _.map(group, function(cat) {

              // look in the summarized transactions for this
              // category
              var matchingCat = _.find(txsByCat, function(tx) {
                return tx.cat === cat.cat;
              });

              // did we find it? If not, create a 0 totaled category
              // with the date range breakouts
              matchingCat = matchingCat || _.reduce(ranges, function(newCat, range, name) {

                return newCat[name] || 0;
              }, {});

              // look for a budget for this category

            });

            return {
              'group': name,
              'cats': cats
            };

          })
          .value();

/*
        var newBdgt = {
          accts = [bdgt.]

        }
				*/

        console.info('new bdgt: %o', groupsCategories);

				var i, z;

        // aggregate transactions into categories
        for (i in txs) {

          if (txs[i].acctId === bdgt.acctId) {

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
        for (i in bdgt.groups) {

          for (z in bdgt.groups[i].cats) {

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
        for (i in assocCats) {

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

        }

        // mix in group order from saved budget
        for (i in bdgt.groups) {
          assocGroups[bdgt.groups[i].group].order = bdgt.groups[i].order;
          assocGroups[bdgt.groups[i].group].show = bdgt.groups[i].show || true;
        }

        bdgt.groups = [];

        var orderCounter = 0;
        // convert to array
        for (i in assocGroups) {

          var cats = [];
          for (z in assocGroups[i].cats) {
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

        if (typeof cb !== 'undefined') {

          console.info('budget object: %o', bdgt);
          cb(bdgt);
        }
      });
    };

    $scope.setBudget = function(amt, cat, group, bdgt) {
      cat.bdgt = amt;

      $scope.updateCat(cat, group, bdgt);
    };
  }

  BdgtCtrl.$inject = ['$scope', 'acctModel', 'txModel', 'catModel', 'bdgtModel', 'aggregation', '_'];

  angular
    .module('julep')
    .controller('BdgtCtrl', BdgtCtrl);

})();
