(function () {

  // This service should aggregate transactions to
  // be used in budgets

  'use strict';

  function Aggregation (_) {

    var agg = {};

    // date addition
    agg.dateMath = function (d, yearOffset, monthOffset, dayOffset) {

      return new Date(
            d.getFullYear() + (yearOffset || 0),
            d.getMonth() + (monthOffset || 0),
            d.getDate() + (dayOffset || 0)
          );
    };

    // Totals an array of transactions
    agg.totalTxs = function (txs) {

      return _.reduce(txs, function(total, tx) {

        return parseInt(total, 10) + parseInt(tx.amt || 0, 10);

      }, 0);
    };

    // Return transactions in range
    agg.txsInRange = function (txs, start, end) {

      return _.filter(txs, function (tx) {
        return tx.date >= start && tx.date <= end;
      });
    };

    // Takes the transactions and a group of date ranges
    // and sums them up by category and date range
    agg.txByGroupCatTime = function (txs, ranges) {

      return _.chain(txs)
        .groupBy(function(tx) {

          return tx.cat || 'uncategorized';

        })
        .map(function(txs, cat) {

          var c = {
            'cat': cat
          };

          _.each(ranges, function(range, name) {

            c[name] = agg.totalTxs(agg.txsInRange(txs, range.start, range.end));
          });

          return c;

        })
        .value();

    };

    return agg;
  }

  Aggregation.$inject = ['_'];

  angular.module('julep')
    .factory('aggregation', Aggregation);

})();
