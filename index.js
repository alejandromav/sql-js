'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var query = function query() {
    var status = arguments.length <= 0 || arguments[0] === undefined ? { data: [] } : arguments[0];


    //   INNER JOIN
    var innerJoin = function innerJoin(a, b, f) {
        var m = a.length,
            n = b.length,
            c = [];
        for (var i = 0; i < m; i++) {
            var x = a[i];
            for (var j = 0; j < n; j++) {
                // cartesian product - all combinations
                var y = void 0;
                if (f) {
                    y = f([x, b[j]]) ? [x, b[j]] : undefined;
                } else {
                    y = [x, b[j]];
                }
                if (y) c.push(y); // if a row is returned add it to the table
            }
        }
        return c;
    };

    var where = function where(fns, data) {
        //  APPLY MULTIPLE WHERE CLASES WITH 'OR'
        var whereOR = function whereOR(fns, data) {
            var res = [];
            fns.forEach(function (f) {
                return res = res.concat(data.filter(f).reverse());
            });
            return res;
        };

        //  APPLY MULTIPLE WHERE CLASES WITH 'OR'
        var whereAND = function whereAND(fns, data) {
            var res = [];
            fns.forEach(function (f) {
                return res = data.filter(f);
            });
            status.whereLogic = 'OR';
            return res;
        };

        return status.whereLogic === 'AND' ? whereAND(fns, data) : whereOR(fns, data);
    };

    //  GROUP DATASET BY ATTR
    var groupBy = function groupBy(fns, data) {
        //  GROUP FUNCTION WHEN DATASET INST GROUPED
        var group = function group(f, data) {
            if (!data) return [];

            var groupArray = function groupArray(f, data) {
                var groupsMap = {};
                var groups = [];

                data.forEach(function (d) {
                    if (groupsMap[f(d)]) {
                        groupsMap[f(d)].push(d);
                    } else {
                        groupsMap[f(d)] = [d];
                    }
                });

                Object.keys(groupsMap).forEach(function (groupName) {
                    var items = groupsMap[groupName];
                    if (!Number.isNaN(Number.parseInt(groupName))) groupName = Number.parseInt(groupName);
                    groups.push([groupName, items]);
                });
                return groups;
            };

            if (_typeof(data[0][0]) != 'object' && _typeof(data[0][1]) === 'object') {
                return regroup(f, data);
            } else {
                return groupArray(f, data);
            }
        };

        //  GROUP FUNCTION WHEN DATASET IS ALREADY GROUPED
        var regroup = function regroup(f, data) {
            for (var i = 0; i < data.length; i++) {
                var g = data[i];
                data[i][1] = group(f, g[1]);
            }
            return data;
        };

        fns.forEach(function (f) {
            return data = group(f, data);
        });
        return data;
    };

    return {
        select: function select(f) {
            if (status.hasOwnProperty('select')) throw new Error('Duplicate SELECT');
            status.select = f;
            return query(status);
        },
        from: function from() {
            for (var _len = arguments.length, data = Array(_len), _key = 0; _key < _len; _key++) {
                data[_key] = arguments[_key];
            }

            if (status.hasOwnProperty('from')) throw new Error('Duplicate FROM');
            status.from = data;
            status.data = data;
            return query(status);
        },
        where: function where() {
            for (var _len2 = arguments.length, f = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                f[_key2] = arguments[_key2];
            }

            status.where = status.where ? status.where.concat(f) : f;
            return query(status);
        },
        groupBy: function groupBy() {
            for (var _len3 = arguments.length, f = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                f[_key3] = arguments[_key3];
            }

            if (status.hasOwnProperty('groupBy')) throw new Error('Duplicate GROUPBY');
            status.groupBy = f;
            return query(status);
        },
        orderBy: function orderBy(f) {
            if (status.hasOwnProperty('orderBy')) throw new Error('Duplicate ORDERBY');
            status.orderBy = f;
            return query(status);
        },
        having: function having(f) {
            status.having = f;
            return query(status);
        },
        execute: function execute() {
            if (status.data.length === 2) {
                status.data = status.where ? innerJoin(status.data[0], status.data[1], status.where[0]) : innerJoin(status.data[0], status.data[1]);
                status.whereLogic = 'AND';
            } else {
                status.data = status.data[0] || [];
            }

            if (status.where) status.data = where(status.where, status.data);
            if (status.groupBy) status.data = groupBy(status.groupBy, status.data);
            if (status.having) status.data = status.data.filter(status.having);
            if (status.select) status.data = status.data.map(status.select);
            if (status.orderBy) status.data = status.data.sort(status.orderBy);

            return status.data;
        }
    };
};

exports.default = query;