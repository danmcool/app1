var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var crypto = require('crypto');
var fs = require('fs');
var saml2 = require('saml2-js');

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
    if (!req.body.email) {
        return res.status(400).json({
            msg: 'Registration: email is not provided!'
        });
    }
    var userName = req.body.email.toLowerCase();
    User.findOne({
        user: userName
    }, function(errUserFind, objectUserFind) {
        if (errUserFind) return next(errUserFind);
        if (objectUserFind) return res.status(400).json({
            msg: 'Registration: email is already used, please choose another email!'
        });
        Company.findOne({
            _company_code: req.body.code
        }, function(errCompanyFind, objectCompanyFind) {
            if (errCompanyFind) return next(errCompanyFind);
            if (objectCompanyFind) return res.status(400).json({
                msg: 'Registration: company code is already used, please use another code!'
            });
            var company = {
                name: req.body.company_name,
                _company_code: req.body.code
            };
            Company.create(company, function(errCompany, newCompany) {
                if (errCompany) return next(errCompany);
                var userprofileAdministrator = {
                    name: {
                        'en': 'Administrator'
                    },
                    type: Constants.UserProfileAdministrator,
                    _company_code: req.body.code
                };
                UserProfile.create(userprofileAdministrator, function(errUserProfileAdministrator, newUserprofileAdministrator) {
                    if (errUserProfileAdministrator) return next(errUserProfileAdministrator);
                    var userprofilePrivate = {
                        name: {
                            'en': 'Private'
                        },
                        type: Constants.UserProfilePrivate,
                        _company_code: req.body.code
                    };
                    UserProfile.create(userprofilePrivate, function(errUserProfilePrivate, newUserprofilePrivate) {
                        if (errUserProfilePrivate) return next(errUserProfile);

                        var user = {
                            user: userName,
                            password: Constants.InitialPasswordHash,
                            email: req.body.email,
                            firstname: req.body.firstname,
                            lastname: req.body.lastname,
                            properties: {
                                theme: 'default',
                                language: 'en'
                            },
                            profile: newUserprofileAdministrator._id,
                            company: newCompany._id,
                            _company_code: req.body.code
                        };
                        User.create(user, function(errNewUser, newUser) {
                            if (errNewUser) return next(errNewUser);
                            res.status(200).json({
                                msg: 'Registration: please check your email to validate the registration!'
                            });
                            Email.sendValidation(newUser.email, newUser.user, newUser._company_code);
                        });
                    });
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
        if (!object) return res.status(401).send('Registration: user has been already validated!');
        Application.find({
            _company_code: Constants.ProductionCompany
        }, function(err, appObjects) {
            var appList = [];
            for (var i = 0; i < appObjects.length; i++) {
                appList.push('' + appObjects[i]._id);
            };
            Company.findOneAndUpdate({
                _company_code: _company_code
            }, {
                applications: appList
            });
        });
        res.status(200).send('<p>Registration: user has been validated, please log on using initial password!</p><br><a href="/#/login">Login</a>');
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

router.post('/invite', function(req, res, next) {
    if (!req.query.key) return res.status(401).json({
        err: 'Invalid parameters!'
    });
    if (!req.body.users) return res.status(401).json({
        err: 'Invalid parameters!'
    });
    var token = req.query.key;
    var current_time = Date.now();
    Session.findOneAndUpdate({
        _id: {
            '$eq': token
        },
        timeout: {
            '$gt': current_time
        }
    }, {
        timeout: current_time + Constants.MaxSessionTimeout
    }).populate('user').exec(function(err, existingSession) {
        if (err) return next(err);
        if (!existingSession) return res.status(401).json({
            err: 'Not found user session!'
        });
        UserProfile.findOne({
            _company_code: {
                '$eq': existingSession.user._company_code
            },
            type: {
                '$eq': Constants.UserProfilePrivate
            }
        }, function(err, userprofile) {
            if (err) return next(err);
            if (!userprofile) return res.status(401).json({
                err: 'Not found user profile!'
            });
            for (var i in req.body.users) {
                var invitedUser = req.body.users[i];
                User.findOne({
                    user: invitedUser.user
                }, function(errUserFind, objectUserFind) {
                    if (errUserFind) return next(errUserFind);
                    if (!objectUserFind) {
                        invitedUser.password = Constants.InitialPasswordHash;
                        invitedUser.company = existingSession.user.company;
                        invitedUser._company_code = existingSession.user._company_code;
                        invitedUser.profile = userprofile._id;
                        invitedUser.validated = false;
                        User.create(invitedUser, function(errNewUser, newUser) {
                            if (errNewUser) return next(errNewUser);
                            Email.sendValidation(newUser.email, newUser.user, newUser._company_code);
                        });
                    }
                });
            }
            res.status(200).json({
                msg: 'Invitation: users have been invited to join App1!'
            });
        });
    });

    // 'password':Constants.InitialPasswordHash,'profile':'58249c3e591d37288c45819c','company':'58249c3e591d37288c45819b','_company_code':'smarthys'

});

router.post('/login', function(req, res, next) {
    if (!req.body || !req.body.user || !req.body.password) return res.status(401).json({
        err: 'Invalid user name or password!'
    });
    //console.log(Date.now());
    crypto.pbkdf2(req.body.password, Constants.SecretKey, Constants.SecretIterations, Constants.SecretByteSize, Constants.SecretAlgorithm, function(errCrypto, key) {
        if (errCrypto) return next(errCrypto);
        var hashPassword = key.toString('hex');
        //console.log(Date.now());
        User.findOne({
            user: req.body.user.toLowerCase(),
            password: hashPassword,
            validated: true
        }, 'email firstname lastname user _company_code properties company profile remote_profiles manager reports')
            .populate('company profile remote_profiles').exec(
                function(errUser, userObject) {
                    if (errUser) return res.status(401).json({
                        errUser: info
                    });
                    if (!userObject) return res.status(401).json({
                        err: 'Invalid user name or password!'
                    });
                    Session.findOneAndUpdate({
                        user: userObject._id,
                        _company_code: userObject._company_code
                    }, {
                        user: userObject._id,
                        _company_code: userObject._company_code,
                        timeout: Date.now() + Constants.MaxSessionTimeout
                    }, {
                        upsert: true,
                        new: true
                    }, function(err, newSession) {
                        if (err) return next(err);
                        SessionCache.cacheUser(newSession._id, userObject);
                        res.cookie(Constants.SessionCookie, newSession._id, {
                            maxAge: Constants.MaxSessionTimeout,
                            httpOnly: true
                        }).status(200).json({
                            token: newSession._id,
                            user: SessionCache.userData[newSession._id]
                        });
                    });
                });
    });
});

router.get('/status', function(req, res) {
    if (!req.cookies[Constants.SessionCookie]) return res.status(401).json({
        err: 'Not logged in!'
    });
    var token = req.cookies[Constants.SessionCookie];
    var current_time = Date.now();
    Session.findOneAndUpdate({
        _id: {
            '$eq': token
        },
        timeout: {
            '$gt': current_time
        }
    }, {
        timeout: current_time + Constants.MaxSessionTimeout
    }).populate('user').exec(function(err, existingSession) {
        if (err) return res.status(401).json({
            err: err.info
        });
        if (!existingSession) return res.status(401).json({
            err: 'Invalid session!'
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
                        err: 'Invalid user name or password!'
                    });
                    SessionCache.cacheUser(token, userObject);
                    res.cookie(Constants.SessionCookie, token, {
                        maxAge: Constants.MaxSessionTimeout,
                        httpOnly: true
                    }).status(200).json({
                        token: token,
                        user: SessionCache.userData[token]
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
            err: 'Invalid session!'
        });
        SessionCache.removeUserCache(req.cookies[Constants.SessionCookie]);
        res.clearCookie(Constants.SessionCookie).status(200);
    });
});

router.get('/login_saml/:company_code', function(req, res) {
    var company_code = req.params.company_code;
    Company.findOne({
        _company_code: company_code
    }, function(errCompany, objectCompany) {
        if (!objectCompany.properties || !objectCompany.properties.saml || !objectCompany.properties.saml.enabled)
            return res.status(401).json({
                err: 'Company SAML not setup correctly!'
            });
        var idp_options = {
            sso_login_url: objectCompany.properties.saml.sso_redirect_url,
            certificates: [objectCompany.properties.saml.sso_certificate]
        };
        SessionCache.identityProvider[company_code] = {
            test: objectCompany.properties.saml.test,
            company_id: objectCompany._id
        }
        SessionCache.identityProvider[company_code].idp = new saml2.IdentityProvider(idp_options);
        SessionCache.serviceProvider.create_login_request_url(SessionCache.identityProvider[company_code].idp, {
            relay_state: company_code
        }, function(err, login_url, request_id) {
            if (err) {
                return res.status(500).json({
                    err: err
                });
            }
            res.redirect(login_url);
        });
    });
});

router.post('/saml_callback', function(req, res) {
    var options = {
        request_body: req.body
    };
    var company_code = req.body.RelayState || req.query.RelayState;
    if (!SessionCache.identityProvider[company_code]) return res.status(401).json({
        err: 'Missing company code!'
    });
    SessionCache.serviceProvider.post_assert(SessionCache.identityProvider[company_code].idp, options, function(errSaml, objectSaml) {
        if (errSaml)
            return res.status(401).json({
                err: errSaml.message
            });
        // Save name_id and session_index for logout
        // Note:  In practice these should be saved in the user session, not globally.
        //var name_id = objectSaml.user.name_id;
        //var session_index = objectSaml.user.session_index;
        //objectSaml.user.attributes.EmailAddress[0] FirstName LastName
        if (SessionCache.identityProvider[company_code].test) {
            return res.send('Hello ' + JSON.stringify(objectSaml));
        }
        User.findOne({
            user: objectSaml.user.attributes.EmailAddress[0],
            _company_code: company_code
        }, 'email firstname lastname user _company_code properties company profile remote_profiles manager reports')
            .populate('company profile remote_profiles').exec(
                function(errUser, userObject) {
                    if (errUser) return res.status(401).json({
                        err: errUser
                    });
                    if (!userObject) {
                        UserProfile.findOne({
                            _company_code: company_code,
                            type: Constants.UserProfilePrivate
                        }, function(errProfile, objectProfile) {
                            if (errProfile) return res.status(401).json({
                                err: errProfile
                            });
                            if (!objectProfile) return res.status(401).json({
                                err: 'Missing private user profile'
                            });
                            var user = {
                                user: objectSaml.user.attributes.EmailAddress[0],
                                password: Constants.InitialPasswordHash,
                                email: objectSaml.user.attributes.EmailAddress[0],
                                firstname: objectSaml.user.attributes.FirstName,
                                lastname: objectSaml.user.attributes.LastName,
                                validated: true,
                                properties: {
                                    theme: 'default',
                                    language: 'en'
                                },
                                profile: objectProfile._id,
                                company: SessionCache.identityProvider[company_code].company_id,
                                _company_code: company_code
                            };
                            User.create(user, function(errNewUser, newUser) {
                                if (errNewUser) return next(errNewUser);
                                Session.findOneAndUpdate({
                                    user: newUser._id,
                                    _company_code: newUser._company_code
                                }, {
                                    user: newUser._id,
                                    _company_code: newUser._company_code,
                                    timeout: Date.now() + Constants.MaxSessionTimeout
                                }, {
                                    upsert: true,
                                    new: true
                                }, function(err, newSession) {
                                    if (err) return next(err);
                                    SessionCache.cacheUser(newSession._id, newUser);
                                    return res.cookie(Constants.SessionCookie, newSession._id, {
                                        maxAge: Constants.MaxSessionTimeout,
                                        httpOnly: true
                                    }).redirect('/');
                                });
                                Email.sendSAMLNewUser(newUser.email, newUser.user, newUser._company_code);
                            });
                        });
                    } else {
                        Session.findOneAndUpdate({
                            user: userObject._id,
                            _company_code: userObject._company_code
                        }, {
                            user: userObject._id,
                            _company_code: userObject._company_code,
                            timeout: Date.now() + Constants.MaxSessionTimeout
                        }, {
                            upsert: true,
                            new: true
                        }, function(err, newSession) {
                            if (err) return next(err);
                            SessionCache.cacheUser(newSession._id, userObject);
                            return res.cookie(Constants.SessionCookie, newSession._id, {
                                maxAge: Constants.MaxSessionTimeout,
                                httpOnly: true
                            }).redirect('/');
                        });
                    }
                });
    });
});

router.get('/saml_metadata', function(req, res) {
    res.type('application/xml');
    res.status(200).send(SessionCache.serviceProvider.create_metadata());
});

module.exports = router;
