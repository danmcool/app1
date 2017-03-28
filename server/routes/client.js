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
var Workflow = Metadata.Workflow;
var Form = Metadata.Form;

var computePage = function(req) {
    return pageOptions = {
        skip: parseInt(req.query.skip) || Constants.QuerySkip,
        limit: parseInt(req.query.limit) || Constants.QueryLimit
    }
}

router.put('/value/:id', function(req, res, next) {
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
                    '$in': SessionCache.userData[req.cookies[Constants.SessionCookie]].reports
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
            User.find(userParams, 'user email firstname lastname').skip(pageOptions.skip).limit(pageOptions.limit).exec(function(errUserObjects, userObjects) {
                if (errUserObjects) return next(errUserObjects);
                if (!userObjects) return res.status(400).json({
                    'msg': 'Url is null!'
                });
                for (var i in userObjects) {
                    result.values.push({
                        _id: userObjects[i]._id,
                        en: ((userObjects[i].firstname ? userObjects[i].firstname : '') + ' ' + (userObjects[i].lastname ? userObjects[i].lastname : '')),
                        name: ((userObjects[i].firstname ? userObjects[i].firstname : '') + ' ' + (userObjects[i].lastname ? userObjects[i].lastname : '')),
                        email: userObjects[i].email
                    });
                }
                return res.status(200).json(result);
            });
        }
    } else if (req.query.type == Constants.ValuesTypeQuery) {
        return res.status(200).json('');
    } else {
        return res.status(200).json('');
    }
});

router.get('/form/:id', function(req, res, next) {
    if (!req.params.id) return res.status(400).json({
        msg: 'Form id is null!'
    });
    Metadata.Form.findOne(SessionCache.filterApplicationCompanyCode(req, {
        _id: {
            '$eq': req.params.id
        }
    })).populate('datamodel values').exec(function(err, formObject) {
        if (err) return next(err);
        if (!formObject) return res.status(400).json({
            msg: 'Url is null!'
        });
        return res.status(200).json(formObject);
    });
});

router.get('/application/', function(req, res, next) {
    var pageOptions = computePage(req);
    Application.find(SessionCache.filterApplicationCompanyCode(req, {
        '_id': {
            '$in': SessionCache.userData[req.cookies[Constants.SessionCookie]].company.applications
        }
    })).skip(pageOptions.skip).limit(pageOptions.limit).populate('workflows').exec(function(err,
        apps) {
        if (err) return next(err);
        var remoteProfiles = SessionCache.userData[req.cookies[Constants.SessionCookie]].remote_profiles;
        for (var i = 0; i < apps.length; i++) {
            if (!apps[i].profiles) continue;
            var profileFound = Constants.UserProfileApplicationTypeDefault;
            for (var j = 0; j < remoteProfiles.length; j++) {
                if (remoteProfiles[j].type == Constants.UserProfileApplication && remoteProfiles[j].properties.application_id == apps[i]._id) {
                    profileFound = remoteProfiles[j].properties.application_type;
                    break;
                }
            }
            var appProfile = apps[i].profiles[profileFound];
            if (appProfile) {
                for (var j = apps[i].workflows.length - 1; j >= 0; j--) {
                    if (!appProfile[apps[i].workflows[j]._id]) {
                        apps[i].workflows.splice(j, 1);
                    }
                }
            }
        }
        res.json(apps);
    });
});

router.get('/design/application', function(req, res, next) {
    var pageOptions = computePage(req);
    Application.find(SessionCache.filterCompanyCode(req, {})).skip(pageOptions.skip).limit(pageOptions.limit).exec(function(err,
        apps) {
        if (err) return next(err);
        res.json(apps);
    });
});
router.post('/design/application/', function(req, res, next) {
    SessionCache.filterCompanyCode(req, {});
    Application.create(req.body, function(err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.get('/design/application/:id/', function(req, res, next) {
    Application.findOne(SessionCache.filterCompanyCode(req, {
        _id: req.params.id
    })).populate('workflows').exec(function(err, apps) {
        if (err) return next(err);
        res.json(apps);
    });
});
router.put('/design/application/:id', function(req, res, next) {
    Application.findOneAndUpdate(SessionCache.filterCompanyCode(req, {
        _id: req.body._id
    }), req.body, function(err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.delete('/design/application/:id', function(req, res, next) {
    Application.findOneAndRemove(SessionCache.filterCompanyCode(req, {
        _id: req.params.id
    }), function(err, object) {
        if (err) return next(err);
        res.json(object);
    });
});

router.post('/design/workflow/', function(req, res, next) {
    SessionCache.filterCompanyCode(req, {});
    Workflow.create(req.body, function(err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.get('/design/workflow/:id', function(req, res, next) {
    Workflow.findOne(SessionCache.filterCompanyCode(req, {
        _id: req.params.id
    })).populate('forms').exec(function(err,
        object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.put('/design/workflow/:id', function(req, res, next) {
    Workflow.findOneAndUpdate(SessionCache.filterCompanyCode(req, {
        _id: req.body._id
    }), req.body, function(err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.delete('/design/workflow/:id', function(req, res, next) {
    Workflow.findOneAndRemove(SessionCache.filterCompanyCode(req, {
        _id: req.params.id
    }), function(err, object) {
        if (err) return next(err);
        res.json(object);
    });
});

router.post('/design/form', function(req, res, next) {
    SessionCache.filterCompanyCode(req, {});
    Form.create(req.body, function(err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.get('/design/form/:id', function(req, res, next) {
    Metadata.Form.findOne(SessionCache.filterApplicationCompanyCode(req, {
        _id: {
            '$eq': req.params.id
        }
    })).populate('datamodel values').exec(function(err, formObject) {
        if (err) return next(err);
        if (!formObject) return res.status(400).json({
            msg: 'Url is null!'
        });
        return res.status(200).json(formObject);
    });
});
router.put('/form/:id', function(req, res, next) {
    Form.findOneAndUpdate(SessionCache.filterCompanyCode(req, {
        _id: req.body._id
    }), req.body, function(err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.delete('/form/:id', function(req, res, next) {
    Form.findOneAndRemove(SessionCache.filterCompanyCode(req, {
        _id: req.params.id
    }), function(err, object) {
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
            _id: req.params.id
        }, 'email firstname lastname user _company_code properties company profile remote_profiles manager reports')
            .populate('company profile remote_profiles').exec(
                function(errUser, userObject) {
                    if (errUser) return res.status(400).json({
                        errUser: info
                    });
                    if (!userObject) return res.status(400).json({
                        err: 'Invalid user name!'
                    });
                    SessionCache.update(req.cookies[Constants.SessionCookie], userObject);
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
    if (!req.cookies[Constants.SessionCookie]) return res.status(401).json({
        err: 'Not logged in!'
    });
    if (!req.query.form_id || !req.query.datamodel_id || !req.query.data_id || !req.query.email) return res.status(400).json({
        err: 'Invalid parameters!'
    });
    var userprofile = {
        name: {
            en: 'ShareForm'
        },
        properties: {
            forms: {
                [req.query.form_id]: true
            },
            datamodels: {
                [req.query.datamodel_id]: {
                    [req.query.data_id]: {
                        _company_code: SessionCache.userData[req.cookies[Constants.SessionCookie]]._company_code,
                        constraint: {
                            key: req.query.key,
                            value: req.query.value
                        }
                    }
                }
            }
        },
        type: Constants.UserProfileShare,
        _company_code: SessionCache.userData[req.cookies[Constants.SessionCookie]]._company_code
    };
    UserProfile.create(userprofile, function(err, newUserprofile) {
        if (err) return next(err);
        res.status(200).json({
            msg: 'Form shared successfully!'
        });
        Email.sendShare(req.query.email, SessionCache.userData[req.cookies[Constants.SessionCookie]].email, req.query.form_id, req.query.datamodel_id, req.query.data_id, newUserprofile._id);
    });
});

router.get('/open', function(req, res, next) {
    if (!req.cookies[Constants.SessionCookie]) return res.status(401).json({
        err: 'Not logged in!'
    });
    if (!req.query.form_id || !req.query.datamodel_id || !req.query.data_id || !req.query.profile_id) return res.status(400).json({
        err: 'Invalid parameters!'
    });
    UserProfile.findOne({
        _id: req.query.profile_id
    }, function(errProfile, objectProfile) {
        if (errProfile) return next(errProfile);
        if (!objectProfile) return res.status(400).json({
            err: 'Invalid parameters!'
        });
        var userWithRemoteProfile = SessionCache.userData[req.cookies[Constants.SessionCookie]];
        userWithRemoteProfile.remote_profiles.push(JSON.parse(JSON.stringify(objectProfile)));
        SessionCache.update(req.cookies[Constants.SessionCookie], userWithRemoteProfile);
        res.redirect('/#/form/' + req.query.form_id + '/' + req.query.data_id);
        /*
        User.findOneAndUpdate({
            _id: SessionCache.userData[req.cookies[Constants.SessionCookie]]._id,
            validated: true
        }, {
            $push: {
                remote_profiles: req.query.profile_id
            }
        }, 'email firstname lastname user _company_code properties company profile remote_profiles manager reports')
            .populate('company profile remote_profiles').exec(function(errUser, userObject) {
                if (errUser) return next(err);
                if (!userObject) return res.status(401).json({
                    err: 'Invalid parameters!'
                });
                SessionCache.update(req.cookies[Constants.SessionCookie], userObject);
                res.redirect('/#/form/' + req.query.form_id + '/' + req.query.data_id);
            });
        */
    });
});

router.get('/calendar', function(req, res, next) {
    if (!req.cookies[Constants.SessionCookie]) return res.status(401).json({
        err: 'Not logged in!'
    });
    if (!req.query.project_name || !req.query.start_date || !req.query.end_date || !req.query.user_id) return res.status(400).json({
        err: 'Invalid parameters!'
    });
    User.findOne({
        _id: req.query.user_id,
        _company_code: SessionCache.userData[req.cookies[Constants.SessionCookie]]._company_code,
        validated: true
    }, 'email firstname lastname').exec(function(errUser, userObject) {
        if (errUser) return next(err);
        if (!userObject) return res.status(400).json({
            err: 'Invalid parameters!'
        });
        res.status(200).json({
            msg: 'Calendar sent!'
        });
        Email.sendCalendar(userObject.email, req.query.project_name, req.query.start_date, req.query.end_date, ((userObject.firstname ? userObject.firstname : '') + ' ' + (userObject.lastname ? userObject.lastname : '')));
    });
});

router.put('/notify/:user_id', function(req, res, next) {
    if (!req.cookies[Constants.SessionCookie]) return res.status(401).json({
        err: 'Not logged in!'
    });
    if (!req.body.email_title || !req.body.email_html) return res.status(400).json({
        err: 'Invalid parameters!'
    });
    User.findOne({
        _id: req.params.user_id,
        _company_code: SessionCache.userData[req.cookies[Constants.SessionCookie]]._company_code,
        validated: true
    }, 'email firstname lastname').exec(function(errUser, userObject) {
        if (errUser) return next(err);
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
