var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var crypto = require('crypto');

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

var hashPassword = function(password) {
    var hash = crypto.createHmac('sha256', Constants.SecretKey);
    hash.update(password);
    var value = hash.digest('hex');
    console.log(value);
    return value;
}

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
                    password: hashPassword(Constants.InitialPassword),
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
        res.status(200).send("<p>Registration: user has been validated, please log on using initial password!</p><br><a href='/#/login'>Login</a>");
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
        password: hashPassword(req.body.password),
        validated: true
    }, 'email firstname lastname user _company_code properties company profile remote_profiles manager reports')
        .populate('company profile remote_profiles').exec(
            function(errUser, userObject) {
                if (errUser) return res.status(401).json({
                    errUser: info
                });
                if (!userObject) return res.status(401).json({
                    err: "Invalid user name or password!"
                });
                var session = {
                    user: userObject._id,
                    timeout: Date.now() + Constants.MaxSessionTimeout,
                    _company_code: userObject._company_code
                };
                Session.create(session, function(err, newSession) {
                    if (err) return next(err);
                    SessionCache.login(newSession._id, userObject);
                    res.cookie(Constants.SessionCookie, newSession._id, {
                        maxAge: Constants.MaxSessionTimeout,
                        httpOnly: true
                    }).status(200).json({
                        token: newSession._id,
                        user: SessionCache.user[newSession._id]
                    });
                });
            });
});

router.get('/status', function(req, res) {
    if (!req.cookies[Constants.SessionCookie]) return res.status(401).json({
        err: "Not logged in!"
    });
    var token = req.cookies[Constants.SessionCookie];
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
        }, 'email firstname lastname user _company_code properties company profile remote_profiles manager reports')
            .populate('company profile remote_profiles').exec(
                function(err, userObject) {
                    if (err) return res.status(401).json({
                        err: err.info
                    });
                    if (!userObject) return res.status(401).json({
                        err: "Invalid user name or password!"
                    });
                    if (SessionCache.isActive(token)) {
                        SessionCache.touch(token);
                    } else {
                        SessionCache.login(token, userObject);
                    }
                    res.cookie(Constants.SessionCookie, token, {
                        maxAge: Constants.MaxSessionTimeout,
                        httpOnly: true
                    }).status(200).json({
                        token: token,
                        user: SessionCache.user[token]
                    });
                });
    });
});

router.get('/logout', function(req, res) {
    var token = req.cookies[Constants.SessionCookie];
    Session.findOneAndRemove({
        _id: req.cookies[Constants.SessionCookie]
    }, function(err, object) {
        if (err) return next(err);
        if (!object) return res.status(401).json({
            err: "Invalid session!"
        });
        SessionCache.logout(req.cookies[Constants.SessionCookie]);
        res.clearCookie(Constants.SessionCookie).status(200);
    });

});

module.exports = router;
