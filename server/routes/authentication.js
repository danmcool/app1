var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var Metadata = require('../models/Metadata.js');
var Session = require('../tools/session.js');
var Constants = require('../tools/constants.js');
var Email = require('../tools/email.js');
var ApplicationLiveCycle = require('../tools/application_live_cycle.js');
var Company = Metadata.Company;
var User = Metadata.User;
var UserProfile = Metadata.UserProfile;
var Application = Metadata.Application;

router.post('/register', function(req, res) {
    Company.findOne({
        _company_code: req.body.code
    }, function(err, object) {
        if (object) return res.status(400).send("Registration: company code is already used, please use another code!");
        var company = {
            name: req.body.company_name,
            _company_code: req.body.code
        };
        Company.create(company, function(err, newCompany) {
            if (err) return next(err);
            var userprofile = {
                name: "Administrator",
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
                    res.status(200).send(
                        "Registration: please check your email to validate the registration!");
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
        res.status(200).send("Registration: user has been validated, please log on using initial password!");
        var objectList = {};
        Application.find({
            _company_code: Constants.ProductionCompany
        }, function(err, appObjects) {
            for (var i = 0; i < appObjects.length; i++) {
                ApplicationLiveCycle.copyApplication(appObjects[i], _company_code, objectList);
            };
        });
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
                var token = Session.login(user);
                res.cookie('app1_token', token, {
                    maxAge: Constants.MaxSessionTimeout,
                    httpOnly: true
                });
                res.status(200).json({
                    token: token,
                    user: user
                });
            });
});

router.get('/status', function(req, res) {
    if (!req.cookies.app1_token) return res.status(401).json({
        err: "Not logged in!"
    });
    var token = req.cookies.app1_token;
    if (!Session.isActive(token)) return res.status(401).json({
        err: "Invalid session!"
    });
    res.cookie('app1_token', token, {
        maxAge: Constants.MaxSessionTimeout,
        httpOnly: true
    });
    res.status(200).json({
        token: token,
        user: Session.users[token]
    });
});

router.get('/logout', function(req, res) {
    Session.logout(req.cookies.app1_token);
    res.clearCookie('app1_token');
    res.status(200);
});

module.exports = router;
