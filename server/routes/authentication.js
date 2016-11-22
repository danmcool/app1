var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var Metadata = require('../models/metadata.js');
var Constants = require('../tools/constants.js');
var Email = require('../tools/email.js');
var SessionCache = require('../tools/session_cache.js');
var ApplicationLiveCycle = require('../tools/application_live_cycle.js');

var Company = Metadata.Company;
var User = Metadata.User;
var UserProfile = Metadata.UserProfile;
var Application = Metadata.Application;
var Session = Metadata.Session;

router.post('/register', function(req, res) {
    Company.findOne({
        _company_code: req.body.code
    }, function(err, object) {
        if (object) return res.status(400).json({
            "msg": "Registration: company code is already used, please use another code!"
        });
        var company = {
            name: req.body.company_name,
            _company_code: req.body.code
        };
        Company.create(company, function(err, newCompany) {
            if (err) return next(err);
            var userprofile = {
                name: {
                    "en": "Administrator"
                },
                type: Constants.UserProfileAdministrator,
                _company_code: req.body.code
            };
            UserProfile.create(userprofile, function(err, newUserprofile) {
                if (err) return next(err);
                var user = {
                    user: req.body.user.toLowerCase(),
                    password: Constants.InitialPassword,
                    email: req.body.email,
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    properties: {
                        theme: "default",
                        language: "en"
                    },
                    profile: newUserprofile._id,
                    company: newCompany._id,
                    _company_code: req.body.code
                };
                User.create(user, function(err, newUser) {
                    if (err) return next(err);
                    res.status(200).json({
                        "msg": "Registration: please check your email to validate the registration!"
                    });
                    Email.sendValidation(newUser.email, newUser.user, newUser._company_code);
                });
            });
        });
    });
});

router.get('/validate', function(req, res) {
    var _company_code = req.query.code;
    User.findOneAndUpdate({
        user: req.query.user,
        _company_code: _company_code,
        validated: false
    }, {
        $set: {
            validated: true
        }
    }, function(err, object) {
        if (err) return next(err);
        if (!object) return res.status(401).send("Registration: user has been already validated!");
        Application.find({
            _company_code: Constants.ProductionCompany
        }, function(err, appObjects) {
            var appList = [];
            for (var i = 0; i < appObjects.length; i++) {
                appList.push("" + appObjects[i]._id);
            };
            Company.findOneAndUpdate({
                _company_code: _company_code
            }, {
                applications: appList
            });
        });
        res.status(200).send("<p>Registration: user has been validated, please log on using initial password!</p><br><a href='/#login'>Login</a>");
        /*
        var objectList = {};
        Application.find({
            _company_code: Constants.ProductionCompany
        }, function(err, appObjects) {
            for (var i = 0; i < appObjects.length; i++) {
                appList.push(appObjects[i])
                ApplicationLiveCycle.copyApplication(appObjects[i], _company_code, objectList);
            };
        });*/
    });
});

router.post('/login', function(req, res, next) {
    User.findOne({
        user: req.body.user.toLowerCase(),
        password: req.body.password,
        _company_code: req.body._company_code,
        validated: true
    }, 'email firstname lastname user _company_code properties company profile')
        .populate('company profile').exec(
            function(err, user) {
                if (err) return res.status(401).json({
                    err: info
                });
                if (!user) return res.status(401).json({
                    err: "Invalid user name or password!"
                });
                var session = {
                    user: user._id,
                    timeout: Date.now() + Constants.MaxSessionTimeout,
                    _company_code: req.body.code
                };
                Session.create(session, function(err, newSession) {
                    if (err) return next(err);
                    var jsonUser = JSON.parse(JSON.stringify(user));
                    SessionCache.login(newSession._id, jsonUser);
                    res.cookie('app1_token', newSession._id, {
                        maxAge: Constants.MaxSessionTimeout,
                        httpOnly: true
                    }).status(200).json({
                        token: newSession._id,
                        user: jsonUser
                    });
                });
            });
});

router.get('/status', function(req, res) {
    if (!req.cookies.app1_token) return res.status(401).json({
        err: "Not logged in!"
    });
    var token = req.cookies.app1_token;
    var current_time = Date.now();
    Session.findOneAndUpdate({
        _id: {
            "$eq": token
        },
        timeout: {
            "$gt": current_time
        }
    }, {
        timeout: current_time + Constants.MaxSessionTimeout
    }).populate('user').exec(function(err, existingSession) {
        if (err) return res.status(401).json({
            err: err.info
        });
        if (!existingSession) return res.status(401).json({
            err: "Invalid session!"
        });
        User.findOne({
            _id: existingSession.user._id,
            validated: true
        }, 'email firstname lastname user _company_code properties company profile')
            .populate('company profile').exec(
                function(err, user) {
                    if (err) return res.status(401).json({
                        err: err.info
                    });
                    if (!user) return res.status(401).json({
                        err: "Invalid user name or password!"
                    });
                    var jsonUser = JSON.parse(JSON.stringify(user));
                    if (SessionCache.isActive(token)) {
                        SessionCache.touch(token);
                    } else {
                        SessionCache.login(token, jsonUser);
                    }
                    res.cookie('app1_token', token, {
                        maxAge: Constants.MaxSessionTimeout,
                        httpOnly: true
                    }).status(200).json({
                        token: token,
                        user: jsonUser
                    });
                });
    });
});

router.get('/logout', function(req, res) {
    var token = req.cookies.app1_token;
    Session.findOneAndRemove({
        _id: req.cookies.app1_token
    }, function(err, object) {
        if (err) return next(err);
        if (!object) return res.status(401).json({
            err: "Invalid session!"
        });
        SessionCache.logout(req.cookies.app1_token);
        res.clearCookie('app1_token').status(200);
    });

});

router.get('/share', function(req, res, next) {
    if (!req.cookies.app1_token) return res.status(401).json({
        err: "Not logged in!"
    });
    if (!req.query.form_id || !req.query.datamodel_id || !req.query.data_id) return res.status(401).json({
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
                    [req.query.data_id]: SessionCache.user[req.cookies.app1_token]._company_code
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
        Email.sendShare(SessionCache.user[req.cookies.app1_token].email, req.query.form_id, req.query.datamodel_id, req.query.data_id, newUserprofile._id, newUserProfile._company_code);
    });
});

router.get('/open', function(req, res, next) {
    if (!req.cookies.app1_token) return res.status(401).json({
        err: "Not logged in!"
    });
    if (!req.query.form_id || !req.query.datamodel_id || !req.query.data_id || SessionCache.user[req.cookies.app1_token]._company_code == req.query.code) return res.status(401).json({
        err: "Invalid parameters!"
    });
        User.findOneAndUpdate({
            _id: SessionCache.user[req.cookies.app1_token]._id,
            validated: true}, {
        $push:{remote_profiles:{req.query.profile_id}}
    },function(err, object) {
        if (err) return next(err);
        if (!object) return res.status(401).json({
            err: "Invalid parameters!"
        });
        res.redirect(200, 'http://example.com');
    });

});

module.exports = router;
