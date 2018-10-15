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

module.exports = Tools;
