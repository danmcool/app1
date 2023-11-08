var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var brain = require('brain.js');

var Metadata = require('../models/metadata.js');
var SessionCache = require('../tools/session_cache.js');
var Constants = require('../tools/constants.js');
var Email = require('../tools/email.js');
var Tools = require('../tools/tools.js');
var MarchineLearning = require('../tools/machinelearning.js');
var Print = require('../tools/print.js');
var CalendarTools = require('../tools/calendar_tools.js');

var User = Metadata.User;
var Company = Metadata.Company;
var UserProfile = Metadata.UserProfile;
var Application = Metadata.Application;

router.put('/value/:id', function (req, res, next) {
    var pageOptions = Tools.computePage(req);
    if (!req.query.type || !req.body) return res.status(400).json({
        'msg': 'Missing values parameters!'
    });
    var result = {
        _id: req.params.id,
        values: []
    }
    if (req.query.type == Constants.ValuesTypeUser) {
        if (!req.body.relation) return res.status(400).json({
            'msg': 'Missing values parameters!'
        });
        var userParams = null;
        if (req.body.relation == Constants.ValuesRelationUserReports) {
            userParams = {
                _company_code: SessionCache.userData[req.cookies[Constants.SessionCookie]]._company_code,
                '$or': [{
                    _id: {
                        '$in': SessionCache.userData[req.cookies[Constants.SessionCookie]].reports
                    }
                }, {
                    _id: {
                        '$eq': SessionCache.userData[req.cookies[Constants.SessionCookie]]._id
                    }
                }]
            }
        } else if (req.body.relation == Constants.ValuesRelationUserManager) {
            userParams = {
                _company_code: SessionCache.userData[req.cookies[Constants.SessionCookie]]._company_code,
                _id: {
                    '$in': SessionCache.userData[req.cookies[Constants.SessionCookie]].manager
                }
            }
        } else if (req.body.relation == Constants.ValuesRelationUserList) {
            userParams = {
                _company_code: SessionCache.userData[req.cookies[Constants.SessionCookie]]._company_code,
                _id: {
                    '$in': req.body.id_list
                }
            }
        }
        if (userParams) {
            User.find(userParams, req.body.user_fields).skip(pageOptions.skip).limit(pageOptions.limit).exec(function (errUserObjects, userObjects) {
                if (errUserObjects) return next(errUserObjects);
                if (!userObjects) return res.status(400).json({
                    'msg': 'Url is null!'
                });
                result.values = userObjects;
                return res.status(200).json(result);
            });
        }
    } else if (req.query.type == Constants.ValuesTypeQuery) {
        var queryParams = {
            _company_code: SessionCache.userData[req.cookies[Constants.SessionCookie]]._company_code
        }
        if (req.body.id_list) {
            queryParams._id = {
                '$in': req.body.id_list
            }
        }

        User.find(userParams, req.body.user_fields).skip(pageOptions.skip).limit(pageOptions.limit).exec(function (errUserObjects, userObjects) {
            if (errUserObjects) return next(errUserObjects);
            if (!userObjects) return res.status(400).json({
                msg: 'Url is null!'
            });
            result.values = userObjects;
            return res.status(200).json(result);
        });

        return res.status(200).json('');
    } else {
        return res.status(200).json('');
    }
});

router.get('/form/:id', function (req, res, next) {
    if (!req.params.id) return res.status(400).json({
        msg: 'Form id is null!'
    });
    Metadata.Form.findOne({
        _id: {
            $eq: req.params.id
        }
    }).populate('datamodel values').exec(function (err, formObject) {
        if (err) return next(err);
        if (!formObject) return res.status(400).json({
            msg: 'Url is null!'
        });
        return res.status(200).json(formObject);
    });
});

router.get('/application/', function (req, res, next) {
    var pageOptions = Tools.computePage(req);
    var userData = SessionCache.userData[req.cookies[Constants.SessionCookie]];
    Application.find(SessionCache.filterAddRemoteAppsAndProductionCompanyCode(req, userData.company.applications, userData.remote_applications)).skip(pageOptions.skip).limit(pageOptions.limit).populate('profiles default_profile workflows').exec(function (err, apps) {
        if (err) return next(err);
        var remoteProfiles = userData.remote_profiles;
        var userToken = req.cookies[Constants.SessionCookie];
        var i, j, k;
        var resultApps = [];
        for (var c = 0; userData.company.applications && c < userData.company.applications.length; c++) {
            for (i = 0; i < apps.length; i++) {
                if (userData.company.applications[c] != apps[i]._id) {
                    continue;
                }
                var profileFound = null;
                if (SessionCache.userData[userToken].profile.type == Constants.UserProfilePublic && (!apps[i].profiles || apps[i].profiles.length == 0)) {
                    continue;
                } else {
                    if (SessionCache.userData[userToken].profile.type == Constants.UserProfilePublic) {
                        for (j = 0; j < apps[i].profiles.length; j++) {
                            if (apps[i].profiles[j].properties && apps[i].profiles[j].properties.user == Constants.UserProfilePublic) {
                                profileFound = apps[i].profiles[j];
                                break;
                            }
                        }
                    } else {
                        for (j = 0; j < remoteProfiles.length; j++) {
                            if (remoteProfiles[j].profile.applications[apps[i]._id]) {
                                if (remoteProfiles[j].type == Constants.UserProfileApplication) {
                                    profileFound = remoteProfiles[j];
                                }
                            }
                        }
                        if (!profileFound) {
                            profileFound = apps[i].default_profile;
                        }
                    }
                }
                var currentApp = JSON.parse(JSON.stringify(apps[i]));
                currentApp.remote = false;
                if (profileFound && profileFound.profile && profileFound.profile.applications && profileFound.profile.applications[currentApp._id]) {
                    for (k = currentApp.workflows.length - 1; k >= 0; k--) {
                        if (!profileFound.profile.applications[currentApp._id].workflows[currentApp.workflows[k]._id]) {
                            currentApp.workflows.splice(k, 1);
                        }
                    }
                }
                resultApps.push(currentApp);
                break;
            }
        }
        var companyCodes = [];
        for (var r = 0; userData.remote_applications && r < userData.remote_applications.length; r++) {
            for (i = 0; i < apps.length; i++) {
                if (userData.remote_applications[r] != apps[i]._id) {
                    continue;
                }
                var profilesFound = [];
                for (j = 0; j < remoteProfiles.length; j++) {
                    if (remoteProfiles[j].profile.applications[apps[i]._id]) {
                        if (remoteProfiles[j].type == Constants.UserProfileApplication || remoteProfiles[j].type == Constants.UserProfileShare) {
                            profilesFound.push(remoteProfiles[j]);
                        }
                    }
                }
                if (profilesFound.length > 0) {
                    for (var p = 0; p < profilesFound.length; p++) {
                        var currentApp = JSON.parse(JSON.stringify(apps[i]));
                        if (profilesFound[p] && profilesFound[p].type == Constants.UserProfileShare) {
                            currentApp.remote = true;
                            currentApp.pid = profilesFound[p]._id;
                            currentApp.company_name = profilesFound[p]._company_code;
                            companyCodes.push(profilesFound[p]._company_code);
                        }
                        if (profilesFound[p]) {
                            for (k = currentApp.workflows.length - 1; k >= 0; k--) {
                                if (!profilesFound[p].profile.applications[currentApp._id].workflows[currentApp.workflows[k]._id]) {
                                    currentApp.workflows.splice(k, 1);
                                }
                            }
                        }
                        resultApps.push(currentApp);
                    }
                }
            }
        }
        if (companyCodes.length == 0) {
            res.json(resultApps);
        } else {
            Company.find({
                _company_code: {
                    $in: companyCodes
                }
            }, function (err, companies) {
                if (err) return next(err);
                if (!companies) return res.status(400).json({
                    msg: 'Missing company data!'
                });
                var resultAppsStr = JSON.stringify(resultApps);
                for (var c = 0; c < companies.length; c++) {
                    resultAppsStr = resultAppsStr.replace(new RegExp(companies[c]._company_code, 'g'), companies[c].name);
                }
                res.json(JSON.parse(resultAppsStr));
            });
        }
    });
});

router.get('/application/:id', function (req, res, next) {
    Application.findOne(SessionCache.filterAddProductionCompanyCode(req, {
        _id: req.params.id
    })).populate('profiles default_profile workflows').exec(function (err,
        app) {
        if (err) return next(err);
        var remoteProfiles = SessionCache.userData[req.cookies[Constants.SessionCookie]].remote_profiles;
        var userToken = req.cookies[Constants.SessionCookie];
        if (!app.profiles || app.profiles.length == 0) {
            if (SessionCache.userData[userToken].profile.type == Constants.UserProfilePublic) {
                return res.json({});
            }
        }
        var profileFound;
        if (SessionCache.userData[userToken].profile.type != Constants.UserProfilePublic) {
            profileFound = app.default_profile;
        }
        for (var j = 0; j < remoteProfiles.length; j++) {
            if (remoteProfiles[j].profile.applications[app._id]) {
                if (SessionCache.userData[userToken].profile.type == Constants.UserProfilePublic) {
                    if (remoteProfiles[j].type == Constants.UserProfileShare) {
                        profileFound = remoteProfiles[j];
                        break;
                    }
                } else {
                    if (remoteProfiles[j].type == Constants.UserProfileApplication) {
                        profileFound = remoteProfiles[j];
                        break;
                    }
                }
            }
        }
        if (profileFound && profileFound.profile.applications[app._id]) {
            for (var k = app.workflows.length - 1; k >= 0; k--) {
                if (!profileFound.profile.applications[app._id].workflows[app.workflows[k]._id]) {
                    app.workflows.splice(k, 1);
                }
            }
        }
        res.json(app);
    });
});

router.get('/user/', function (req, res, next) {
    var token = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[token].profile.type == Constants.UserProfilePublic) {
        return res.status(401).json({
            errUser: 'Not enough user rights'
        });
    }
    var pageOptions = Tools.computePage(req);
    var sort_by = JSON.parse(req.query.sort_by ? req.query.sort_by : '{}');
    var search_criteria = {
        _company_code: {
            $eq: SessionCache.userData[token]._company_code
        }
    }
    var searchScoreProjection = {};
    if (req.query.search_text && req.query.search_text != '') {
        search_criteria['$text'] = {
            $search: req.query.search_text
        };
        searchScoreProjection = {
            score: {
                $meta: 'textScore'
            }
        }
        sort_by = {
            score: {
                $meta: 'textScore'
            }
        }
    }
    User.find(search_criteria, searchScoreProjection).skip(pageOptions.skip).limit(pageOptions.limit).sort(sort_by).exec(function (err, objects) {
        if (err) return next(err);
        res.json(objects);
    });
});

router.put('/user/:id', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type == Constants.UserProfilePublic) {
        return res.status(401).json({
            errUser: 'Not enough user rights'
        });
    }
    var newUserProperties = {};
    if (req.body.properties) {
        newUserProperties.properties = req.body.properties;
    }
    if (req.body.remote_profiles) {
        newUserProperties.remote_profiles = req.body.remote_profiles;
    }
    if (req.body.user) {
        req.body.user = req.body.user.toLowerCase();
    }
    User.findOneAndUpdate(SessionCache.filterCompanyCode(req, {
        _id: req.params.id
    }), newUserProperties, function (err, object) {
        if (err) return next(err);
        if (object) {
            SessionCache.removeUserCache(userToken);
            return res.json(object);
        } else {
            return res.status(401).json({
                errUser: 'Not enough user rights'
            });
        }
    });
});

router.get('/company/:id', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type == Constants.UserProfilePublic) {
        return res.status(401).json({
            errUser: 'Not enough user rights'
        });
    }
    Company.findOne(SessionCache.filterCompanyCode(req, {
        _id: req.params.id
    }), function (err, object) {
        if (err) return next(err);
        res.json(object);
    });
});

router.put('/company/:id', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type == Constants.UserProfilePublic) {
        return res.status(401).json({
            errUser: 'Not enough user rights'
        });
    }
    Company.findOneAndUpdate(SessionCache.filterCompanyCode(req, {
        _id: req.body._id
    }), req.body, function (err, object) {
        if (err) return next(err);
        res.json(object);
        SessionCache.removeUserCache(userToken);
    });
});

router.put('/share', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type == Constants.UserProfilePublic) {
        return res.status(401).json({
            err: 'Not enough user rights'
        });
    }
    if (!req.body.app_profile_id) {
        return res.status(400).json({
            err: 'Invalid parameters!'
        });
    }
    UserProfile.findOne({
        _id: req.body.app_profile_id
    }, function (errProfile, objectProfile) {
        if (errProfile) return next(errProfile);
        if (!objectProfile || !objectProfile.properties) return res.status(400).json({
            err: 'Invalid parameters!'
        });
        var userProfile = {
            name: {
                en: 'Share'
            },
            profile: objectProfile.profile,
            properties: objectProfile.properties,
            type: Constants.UserProfileShare,
            _company_code: SessionCache.userData[userToken]._company_code
        }
        if (objectProfile.properties.user == Constants.UserProfilePublic) {
            var appId = Object.keys(objectProfile.profile.applications)[0];
            var workflowId = Object.keys(objectProfile.profile.applications[appId].workflows)[0];
            var applicationsFilter = 'profile.applications.' + appId + '.workflows.' + workflowId;
            var filter = {
                'properties.user': Constants.UserProfilePublic,
                _company_code: SessionCache.userData[userToken]._company_code,
                type: Constants.UserProfileShare
            }
            filter[applicationsFilter] = true;
            UserProfile.findOne(filter, function (errExistingProfile, objectExistingProfile) {
                if (errExistingProfile) return next(errExistingProfile);
                if (!objectExistingProfile) {
                    UserProfile.create(userProfile, function (err, newUserprofile) {
                        if (err) return next(err);
                        res.status(200).json({
                            msg: 'Application shared successfully (new share)!',
                            share_url: 'https://' + process.env.APP1_SERVER_NAME + '/authentication/open?pid=' + newUserprofile._id
                        });
                        Email.sendSharePublic(SessionCache.userData[userToken].email, newUserprofile._id, req.body.app_name, req.body.profile_name);
                    });
                } else {
                    res.status(200).json({
                        msg: 'Application shared successfully (existing share)!',
                        share_url: 'https://' + process.env.APP1_SERVER_NAME + '/authentication/open?pid=' + objectExistingProfile._id
                    });
                    Email.sendSharePublic(SessionCache.userData[userToken].email, objectExistingProfile._id, req.body.app_name, req.body.profile_name);
                }
            });
        } else if (objectProfile.properties.workflow) {
            var appId = Object.keys(objectProfile.profile.applications)[0];
            var workflowId = Object.keys(objectProfile.profile.applications[appId].workflows)[0];
            var applicationsFilter = 'profile.applications.' + appId + '.workflows.' + workflowId;
            var filter = {
                'properties.workflow': true,
                _company_code: SessionCache.userData[userToken]._company_code,
                type: Constants.UserProfileShare
            }
            filter[applicationsFilter] = true;
            UserProfile.findOne(filter, function (errExistingProfile, objectExistingProfile) {
                if (errExistingProfile) return next(errExistingProfile);
                if (!objectExistingProfile) {
                    UserProfile.create(userProfile, function (err, newUserprofile) {
                        if (err) return next(err);
                        res.status(200).json({
                            msg: 'Application shared successfully (new share)!',
                            share_url: 'https://' + process.env.APP1_SERVER_NAME + '/authentication/open?pid=' + newUserprofile._id
                        });
                        Email.sendSharePrivate(SessionCache.userData[userToken].email, newUserprofile._id, req.body.app_name, req.body.profile_name);
                    });
                } else {
                    res.status(200).json({
                        msg: 'Application shared successfully (existing share)!',
                        share_url: 'https://' + process.env.APP1_SERVER_NAME + '/authentication/open?pid=' + objectExistingProfile._id
                    });
                    Email.sendSharePublic(SessionCache.userData[userToken].email, objectExistingProfile._id, req.body.app_name, req.body.profile_name);
                }
            });
        } else {
            if (!userProfile.profile.datamodels) {
                userProfile.profile.datamodels = {};
            }
            userProfile.profile.datamodels[req.body.datamodel_id] = {};
            userProfile.profile.datamodels[req.body.datamodel_id][req.body.data_id] = {
                _company_code: SessionCache.userData[userToken]._company_code,
                constraint: {
                    key: req.body.key,
                    value: req.body.value
                }
            }
            UserProfile.create(userProfile, function (err, newUserprofile) {
                if (err) return next(err);
                res.status(200).json({
                    msg: 'Application shared successfully!',
                    share_url: 'https://' + process.env.APP1_SERVER_NAME + '/authentication/open?pid=' + newUserprofile._id
                });
                if (!req.body.message) {
                    req.body.message = '';
                }
                Email.sendShare(req.body.email, SessionCache.userData[userToken].email, newUserprofile._id, Email.prepareMessage(req.body.message, SessionCache.userData[userToken]));
            });
        }
    });
});

router.get('/calendar', function (req, res, next) {
    if (!req.query.project_name || !req.query.start_date || !req.query.end_date || !req.query.user_id) return res.status(400).json({
        err: 'Invalid parameters!'
    });
    User.findOne({
        _id: req.query.user_id,
        _company_code: SessionCache.userData[req.cookies[Constants.SessionCookie]]._company_code,
        validated: true
    }, 'email firstname lastname').exec(function (errUser, userObject) {
        if (errUser) return next(errUser);
        if (!userObject) return res.status(400).json({
            err: 'Invalid parameters!'
        });
        res.status(200).json({
            msg: 'Calendar sent!'
        });
        Email.sendCalendar(userObject.email, req.query.project_name, req.query.start_date, req.query.end_date, true, userObject.firstname);
    });
});

router.delete('/reservation/:datamodel_id/:id', function (req, res, next) {
    if (!req.query.object_id_path || !req.query.period_path) {
        return res.status(400).json({
            err: 'Invalid parameters!'
        });
    }
    var token = req.cookies[Constants.SessionCookie];
    var user = SessionCache.userData[token];
    var reservation_search_criteria = {
        _id: req.params.id
    }
    var reservation_datamodel_id = req.params.datamodel_id;
    if (SessionCache.createSecurityFiltersDelete(token, null, reservation_datamodel_id, req.params.id, reservation_search_criteria)) {
        Metadata.Objects[reservation_datamodel_id].findOneAndRemove(reservation_search_criteria, function (errRes, objectRes) {
            if (errRes) return next(errRes);
            if (!objectRes) {
                res.status(400).json({
                    msg: 'No reservation object found!'
                });
            }
            var model = mongoose.model(Constants.DataModelPrefix + reservation_datamodel_id).schema.obj;
            var datamodel_id = Tools.resolvePath(model, req.query.object_id_path);
            var object_search_criteria = {
                _id: Tools.resolvePath(objectRes, req.query.object_id_path)
            }
            if (!datamodel_id || !datamodel_id.ref) {
                return res.status(400).json({
                    msg: 'Incompatible reservation model!'
                });
            }
            var object_datamodel_id = datamodel_id.ref.substr(5);
            var startTime = new Date(Tools.resolvePath(objectRes, req.query.period_path + '.start_time'));
            var endTime = new Date(Tools.resolvePath(objectRes, req.query.period_path + '.end_time'));
            if (!startTime || !endTime || startTime >= endTime || (startTime.getTime() + Constants.OneWeek) < endTime.getTime()) {
                return res.status(400).json({
                    err: 'Invalid time parameter!'
                });
            }
            if (SessionCache.createSecurityFiltersUpdate(token, null, object_datamodel_id, object_search_criteria._id, object_search_criteria)) {
                Metadata.Objects[object_datamodel_id].findOne(object_search_criteria, function (err, object) {
                    if (err) return next(err);
                    if (!object) {
                        return res.status(400).json({
                            msg: 'No object found!'
                        });
                    } else {
                        object_search_criteria._updated_at = object._updated_at;
                        object._updated_at = Date.now();
                        if (!object._appointments) {
                            object._appointments = {};
                        }
                        if (CalendarTools.removeEvent(object._appointments, object._appointment_properties, startTime, endTime, user._id, objectRes._id)) {
                            Metadata.Objects[object_datamodel_id].findOneAndUpdate(object_search_criteria, object, function (errUpdated, objectUpdated) {
                                if (errUpdated) return next(errUpdated);
                                if (!objectUpdated) {
                                    return res.status(400).json({
                                        msg: 'No object found!'
                                    });
                                }
                                return res.status(200).json({
                                    msg: 'Reservation deleted!'
                                });
                            });
                        }
                    }
                });
            }
        });
    } else {
        return res.status(401).json({
            err: 'Not enough user rights!'
        });
    }
});

router.put('/event/:datamodel_id/:object_id', function (req, res, next) {
    if (!req.body.start_time || !req.body.end_time || !req.body.object_name || !req.body.reservation_datamodel_id || !req.body.reservation_object) {
        return res.status(400).json({
            err: 'Invalid parameters!'
        });
    }
    var startTime = new Date(req.body.start_time);
    var endTime = new Date(req.body.end_time);
    if (!startTime || !endTime || startTime >= endTime || (startTime.getTime() + Constants.OneWeek) < endTime.getTime()) {
        return res.status(400).json({
            err: 'Invalid time parameter!'
        });
    }
    var token = req.cookies[Constants.SessionCookie];
    var user = SessionCache.userData[token];
    var search_criteria = CalendarTools.computeQuery(startTime, endTime);
    search_criteria._id = {
        $eq: req.params.object_id
    }
    if (SessionCache.createSecurityFiltersUpdate(token, null, req.params.datamodel_id, search_criteria._id, search_criteria)) {
        Metadata.Objects[req.params.datamodel_id].findOne(search_criteria, function (err, object) {
            if (err) return next(err);
            if (!object) {
                res.status(400).json({
                    msg: 'No object found!'
                });
            } else {
                search_criteria._updated_at = object._updated_at;
                object._updated_at = Date.now();
                if (!object._appointments) {
                    object._appointments = {};
                }
                if (!object._appointment_properties || !object._appointment_properties.days) {
                    return res.status(400).json({
                        msg: 'No days available!'
                    });
                }
                var reservation = req.body.reservation_object;
                reservation._user = user._id;
                reservation._company_code = object._company_code;
                reservation._created_at = object._updated_at;
                reservation._updated_at = object._updated_at;
                Metadata.Objects[req.body.reservation_datamodel_id].create(reservation, function (errRes, objectRes) {
                    if (errRes) return next(errRes);
                    if (!objectRes) {
                        res.status(400).json({
                            msg: 'Invalid reservation object!'
                        });
                    }
                    if (CalendarTools.addEvent(object._appointments, object._appointment_properties, startTime, endTime, user._id, objectRes.id)) {
                        Metadata.Objects[req.params.datamodel_id].findOneAndUpdate(search_criteria, object, function (err, object) {
                            if (err) {
                                Metadata.Objects[req.body.reservation_datamodel_id].findOneAndRemove(objectRes.id);
                                return next(err);
                            }
                            if (!object) {
                                Metadata.Objects[req.body.reservation_datamodel_id].findOneAndRemove(objectRes.id);
                                delete search_criteria._updated_at;
                                Metadata.Objects[req.params.datamodel_id].findOne(search_criteria, function (err, object) {
                                    if (err) return next(err);
                                    res.status(400).json(object);
                                    // Timeslot is unavailable!
                                });
                            }
                            Email.sendCalendar(user.email, req.body.object_name, req.body.start_time, req.body.end_time, false, user.firstname);
                            return res.status(200).json({
                                msg: 'Reservation done!'
                            });
                        });
                    } else {
                        Metadata.Objects[req.body.reservation_datamodel_id].findOneAndRemove(objectRes.id);
                        return res.status(400).json({
                            msg: 'Timeslot is unavailable!'
                        });
                    }
                });
            }
        });
    } else {
        return res.status(401).json({
            err: 'Not enough user rights!'
        });
    }
});

router.put('/notify/:user_id', function (req, res, next) {
    if (!req.body.email_title || !req.body.email_html) return res.status(400).json({
        err: 'Invalid parameters!'
    });
    User.findOne({
        _id: req.params.user_id,
        validated: true
    }, 'email firstname lastname').populate('company').exec(function (errUser, userObject) {
        if (errUser) return next(errUser);
        if (!userObject) return res.status(400).json({
            err: 'Invalid parameters!'
        });
        res.status(200).json({
            msg: 'Email sent!'
        });
        Email.send(userObject.email, null, req.body.email_title, 'Automatic message from App1', Email.prepareMessage(req.body.email_html, userObject));
    });
});

router.get('/payment_callback/:datamodel_id/:id', function (req, res, next) {
    if (!req.query.pid || !req.query.value_path || !req.query.value || !req.query.next_form_id || !req.query.workflow_id || !req.query.application_id) {
        return res.status(400).json({
            err: 'Invalid parameters!'
        });
    }
    var token = req.query.pid;
    SessionCache.isActiveToken(token, function (active) {
        if (!active) {
            return res.status(401).json({
                err: 'Session no longer active!'
            });
        }
        var datamodel_id = req.params.datamodel_id;
        var search_criteria = {
            _id: req.params.id
        }
        if (SessionCache.createSecurityFiltersUpdate(token, null, datamodel_id, req.params.id, search_criteria)) {
            var object = {};
            Tools.resolvePathUpdate(object, req.query.value_path, req.query.value);
            Metadata.Objects[datamodel_id].findOneAndUpdate(search_criteria, object, function (errUpdated, objectUpdated) {
                if (errUpdated) return next(errUpdated);
                if (!objectUpdated) {
                    return res.status(400).json({
                        msg: 'No object found!'
                    });
                }
                return res.redirect('/#!/form/' + req.query.next_form_id + '/' + req.params.id + '?application_id=' + req.query.application_id + '&workflow_id=' + req.query.workflow_id);
            });
        } else {
            return res.status(401).json({
                err: 'Not enough user rights!'
            });
        }
    });
});

router.get('/model_train/:datamodel_id/:mlmodel_id', function (req, res, next) {
    var token = req.cookies[Constants.SessionCookie];
    var searchCriteriaMlmodel = {
        _id: req.params.mlmodel_id,
        _company_code: SessionCache.userData[req.cookies[Constants.SessionCookie]]._company_code
    }
    var datamodel_id = req.params.datamodel_id;
    var dataSearchCriteria = {};
    var dataSearchScoreProjection = {};
    if (SessionCache.createSecurityFiltersUpdate(token, null, datamodel_id, dataSearchCriteria, dataSearchCriteria)) {
        Metadata.MachineLearningModel.findOne(searchCriteriaMlmodel).exec(function (err, mlObject) {
            if (err) return next(err);
            if (!mlObject) return res.status(400).json({
                msg: 'No machine learning model found!'
            });
            if (SessionCache.createSecurityFiltersList(token, datamodel_id, null, dataSearchCriteria)) {
                var trainData = [];
                Metadata.Objects[datamodel_id].find(dataSearchCriteria, dataSearchScoreProjection).limit(Constants.MachineLearningMaxTrainingDataPoints).cursor({
                    batchSize: Constants.MachineLearningMaxTrainingBatch
                }).on('data', function (data) {
                    var newPreparedData = {
                        input: [],
                        output: []
                    }
                    for (var j = 0; j < mlObject.output.length; j++) {
                        newPreparedData.output.push(MarchineLearning.normalizeValue(eval(mlObject.output[j].formula)));
                    }
                    if (newPreparedData.output.length > 0) {
                        for (var i = 0; i < mlObject.input.length; i++) {
                            newPreparedData.input.push(eval(mlObject.input[i].formula));
                        }
                        //console.log(newPreparedData);
                        trainData.push(newPreparedData);
                    }
                }).on('end', function () {
                    mlObject.learning_result.run_date = Date.now();
                    console.log(mlObject.learning_configuration);
                    var config = {
                        //binaryThresh: 0.5,
                        hiddenLayers: [3], // array of ints for the sizes of the hidden layers in the network
                        //activation: 'sigmoid', // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh'],
                        //leakyReluAlpha: 0.01, // supported for activation type 'leaky-relu'
                        errorThresh: Math.max(0.005, mlObject.learning_configuration.error_threshold), // error threshold to reach
                        iterations: Math.min(20000, mlObject.learning_configuration.max_iterations), // maximum training iterations
                        log: true, // console.log() progress periodically
                        logPeriod: 10000, // number of iterations between logging
                        learningRate: Math.max(0.3, mlObject.learning_configuration.learning_rate) // learning rate
                    }
                    console.log('new brain');
                    console.log(config);
                    var net = new brain.NeuralNetwork(config);
                    var trainingStream = new brain.TrainStream({
                        neuralNetwork: net,
                        floodCallback: function () {
                            MarchineLearning.trainDataStream(trainingStream, trainData);
                        },
                        doneTrainingCallback: function (obj) {
                            console.log(obj);
                            mlObject.learning_result.iterations = obj.iterations;
                            mlObject.learning_result.error = obj.error;
                            mlObject.brain = net;
                            Metadata.MachineLearningModel.findOneAndUpdate(searchCriteriaMlmodel, mlObject, function (errUpdated, objectUpdated) {
                                if (errUpdated) return next(errUpdated);
                                if (!objectUpdated) {
                                    return res.status(400).json({
                                        msg: 'No object found!'
                                    });
                                }
                            });
                        }
                    });
                    console.log(trainData);
                    MarchineLearning.trainDataStream(trainingStream, trainData);
                });
            } else {
                return res.status(401).json({
                    err: 'Not enough user rights!'
                });
            }
            return res.status(200).json('');
        });
    }
});

router.get('/model_run/:datamodel_id/:data_id/:mlmodel_id', function (req, res, next) {
    var token = req.cookies[Constants.SessionCookie];
    var searchCriteriaMlmodel = {
        _id: req.params.mlmodel_id,
        _company_code: SessionCache.userData[req.cookies[Constants.SessionCookie]]._company_code
    }
    var datamodel_id = req.params.datamodel_id;
    var mlSearchCriteria = {};
    if (SessionCache.createSecurityFiltersUpdate(token, null, datamodel_id, req.params.mlmodel_id, mlSearchCriteria)) {
        Metadata.MachineLearningModel.findOne(mlSearchCriteria).exec(function (errML, mlObject) {
            if (errML) return next(errML);
            if (!mlObject) return res.status(400).json({
                msg: 'No machine learning model found!'
            });

            var dataSearchCriteria = {};
            var datamodel_id = req.params.datamodel_id;
            var search_criteria = {
                _id: req.params.data_id
            }
            if (SessionCache.createSecurityFiltersUpdate(token, null, datamodel_id, req.params.data_id, search_criteria)) {
                var object = {};
                Tools.resolvePathUpdate(object, req.query.value_path, req.query.value);
                Metadata.Objects[datamodel_id].findOne(search_criteria, object, function (errObject, object) {
                    mlObject.brain.run();
                });
            }
        });
    }
});

router.get('/pdf/:datamodel_id/:data_id/:html_file_id', function (req, res, next) {
    var token = req.cookies[Constants.SessionCookie];
    var datamodel_id = req.params.datamodel_id;
    var searchCriteriaPrint = {
        _id: datamodel_id,
        _company_code: SessionCache.userData[req.cookies[Constants.SessionCookie]]._company_code
    }
    if (SessionCache.createSecurityFiltersUpdate(token, null, datamodel_id, req.params.data_id, searchCriteriaPrint)) {
        Metadata.MachineLearningModel.findOne(searchCriteriaPrint).exec(function (errML, mlObject) {
            if (errML) return next(errML);
            if (!mlObject) return res.status(400).json({
                msg: 'No machine learning model found!'
            });

            var dataSearchCriteria = {};
            var datamodel_id = req.params.datamodel_id;
            var search_criteria = {
                _id: req.params.data_id
            }
            if (SessionCache.createSecurityFiltersUpdate(token, null, datamodel_id, req.params.data_id, search_criteria)) {
                var object = {};
                Tools.resolvePathUpdate(object, req.query.value_path, req.query.value);
                Metadata.Objects[datamodel_id].findOne(search_criteria, object, function (errObject, object) {
                    mlObject.brain.run();
                });
            }
        });
    }
});

module.exports = router;
