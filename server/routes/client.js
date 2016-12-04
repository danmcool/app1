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

router.put('/value/:id', function(req, res, next) {
    var pageOptions = computePage(req);
    if (!req.query.type) return res.status(400).json({
        "msg": "Missing values parameters!"
    });
    var result = {
        _id: req.params.id,
        values: []
    };
    if (req.query.type == Constants.ValuesTypeUser) {
        if (!req.body.relation) return res.status(400).json({
            "msg": "Missing values parameters!"
        });
        if (req.body.relation == Constants.ValuesRelationUserReports) {
            Metadata.User.find({
                _company_code: SessionCache.user[req.cookies.app1_token]._company_code,
                "$or": [{
                    _id: {
                        "$in": SessionCache.user[req.cookies.app1_token].reports
                    }
                }, {
                    _id: {
                        "$eq": SessionCache.user[req.cookies.app1_token]._id
                    }
                }]
            }, 'user email firstname lastname').skip(pageOptions.skip).limit(pageOptions.limit).exec(function(errUserObjects, userObjects) {
                if (errUserObjects) return next(errUserObjects);
                if (!userObjects) return res.status(400).json({
                    "msg": "Url is null!"
                });
                for (var i in userObjects) {
                    result.values.push({
                        "_id": userObjects[i]._id,
                        "en": ((userObjects[i].firstname ? userObjects[i].firstname : "") + " " + (userObjects[i].lastname ? userObjects[i].lastname : ""))
                    });
                }
                return res.status(200).json(result);
            });
        } else if (valueObject.values.relation == Constants.ValuesRelationUserManager) {
            Metadata.User.find({
                _company_code: SessionCache.user[req.cookies.app1_token]._company_code,
                _id: {
                    "$in": SessionCache.user[req.cookies.app1_token].reports
                }
            }, 'user email firstname lastname').skip(pageOptions.skip).limit(pageOptions.limit).exec(function(errUserObjects, userObjects) {
                if (errUserObjects) return next(errUserObjects);
                if (!userObjects) return res.status(400).json({
                    "msg": "Url is null!"
                });
                for (var i in userObjects) {
                    result.values.push({
                        "_id": userObjects[i]._id,
                        "en": ((userObjects[i].firstname ? userObjects[i].firstname : "") + " " + (userObjects[i].lastname ? userObjects[i].lastname : ""))
                    });
                }
                return res.status(200).json(values);
            });
        }
    } else if (req.query.type == Constants.ValuesTypeQuery) {
        return res.status(200).json("");
    } else {
        return res.status(200).json("");
    }
});

router.get('/form/:id', function(req, res, next) {
    Metadata.Form.findOne(SessionCache.filterApplicationCompanyCode(req, {
        _id: {
            "$eq": req.params.id
        }
    })).populate('datamodel values').exec(function(err, formObject) {
        if (err) return next(err);
        if (!formObject) return res.status(400).json({
            "msg": "Url is null!"
        });
        return res.status(200).json(formObject);
    });
});

router.get('/application/', function(req, res, next) {
    var pageOptions = computePage(req);
    Metadata.Application.find(SessionCache.filterApplicationCompanyCode(req, {})).skip(pageOptions.skip).limit(pageOptions.limit).populate('workflows').exec(function(err,
        object) {
        if (err) return next(err);
        res.json(object);
    });
});

module.exports = router;
