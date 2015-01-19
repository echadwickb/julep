(function() {

  'use strict';

  function dateMath (d, yearOffset, monthOffset, dayOffset) {

    return new Date(
      d.getFullYear() + (yearOffset || 0),
      d.getMonth() + (monthOffset || 0),
      d.getDate() + (dayOffset || 0)
    );
  };

  function getRanges(strt, end) {

    return {
      'spent': {
        'start': strt,
        'end': end
      },
      'lastMo': {
        'start': dateMath(strt, 0, -1, 0),
        'end': dateMath(strt, 0, 0, -1)
      },
      'lastSixMos': {
        'start': dateMath(strt, 0, -6, 0),
        'end': dateMath(strt, 0, 0, -1)
      },
      'thisMoLastYr': {
        'start': dateMath(strt, -1, 0, 0),
        'end': dateMath(end, -1, 0, 0)
      }
    };
  };

  function sumTxs(txs) {

    return txs.reduce(function (ttl, tx) {
      return tx.amt + ttl;
    }, 0);
  };

  function filterRangeTxs(start, end, txs) {
    return _.filter(txs, function (tx) {
      return tx.date >= start && tx.date <= end;
    });
  };

  function filterAccountTxs(acctIds, txs) {

    return _.filter(txs, function (tx) {
      return acctIds.indexOf(tx.acctId) > -1;
    });
  };

  function aggregateTxs(bdgt, txs) {

      var ranges = getRanges(bdgt.strt, bdgt.end);

      var txsForBdgtAcct = filterAccountTxs(bdgt.acctIds, txs);

      console.info(txsForBdgtAcct);

      var groupedTxs = _.groupBy(txsForBdgtAcct, function (tx) {
        return tx.cat[0].cat;
      });

      console.info(groupedTxs);

      var finalTotals = {};

      console.info(_.keys(groupedTxs));

      _.each(_.keys(groupedTxs), function (cat) {

        finalTotals[cat] = {};

        _.each(_.keys(ranges), function (key) {

          finalTotals[cat][key] = sumTxs(
            filterRangeTxs(
              ranges[key].start,
              ranges[key].end,
              groupedTxs[cat]));

        });
      });

      console.info(finalTotals);

      return finalTotals;

  };

  function assignCategories(bdgt, groupedTxs) {

    _.each(_.keys(bdgt.groups), function (group) {

      _.each(_.keys(group.cats), function (cat) {

        var catTotals = groupedTxs[cat] || {
          lastMo: 0,
          lastSixMos: 0,
          spent: 0,
          thisMoLastYr: 0
        };

        bdgt.groups[group][cat].bdgt = bdgt.group.cat.bdgt || 0;
        bdgt.groups[group][cat].lastMo = catTotals.lastMo;
        bdgt.groups[group][cat].lastSixMos = catTotals.lastSixMos;
        bdgt.groups[group][cat].spent = catTotals.spent;
        bdgt.groups[group][cat].thisMoLastYr = catTotals.thisMoLastYr;

        delete groupedTxs[cat];
      });

    });

    // add default budgets to the remaining categories
    bdgt.groups['ungrouped'] =  {
      show: true,
      order: 1000,
      cats: addDefaultBdgt(groupedTxs)
    }

    // total up each group
    bdgt.groups = _.each(bdgt.groups, function(group) {
      return _.extend(group, sumGroup(group));
    })

    return bdgt;
  };

  function addDefaultBdgt(categories) {
    return _.each(categories, function (value, key) {
      return _.defaults(value, { bdgt: 0 });
    })
  };

  function sumGroup(group) {

    return _.reduce(group.cats, function(totals, cat) {

      return {
        bdgt: totals.bdgt + cat.bdgt,
        lastMo: totals.lastMo + cat.lastMo,
        lastSixMos: totals.lastSixMos + cat.lastSixMos,
        spent: totals.spent + cat.spent,
        thisMoLastYr: totals.thisMoLastYr + cat.thisMoLastYr
      };

    }, {
      bdgt: 0,
      lastMo: 0,
      lastSixMos: 0,
      spent: 0,
      thisMoLastYr: 0
    });
  };

  function calculateTotals(bdgt) {

    var groupTotals = _.reduce(bdgt.groups, function(totals, cat) {

      return {
        bdgt: totals.bdgt + cat.bdgt,
        spent: totals.spent + cat.spent
      };

    }, {
      bdgt: 0,
      spent: 0,
    });

    bdgt.bdgt = groupTotals.bdgt;
    bdgt.spent = groupTotals.spent;

  };

  function calculateStartingAmounts(accts, bdgt, txs) {

    var startDate = new Date(1900, 0, 1);

    var txTotal = sumTxs(
      filterRangeTxs(
        startDate,
        dateMath(bdgt.strt, 0, 0, -1),
        filterAccountTxs(bdgt.acctIds, txs)
      )
    );

    var acctTotal = _.reduce(accts, function (total, acct) {

      return (bdgt.acctIds.indexOf(acct.id) > -1) ?
        (acct.strtBal + total) : total;
    }, 0);

    return acctTotal + txTotal;
  };

  function BdgtCtrl($scope, $q, acctModel, txModel, bdgtModel, aggregation, _) {

    $scope.bdgts = [];
    $scope.bdgt = {};
    $scope.accts = [];
    $scope.groupedTxs = {};

    var promiseData = {};
    var txs = [];

    promiseData['acct'] = acctModel.getAll();
    promiseData['bdgt'] = bdgtModel.getAll();
    promiseData['txs'] = txModel.getAll();

    $q.all(promiseData).then(function (result) {

      console.info(result);
      $scope.accts = result['acct'];
      $scope.bdgts = result['bdgt'];
      txs = result['txs'];
    });

    $scope.add = function() {

      $scope.bdgt = bdgtModel.new();

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

      bdgt = assignCategories(bdgt, aggregateTxs(bdgt, txs));

      $scope.bdgt = bdgt;

    };

    $scope.update = function(bdgt) {

      bdgt.acctIds = [];

      _.each($scope.accts, function (acct) {
          if (acct.include) {
            bdgt.acctIds.push(acct.id);
          }
      });

      assignCategories(bdgt, aggregateTxs(bdgt, txs));

      calculateTotals(bdgt);

      bdgt.strtAmt = calculateStartingAmounts($scope.accts, bdgt, txs);

      // bdgtModel.save(bdgt);
      bdgt.changed = false;

      console.info(bdgt);
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

      group.bdgt = _.reduce(group.cats, function(p, c) {
        return p + c.bdgt;
      }, 0);

      bdgt.bdgt = _.reduce(bdgt.groups, function(p, c) {
        return p + c.bdgt;
      }, 0);
    };

    $scope.setBudget = function(amt, cat, group, bdgt) {
      cat.bdgt = amt;

      $scope.updateCat(cat, group, bdgt);
    };
  }

  BdgtCtrl.$inject = ['$scope', '$q', 'acctModel', 'txModel', 'bdgtModel', 'aggregation', '_'];

  angular
    .module('julep')
    .controller('BdgtCtrl', BdgtCtrl);

})();
