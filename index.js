const query = (status= { data: []}) => {

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

    const regroup = (f, data) => {
        for (var i = 0; i < data.length; i++) {
            let g = data[i];
            data[i][1] = group(f, g[1]);
        }
        return data;
    }

    return {
        select: (f) => {
            status.select = f;
            return query(status);
        },
        from: (data) => {
            status.data = data;
            return query(status);
        },
        where: (f) => {
            status.where = f;
            return query(status);
        },
        groupBy: (...f) => {
            status.groupBy = f;
            return query(status);
        },
        orderBy: (f) => {
            status.orderBy = f;
            return query(status);
        },
        execute: () => {
            if(status.where)    status.data = status.data.filter(status.where);

            if(status.groupBy) {
                status.groupBy.forEach(f => status.data = group(f, status.data));
            }

            if(status.select)   status.data = status.data.map(status.select);
            if(status.orderBy)  status.data = status.data.sort(status.orderBy);

            return status.data;
        }
    }
}

module.exports.query = query;
