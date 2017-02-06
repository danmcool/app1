var express = require('express');
var router = express.Router();

var Metadata = require('../models/metadata.js');
var SessionCache = require('../tools/session_cache.js');
var Constants = require('../tools/constants.js');
var Email = require('../tools/email.js');

var DataModel = Metadata.DataModel;
var User = Metadata.User;
var Company = Metadata.Company;
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
                _company_code: SessionCache.userData[req.cookies.app1_token]._company_code,
                "$or": [{
                    _id: {
                        "$in": SessionCache.userData[req.cookies.app1_token].reports
                    }
                }, {
                    _id: {
                        "$eq": SessionCache.userData[req.cookies.app1_token]._id
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
                _company_code: SessionCache.userData[req.cookies.app1_token]._company_code,
                _id: {
                    "$in": SessionCache.userData[req.cookies.app1_token].reports
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

router.put('/user/:id', function(req, res, next) {
    if (req.body.user) req.body.user = req.body.user.toLowerCase();
    User.findOneAndUpdate(SessionCache.filterCompanyCode(req, {
        _id: req.params.id
    }), req.body, function(err, object) {
        if (err) return res.status(400).json({
            errUser: err
        });
        User.findOne({
            _id: req.body._id
        }, 'email firstname lastname user _company_code properties company profile remote_profiles manager reports')
            .populate('company profile remote_profiles').exec(
                function(errUser, userObject) {
                    if (errUser) return res.status(401).json({
                        errUser: info
                    });
                    if (!userObject) return res.status(401).json({
                        err: "Invalid user name!"
                    });
                    SessionCache.update(req.cookies.app1_token, userObject);
                    res.json(userObject);
                });
    });
});

router.get('/company/:id', function(req, res, next) {
    Company.findOne(SessionCache.filterCompanyCode(req, {
        _id: req.params.id
    }), function(err, object) {
        if (err) return next(err);
        res.json(object);
    });
});

router.put('/company/:id', function(req, res, next) {
    Company.findOneAndUpdate(SessionCache.filterCompanyCode(req, {
        _id: req.body._id
    }), req.body, function(err, object) {
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
                        _company_code: SessionCache.userData[req.cookies.app1_token]._company_code,
                        constraint: {
                            key: req.query.key,
                            value: req.query.value
                        }
                    }
                }
            }
        },
        type: Constants.UserProfileShare,
        _company_code: SessionCache.userData[req.cookies.app1_token]._company_code
    };
    UserProfile.create(userprofile, function(err, newUserprofile) {
        if (err) return next(err);
        res.status(200).json({
            msg: "Form shared successfully!"
        });
        Email.sendShare(req.query.email, SessionCache.userData[req.cookies.app1_token].email, req.query.form_id, req.query.datamodel_id, req.query.data_id, newUserprofile._id);
    });
});

router.get('/open', function(req, res, next) {
    if (!req.cookies.app1_token) return res.status(401).json({
        err: "Not logged in!"
    });
    if (!req.query.form_id || !req.query.datamodel_id || !req.query.data_id || !req.query.profile_id) return res.status(401).json({
        err: "Invalid parameters!"
    });
    UserProfile.findOne({
        _id: req.query.profile_id
    }, function(errProfile, objectProfile) {
        if (errProfile) return next(errProfile);
        if (!objectProfile) return res.status(401).json({
            err: "Invalid parameters!"
        });
        var userWithRemoteProfile = SessionCache.userData[req.cookies.app1_token];
        userWithRemoteProfile.remote_profiles.push(JSON.parse(JSON.stringify(objectProfile)));
        SessionCache.update(req.cookies.app1_token, userWithRemoteProfile);
        res.redirect("/#/form/" + req.query.form_id + "/" + req.query.data_id);
        /*
        User.findOneAndUpdate({
            _id: SessionCache.userData[req.cookies.app1_token]._id,
            validated: true
        }, {
            $push: {
                remote_profiles: req.query.profile_id
            }
        }, 'email firstname lastname user _company_code properties company profile remote_profiles manager reports')
            .populate('company profile remote_profiles').exec(function(errUser, userObject) {
                if (errUser) return next(err);
                if (!userObject) return res.status(401).json({
                    err: "Invalid parameters!"
                });
                SessionCache.update(req.cookies.app1_token, userObject);
                res.redirect("/#/form/" + req.query.form_id + "/" + req.query.data_id);
            });
        */
    });
});

router.get('/calendar', function(req, res, next) {
    if (!req.cookies.app1_token) return res.status(401).json({
        err: "Not logged in!"
    });
    if (!req.query.project_name || !req.query.start_date || !req.query.end_date || !req.query.user_id) return res.status(401).json({
        err: "Invalid parameters!"
    });
    User.findOne({
        _id: req.query.user_id,
        _company_code: SessionCache.userData[req.cookies.app1_token]._company_code,
        validated: true
    }, 'email firstname lastname').exec(function(errUser, userObject) {
        if (errUser) return next(err);
        if (!userObject) return res.status(401).json({
            err: "Invalid parameters!"
        });
        res.status(200).json({
            msg: "Calendar sent!"
        });
        Email.sendCalendar(userObject.email, req.query.project_name, req.query.start_date, req.query.end_date, ((userObject.firstname ? userObject.firstname : "") + " " + (userObject.lastname ? userObject.lastname : "")));
    });
});

module.exports = router;
