var express = require('express');
var router = express.Router();

var Metadata = require('../models/metadata.js');
var SessionCache = require('../tools/session_cache.js');
var Constants = require('../tools/constants.js');
var DataModel = Metadata.DataModel;

var computePage = function(req) {
    return pageOptions = {
        skip: parseInt(req.query.skip) || Constants.QuerySkip,
        limit: parseInt(req.query.limit) || Constants.QueryLimit
    }
}

router.get('/form/:id', function(req, res, next) {
    Metadata.Form.findOne(SessionCache.filterCompanyCode(req, {
        _id: req.params.id
    })).populate('datamodel values').exec(function(err, object) {
        if (err) return next(err);
        res.json(object);
    });
});

router.get('/application/', function(req, res, next) {
    var pageOptions = computePage(req);
    Metadata.Application.find(SessionCache.filterCompanyCode(req, {})).skip(pageOptions.skip).limit(pageOptions.limit).populate('workflows').exec(function(err,
        object) {
        if (err) return next(err);
        res.json(object);
    });
});

module.exports = router;
