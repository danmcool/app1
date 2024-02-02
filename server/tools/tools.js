var Tools = {}

Tools.computePage = function (req) {
    return {
        skip: parseInt(req.query.skip) || 0,
        limit: parseInt(req.query.limit) || 10
    }
}

Tools.appendProperties = function (source, destination) {
    var keysArray = Object.keys(source);
    for (var i = 0; i < keysArray.length; i++) {
        destination[keysArray[i]] = source[keysArray[i]];
    }
}

Tools.resolvePath = function (object, path) {
    if (!path) return undefined;
    return path.split('.').reduce(function (previous, current) {
        return (previous ? previous[current] : undefined);
    }, object);
}

Tools.resolvePathUndefValue = function (object, path, undefValue) {
    if (!path) return undefValue;
    return path.split('.').reduce(function (previous, current) {
        return (previous ? (previous[current] == undefined ? undefValue : previous[current]) : undefValue);
    }, object);
}

Tools.resolvePathUpdate = function (object, path, value) {
    if (!path) return undefined;
    path.split('.').reduce(function (previous, current, index, array) {
        if (index < array.length - 1) {
            if (!previous[current]) {
                previous[current] = {};
            }
            return previous[current];
        } else {
            previous[current] = value;
        }
    }, object);
}

module.exports = Tools;
