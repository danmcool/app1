var express = require('express');
var router = express.Router();

var Metadata = require('../models/metadata.js');
var SessionCache = require('../tools/session_cache.js');
var Constants = require('../tools/constants.js');
var Email = require('../tools/email.js');

var User = Metadata.User;
var Company = Metadata.Company;
var UserProfile = Metadata.UserProfile;
var Application = Metadata.Application;

var computePage = function (req) {
    return {
        skip: parseInt(req.query.skip) || Constants.QuerySkip,
        limit: parseInt(req.query.limit) || Constants.QueryLimit
    }
}

router.put('/value/:id', function (req, res, next) {
    var pageOptions = computePage(req);
    if (!req.query.type) return res.status(400).json({
        'msg': 'Missing values parameters!'
    });
    var result = {
        _id: req.params.id,
        index: req.body.index,
        values: []
    };
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
            };
        } else if (req.body.relation == Constants.ValuesRelationUserManager) {
            userParams = {
                _company_code: SessionCache.userData[req.cookies[Constants.SessionCookie]]._company_code,
                _id: {
                    '$in': SessionCache.userData[req.cookies[Constants.SessionCookie]].manager
                }
            };
        } else if (req.body.relation == Constants.ValuesRelationUserList) {
            userParams = {
                _company_code: SessionCache.userData[req.cookies[Constants.SessionCookie]]._company_code,
                _id: {
                    '$in': req.body.id_list
                }
            };
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

        return res.status(200).json('');
    } else {
        return res.status(200).json('');
    }
});

router.get('/form/:id', function (req, res, next) {
    if (!req.params.id) return res.status(400).json({
        msg: 'Form id is null!'
    });
    Metadata.Form.findOne(SessionCache.filterAddProductionCompanyCode(req, {
        _id: {
            $eq: req.params.id
        }
    })).populate('datamodel values').exec(function (err, formObject) {
        if (err) return next(err);
        if (!formObject) return res.status(400).json({
            msg: 'Url is null!'
        });
        return res.status(200).json(formObject);
    });
});

router.get('/application/', function (req, res, next) {
    var pageOptions = computePage(req);
    Application.find(SessionCache.filterAddProductionCompanyCode(req, {
        _id: {
            $in: SessionCache.userData[req.cookies[Constants.SessionCookie]].company.applications
        },
        active: true
    })).skip(pageOptions.skip).limit(pageOptions.limit).populate('profiles default_profile workflows').exec(function (err,
        apps) {
        if (err) return next(err);
        var remoteProfiles = SessionCache.userData[req.cookies[Constants.SessionCookie]].remote_profiles;
        var userToken = req.cookies[Constants.SessionCookie];
        for (var i = apps.length - 1; i >= 0; i--) {
            if (!apps[i].profiles || apps[i].profiles.length == 0) {
                if (SessionCache.userData[userToken].profile.type == Constants.UserProfilePublic) {
                    apps.splice(i, 1);
                }
                continue;
            }
            var profileFound;
            if (SessionCache.userData[userToken].profile.type != Constants.UserProfilePublic) {
                profileFound = apps[i].default_profile;
            }
            for (var j = 0; j < remoteProfiles.length; j++) {
                if (remoteProfiles[j].profile.applications[apps[i]._id]) {
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
            if (profileFound && profileFound.profile.applications[apps[i]._id]) {
                for (var k = apps[i].workflows.length - 1; k >= 0; k--) {
                    if (!profileFound.profile.applications[apps[i]._id].workflows[apps[i].workflows[k]._id]) {
                        apps[i].workflows.splice(k, 1);
                    }
                }
            }
        }
        res.json(apps);
    });
});

router.get('/application/:id', function (req, res, next) {
    var pageOptions = computePage(req);
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

router.put('/user/:id', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type == Constants.UserProfilePublic) {
        return res.status(401).json({
            errUser: 'Not enough user rights'
        });
    }
    var newUserProperties = {
        properties: req.body.properties
    };
    if (!req.body.properties) {
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
        if (!objectProfile) return res.status(400).json({
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
        };
        if (objectProfile.properties.user && objectProfile.properties.user == Constants.UserProfilePublic) {
            var appId = Object.keys(objectProfile.profile.applications)[0];
            var workflowId = Object.keys(objectProfile.profile.applications[appId].workflows)[0];
            var applicationsFilter = 'profile.applications.' + appId + '.workflows.' + workflowId;
            var filter = {
                'properties.user': Constants.UserProfilePublic,
                _company_code: SessionCache.userData[userToken]._company_code,
                type: Constants.UserProfileShare
            };
            filter[applicationsFilter] = true;
            UserProfile.findOne(filter, function (errExistingProfile, objectExistingProfile) {
                if (errExistingProfile) return next(errExistingProfile);
                if (!objectExistingProfile) {
                    UserProfile.create(userProfile, function (err, newUserprofile) {
                        if (err) return next(err);
                        res.status(200).json({
                            msg: 'Application shared successfully (new share)!',
                            share_url: 'http://' + Constants.WebAddress + '/authentication/open?pid=' + newUserprofile._id
                        });
                        Email.sendSharePublic(SessionCache.userData[userToken].email, newUserprofile._id, req.body.app_name, req.body.profile_name);
                    });
                } else {
                    res.status(200).json({
                        msg: 'Application shared successfully (existing share)!',
                        share_url: 'http://' + Constants.WebAddress + '/authentication/open?pid=' + objectExistingProfile._id
                    });
                    Email.sendSharePublic(SessionCache.userData[userToken].email, objectExistingProfile._id, req.body.app_name, req.body.profile_name);
                }
            });
        } else {
            if (!userProfile.profile.datamodels) {
                userProfile.profile.datamodels = {};
            }
            userProfile.profile.datamodels[req.query.datamodel_id] = {};
            userProfile.profile.datamodels[req.query.datamodel_id][req.query.data_id] = {
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
                    share_url: 'http://' + Constants.WebAddress + '/authentication/open?pid=' + newUserprofile._id
                });
                Email.sendShare(req.body.email, SessionCache.userData[userToken].email, req.query.data_id, newUserprofile._id);
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
        Email.sendCalendar(userObject.email, req.query.project_name, req.query.start_date, req.query.end_date, ((userObject.firstname ? userObject.firstname : '') + ' ' + (userObject.lastname ? userObject.lastname : '')));
    });
});

var computeDateKey = function (date) {
    return [date.getFullYear(), date.getMonth() + 1, date.getDate()].join("-");
}
var computeTimeObject = function (time) {
    return time.hours * 60 + time.minutes * 1;
}
var computeTimeDate = function (time) {
    return time.getHours() * 60 + time.getMinutes();
}
var checkTimeIntersection = function (startTime1, endTime1, startTime2, endTime2) {
    if (computeTimeObject(startTime1) <= computeTimeDate(startTime2) && computeTimeDate(startTime2) < computeTimeObject(endTime1)) return true;
    if (computeTimeDate(startTime2) <= computeTimeObject(startTime1) && computeTimeObject(startTime1) < computeTimeDate(endTime2)) return true;
    return false;
}
router.put('/event/:id', function (req, res, next) {
    if (!req.body.start_time || !req.body.end_time || !req.body.object_name || !req.body.datamodel_id) {
        return res.status(400).json({
            err: 'Invalid parameters!'
        });
    }
    var startTime = new Date(req.body.start_time);
    var endTime = new Date(req.body.end_time);
    if (!startTime || !endTime || startTime >= endTime || (startTime.getTime() + Constants.OneWeek) < endTime.getTime() || startTime.getDay() > endTime.getDay()) {
        return res.status(400).json({
            err: 'Invalid time parameter!'
        });
    }
    var token = req.cookies[Constants.SessionCookie];
    var user = SessionCache.userData[token];
    var profile = SessionCache.getProfile(token, req.params.datamodelid);
    var remote_profile = {};
    var remote = false;
    if (user.remote_profiles && user.remote_profiles.length > 0) {
        for (var i = 0; i < user.remote_profiles.length; i++) {
            if (user.remote_profiles[i].type == Constants.UserProfileShare && user.remote_profiles[i].profile.datamodels[req.params.datamodelid] && user.remote_profiles[i].profile.datamodels[req.params.datamodelid][req.params.id]) {
                remote_profile = user.remote_profiles[i].profile.datamodels[req.params.datamodelid][req.params.id];
                remote = true;
                break;
            }
        }
    }
    if (!profile || !profile.datamodels[req.body.datamodel_id] || !profile.datamodels[req.body.datamodel_id].update || !req.body._user) {
        if (!remote) {
            return res.status(401).json({
                err: 'Not enough user rights!'
            });
        }
    }
    var search_criteria = {
        _id: {
            '$eq': req.params.id
        }
    }
    if (remote) {
        search_criteria._company_code = {
            '$eq': remote_profile._company_code
        };
        search_criteria._user = {
            '$eq': req.body._user
        };
        search_criteria[remote_profile.constraint.key] = {
            '$eq': remote_profile.constraint.value
        };
    } else {
        search_criteria._company_code = {
            '$eq': profile.datamodels[req.body.datamodel_id].update._company_code
        };
        if (profile.datamodels[req.body.datamodel_id].update._user) {
            search_criteria._user = {
                '$in': profile.datamodels[req.body.datamodel_id].update._user
            };
        }
    }
    search_criteria._updated_at = Date.parse(req.body._updated_at);
    Metadata.Objects[req.body.datamodel_id].findOne(search_criteria, function (err, object) {
        if (err) return next(err);
        if (!object) {
            delete search_criteria._updated_at;
            Metadata.Objects[req.body.datamodel_id].findOne(search_criteria, function (err, object) {
                if (err) return next(err);
                res.status(400).json(object);
            });
        } else {
            if (!object._appointments) {
                object._appointments = {};
            }
            if (startTime.getDay() == endTime.getDay()) {
                var dateKey = computeDateKey(startTime);
                if (!object._appointment_properties || !object._appointment_properties.days) {
                    return res.status(400);
                    // no days available!
                }
                var daysProperties = object._appointment_properties.days[startTime.getDay()];
                if (daysProperties.enabled) {
                    // instersection available between appointment and time allowed
                    if (computeTimeDate(endTime) >= computeTimeObject(daysProperties.start_time) ||
                        computeTimeDate(startTime) <= computeTimeObject(daysProperties.end_time)) {
                        // adjust start time and end time
                        if (computeTimeDate(startTime) < computeTimeObject(daysProperties.start_time)) {
                            startTime.setHours(daysProperties.start_time.hours);
                            startTime.setMinutes(daysProperties.start_time.minutes);
                        }
                        if (computeTimeDate(endTime) > computeTimeObject(daysProperties.end_time)) {
                            endTime.setHours(daysProperties.end_time.hours);
                            endTime.setMinutes(daysProperties.end_time.minutes);
                        }

                        // rdv for one day - check available timeslot
                        if (!object._appointments[dateKey]) {
                            object._appointments[dateKey] = [];
                        }
                        var dayAgenda = object._appointments[dateKey];
                        var timeSlotValid = true;
                        for (var i = 0; i < dayAgenda.length; i++) {
                            if (checkTimeIntersection(dayAgenda[i].start_time, dayAgenda[i].end_time, startTime, endTime)) {
                                timeSlotValid = false;
                                break;
                            }
                        }
                        if (timeSlotValid) {
                            // create appointment
                            var user = SessionCache.userData[req.cookies[Constants.SessionCookie]];
                            dayAgenda.push({
                                start_time: {
                                    hours: (startTime.getHours() < 10 ? '0' + startTime.getHours() : startTime.getHours()),
                                    minutes: (startTime.getMinutes() < 10 ? '0' + startTime.getMinutes() : startTime.getMinutes())
                                },
                                end_time: {
                                    hours: (endTime.getHours() < 10 ? '0' + endTime.getHours() : endTime.getHours()),
                                    minutes: (endTime.getMinutes() < 10 ? '0' + endTime.getMinutes() : endTime.getMinutes())
                                },
                                user: {
                                    id: user._id,
                                    email: user.email,
                                    name: ((user.firstname ? user.firstname : '') + ' ' + (user.lastname ? user.lastname : ''))
                                }
                            });
                            Metadata.Objects[req.body.datamodel_id].findOneAndUpdate(search_criteria, object, function (err, object) {
                                if (err) return next(err);
                                if (!object) {
                                    delete search_criteria._updated_at;
                                    Metadata.Objects[req.body.datamodel_id].findOne(search_criteria, function (err, object) {
                                        if (err) return next(err);
                                        res.status(400).json(object);
                                        // Timeslot is unavailable!
                                    });
                                }
                                Email.sendCalendar(user.email, req.body.object_name, req.body.start_time, req.body.end_time, ((user.firstname ? user.firstname : '') + ' ' + (user.lastname ? user.lastname : '')));
                                return res.status(200).json({
                                    msg: 'Reservation done!'
                                });
                            });
                        } else {
                            return res.status(400);
                            // Timeslot is unavailable!
                        }
                    }
                }
            } else {
                return res.status(400);
                //Multiple day reservation is not yet available!
            }
        }
    });
});

router.put('/notify/:user_id', function (req, res, next) {
    if (!req.body.email_title || !req.body.email_html) return res.status(400).json({
        err: 'Invalid parameters!'
    });
    User.findOne({
        _id: req.params.user_id,
        _company_code: SessionCache.userData[req.cookies[Constants.SessionCookie]]._company_code,
        validated: true
    }, 'email firstname lastname').exec(function (errUser, userObject) {
        if (errUser) return next(errUser);
        if (!userObject) return res.status(400).json({
            err: 'Invalid parameters!'
        });
        res.status(200).json({
            msg: 'Email sent!'
        });
        Email.send(userObject.email, null, req.body.email_title, 'Automatic message from App1', req.body.email_html.replace(/@@user/g, ((userObject.firstname ? userObject.firstname : '') + ' ' + (userObject.lastname ? userObject.lastname : ''))));
    });
});

module.exports = router;
