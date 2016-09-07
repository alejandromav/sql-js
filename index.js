'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var query = function query() {
    var status = arguments.length <= 0 || arguments[0] === undefined ? { data: [] } : arguments[0];


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

    var regroup = function regroup(f, data) {
        for (var i = 0; i < data.length; i++) {
            var g = data[i];
            data[i][1] = group(f, g[1]);
        }
        return data;
    };

    return {
        select: function select(f) {
            status.select = f;
            return query(status);
        },
        from: function from(data) {
            status.data = data;
            return query(status);
        },
        where: function where(f) {
            status.where = f;
            return query(status);
        },
        groupBy: function groupBy() {
            for (var _len = arguments.length, f = Array(_len), _key = 0; _key < _len; _key++) {
                f[_key] = arguments[_key];
            }

            status.groupBy = f;
            return query(status);
        },
        orderBy: function orderBy(f) {
            status.orderBy = f;
            return query(status);
        },
        execute: function execute() {
            if (status.where) status.data = status.data.filter(status.where);

            if (status.groupBy) {
                status.groupBy.forEach(function (f) {
                    return status.data = group(f, status.data);
                });
            }

            if (status.select) status.data = status.data.map(status.select);
            if (status.orderBy) status.data = status.data.sort(status.orderBy);

            return status.data;
        }
    };
};

exports.default = query;