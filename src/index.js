const query = (status= { data: [],}) => {

    //   INNER JOIN
    const innerJoin = (a, b, f) => {
        let m = a.length, n = b.length, c = [];
        for (var i = 0; i < m; i++) {
            const x = a[i];
            for (var j = 0; j < n; j++) { // cartesian product - all combinations
                let y;
                if(f){
                    y = (f([x, b[j]])) ? [x,b[j]] : undefined;
                }else{
                    y =  [x,b[j]];
                }
                if (y) c.push(y);         // if a row is returned add it to the table
            }
        }
        return c;
    }

    const where = (fns, data) => {
        //  APPLY MULTIPLE WHERE CLASES WITH 'OR'
        const whereOR = (fns, data) => {
            let res = [];
            fns.forEach(f => res = res.concat(data.filter(f).reverse()));
            return res;
        }

        //  APPLY MULTIPLE WHERE CLASES WITH 'OR'
        const whereAND = (fns, data) => {
            let res = [];
            fns.forEach(f => res = data.filter(f));
            status.whereLogic = 'OR';
            return res;
        }

        return (status.whereLogic === 'AND') ? whereAND(fns,data) : whereOR(fns, data);
    }

    //  GROUP DATASET BY ATTR
    const groupBy = (fns, data) => {
        //  GROUP FUNCTION WHEN DATASET INST GROUPED
        const group = (f, data) => {
            if(!data) return [];

            const groupArray = (f, data) => {
                let groupsMap = {};
                let groups = [];

                data.forEach(d => {
                    if(groupsMap[f(d)]) {
                        groupsMap[f(d)].push(d)
                    } else {
                        groupsMap[f(d)] = [d];
                    }
                });

                Object.keys(groupsMap).forEach(groupName => {
                    let items = groupsMap[groupName];
                    if(!Number.isNaN(Number.parseInt(groupName))) groupName = Number.parseInt(groupName)
                    groups.push([groupName, items]);
                });
                return groups;
            }

            if(typeof data[0][0] != 'object' && typeof data[0][1] === 'object'){
                return regroup(f,data);
            }else{
                return groupArray(f, data);
            }
        }

        //  GROUP FUNCTION WHEN DATASET IS ALREADY GROUPED
        const regroup = (f, data) => {
            for (var i = 0; i < data.length; i++) {
                let g = data[i];
                data[i][1] = group(f, g[1]);
            }
            return data;
        }

        fns.forEach(f => data = group(f, data));
        return data;
    }

    return {
        select: (f) => {
            if(status.hasOwnProperty('select')) throw new Error('Duplicate SELECT');
            status.select = f;
            return query(status);
        },
        from: (...data) => {
            if(status.hasOwnProperty('from')) throw new Error('Duplicate FROM');
            status.from = data;
            status.data = data;
            return query(status);
        },
        where: (...f) => {
            status.where = (status.where) ? status.where.concat(f) : f;
            return query(status);
        },
        groupBy: (...f) => {
            if(status.hasOwnProperty('groupBy')) throw new Error('Duplicate GROUPBY');
            status.groupBy = f;
            return query(status);
        },
        orderBy: (f) => {
            if(status.hasOwnProperty('orderBy')) throw new Error('Duplicate ORDERBY');
            status.orderBy = f;
            return query(status);
        },
        having: (f) => {
            status.having = f;
            return query(status);
        },
        execute: () => {
            if(status.data.length === 2){
                status.data = (status.where) ? innerJoin(status.data[0], status.data[1], status.where[0]) : innerJoin(status.data[0], status.data[1]);
                status.whereLogic = 'AND';
            }else{
                status.data = status.data[0] || [];
            }

            if(status.where)    status.data = where(status.where, status.data);
            if(status.groupBy)  status.data = groupBy(status.groupBy, status.data);
            if(status.having)   status.data = status.data.filter(status.having);
            if(status.select)   status.data = status.data.map(status.select);
            if(status.orderBy)  status.data = status.data.sort(status.orderBy);

            return status.data;
        }
    }
}

export default query;
