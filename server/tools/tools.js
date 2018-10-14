var Tools = {}

Tools.computePage = function (req) {
    return {
        skip: parseInt(req.query.skip) || 0,
        limit: parseInt(req.query.limit) || 10
    }
}

module.exports = Tools;
