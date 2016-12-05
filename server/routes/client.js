var express = require('express');
var router = express.Router();

var Metadata = require('../models/metadata.js');
var SessionCache = require('../tools/session_cache.js');
var Constants = require('../tools/constants.js');
var Email = require('../tools/email.js');

var DataModel = Metadata.DataModel;
var User = Metadata.User;
var UserProfile = Metadata.UserProfile;
var Application = Metadata.Application;

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
            User.find({
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
            User.find({
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
    Application.find(SessionCache.filterApplicationCompanyCode(req, {})).skip(pageOptions.skip).limit(pageOptions.limit).populate('workflows').exec(function(err,
        object) {
        if (err) return next(err);
        res.json(object);
    });
});

router.get('/share', function(req, res, next) {
    if (!req.cookies.app1_token) return res.status(401).json({
        err: "Not logged in!"
    });
    if (!req.query.form_id || !req.query.datamodel_id || !req.query.data_id || !req.query.email) return res.status(401).json({
        err: "Invalid parameters!"
    });
    var userprofile = {
        name: {
            en: "ShareForm"
        },
        properties: {
            forms: {
                [req.query.form_id]: true
            },
            datamodels: {
                [req.query.datamodel_id]: {
                    [req.query.data_id]: {
                        _company_code: SessionCache.user[req.cookies.app1_token]._company_code,
                        constraint: {
                            key: req.query.key,
                            value: req.query.value
                        }
                    }
                }
            }
        },
        type: Constants.UserProfileShare,
        _company_code: SessionCache.user[req.cookies.app1_token]._company_code
    };
    UserProfile.create(userprofile, function(err, newUserprofile) {
        if (err) return next(err);
        res.status(200).json({
            msg: "Form shared successfully!"
        });
        Email.sendShare(req.query.email, SessionCache.user[req.cookies.app1_token].email, req.query.form_id, req.query.datamodel_id, req.query.data_id, newUserprofile._id);
    });
});

router.get('/open', function(req, res, next) {
    if (!req.cookies.app1_token) return res.status(401).json({
        err: "Not logged in!"
    });
    if (!req.query.form_id || !req.query.datamodel_id || !req.query.data_id) return res.status(401).json({
        err: "Invalid parameters!"
    });
    UserProfile.findOne({
        _id: req.query.profile_id
    }, function(errProfile, objectProfile) {
        if (errProfile) return next(errProfile);
        if (!objectProfile) return res.status(401).json({
            err: "Invalid parameters!"
        });
        User.findOneAndUpdate({
            _id: SessionCache.user[req.cookies.app1_token]._id,
            validated: true
        }, {
            $push: {
                remote_profiles: [req.query.profile_id]
            }
        }, 'email firstname lastname user _company_code properties company profile remote_profiles manager reports')
            .populate('company profile remote_profiles').exec(function(errUser, userObject) {
                if (errUser) return next(err);
                if (!userObject) return res.status(401).json({
                    err: "Invalid parameters!"
                });
                SessionCache.update(req.cookies.app1_token, userObject);
                res.redirect(200, "/#/form/" + req.query.form_id + "/" + req.query.data_id);
            });
    });
});

module.exports = router;
