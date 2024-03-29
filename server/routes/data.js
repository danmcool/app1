var express = require('express');
var router = express.Router();

var Constants = require('../tools/constants.js');
var Metadata = require('../models/metadata.js');
var SessionCache = require('../tools/session_cache.js');
var Tools = require('../tools/tools.js');
var CalendarTools = require('../tools/calendar_tools.js');

router.get('/:datamodelid/', function (req, res, next) {
    var token = req.cookies[Constants.SessionCookie];
    var user = SessionCache.userData[token];
    var profile = SessionCache.getProfile(token, req.params.datamodelid);
    var remote_profile = {};
    var remote = false;
    if (req.query.pid) {
        for (var i = 0; i < user.remote_profiles.length; i++) {
            if (req.query.pid == user.remote_profiles[i]._id) {
                if (user.remote_profiles[i].type == Constants.UserProfileShare && user.remote_profiles[i].profile.datamodels[req.params.datamodelid] && user.remote_profiles[i].profile.datamodels[req.params.datamodelid].list) {
                    remote_profile = user.remote_profiles[i].profile.datamodels[req.params.datamodelid].list;
                    remote = true;
                }
                break;
            } else {
                continue;
            }
        }
        if (!remote) {
            return res.status(401).json({
                err: 'Incorrect profile!'
            });
        }
    }
    /* else if (user.remote_profiles && user.remote_profiles.length > 0) {
            for (var i = 0; i < user.remote_profiles.length; i++) {
                if (user.remote_profiles[i].type == Constants.UserProfileShare && user.remote_profiles[i].profile.datamodels[req.params.datamodelid] && user.remote_profiles[i].profile.datamodels[req.params.datamodelid].list) {
                    remote_profile = user.remote_profiles[i].profile.datamodels[req.params.datamodelid].list;
                    remote = true;
                    break;
                }
            }
        }*/
    if (!profile || !profile.datamodels[req.params.datamodelid] || !profile.datamodels[req.params.datamodelid].list) {
        if (!remote) {
            return res.status(401).json({
                err: 'Not enough user rights!'
            });
        }
    }
    var pageOptions = Tools.computePage(req);
    var sort_by = JSON.parse(req.query.sort_by ? req.query.sort_by : '{}');
    var search_criteria = JSON.parse(req.query.search_criteria ? req.query.search_criteria : '{}');
    if (remote) {
        search_criteria._company_code = {
            $eq: remote_profile._company_code
        }
        if (remote_profile._user) {
            search_criteria._user = {
                $in: remote_profile._user
            }
        }
    } else {
        search_criteria._company_code = {
            $eq: profile.datamodels[req.params.datamodelid].list._company_code
        }
        if (profile.datamodels[req.params.datamodelid].list._user) {
            search_criteria._user = {
                $in: profile.datamodels[req.params.datamodelid].list._user
            }
        }
    }
    var searchScoreProjection = {};
    if (req.query.search_text && req.query.search_text != '') {
        search_criteria['$text'] = {
            $search: req.query.search_text
        }
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
    if (req.query.interval_start && req.query.interval_start != '' && req.query.interval_end && req.query.interval_end != '') {
        var startTime = new Date(req.query.interval_start);
        var endTime = new Date(req.query.interval_end);
        if (!startTime || !endTime || startTime >= endTime || (startTime.getTime() + Constants.OneWeek) < endTime.getTime()) {
            return res.status(400).json({
                err: 'Invalid time interval parameters!'
            });
        }
        Tools.appendProperties(CalendarTools.computeQuery(startTime, endTime), search_criteria);
    }
    if (!req.query.populate) {
        req.query.populate = '';
    }
    Metadata.Objects[req.params.datamodelid].find(search_criteria, searchScoreProjection).skip(pageOptions.skip).limit(pageOptions.limit).populate(req.query.populate).sort(sort_by).exec(function (err, objects) {
        if (err) {
            console.log(err);
            return next(err);
        } 
        res.json(objects);
    });
});

router.post('/:datamodelid/', function (req, res, next) {
    var token = req.cookies[Constants.SessionCookie];
    var user = SessionCache.userData[token];
    var profile = SessionCache.getProfile(token, req.params.datamodelid);
    var remote_profile = {};
    var remote = false;
    if (req.query.pid) {
        if (user.remote_profiles && user.remote_profiles.length > 0) {
            for (var i = 0; i < user.remote_profiles.length; i++) {
                if (req.body.pid == user.remote_profiles[i]._id) {
                    if (user.remote_profiles[i].type == Constants.UserProfileShare && user.remote_profiles[i].profile.datamodels[req.params.datamodelid]) {
                        if (user.remote_profiles[i].profile.datamodels[req.params.datamodelid][req.params.id]) {
                            remote_profile = user.remote_profiles[i].profile.datamodels[req.params.datamodelid][req.params.id];
                            remote = true;
                        } else if (user.remote_profiles[i].profile.datamodels[req.params.datamodelid].create) {
                            remote_profile = user.remote_profiles[i].profile.datamodels[req.params.datamodelid].create;
                            remote = true;
                        }
                    }
                    break;
                } else {
                    continue;
                }
            }
        }
        if (!remote) {
            return res.status(401).json({
                err: 'Incorrect profile!'
            });
        }
    }
    /* else {
            if (user.remote_profiles && user.remote_profiles.length > 0) {
                for (var i = 0; i < user.remote_profiles.length; i++) {
                    if (user.remote_profiles[i].type == Constants.UserProfileShare && user.remote_profiles[i].profile.datamodels[req.params.datamodelid]) {
                        if (user.remote_profiles[i].profile.datamodels[req.params.datamodelid][req.params.id]) {
                            remote_profile = user.remote_profiles[i].profile.datamodels[req.params.datamodelid][req.params.id];
                            remote = true;
                            break;
                        } else {
                            if (user.remote_profiles[i].profile.datamodels[req.params.datamodelid].create) {
                                remote_profile = user.remote_profiles[i].profile.datamodels[req.params.datamodelid].create;
                                remote = true;
                            }
                        }

                    }
                }
            }
        }*/
    if (!profile || !profile.datamodels[req.params.datamodelid] || !profile.datamodels[req.params.datamodelid].create) {
        if (!remote) {
            return res.status(401).json({
                err: 'Not enough user rights!'
            });
        }
    }
    if (req.body) {
        req.body._created_at = Date.now();
        req.body._updated_at = req.body._created_at;
        delete req.body._appointments;
        if (remote) {
            req.body._company_code = remote_profile._company_code;
            req.body._user = remote_profile._user[0];
        } else {
            req.body._company_code = profile.datamodels[req.params.datamodelid].create._company_code;
            req.body._user = profile.datamodels[req.params.datamodelid].create._user[0];
        }
    }
    Metadata.Objects[req.params.datamodelid].create(req.body, function (err, object) {
        if (err) {
            console.log(err);
            return next(err);
        } 
        res.status(200).json({
            msg: 'Data: entry created!',
            _id: object._id
        });
    });
});

router.get('/:datamodelid/:id', function (req, res, next) {
    var token = req.cookies[Constants.SessionCookie];
    var user = SessionCache.userData[token];
    var profile = SessionCache.getProfile(token, req.params.datamodelid);
    var remote_profile = {};
    var remote = false;
    if (req.query.pid) {
        for (var i = 0; i < user.remote_profiles.length; i++) {
            if (req.query.pid == user.remote_profiles[i]._id) {
                if (user.remote_profiles[i].type == Constants.UserProfileShare && user.remote_profiles[i].profile.datamodels[req.params.datamodelid]) {
                    if (user.remote_profiles[i].profile.datamodels[req.params.datamodelid][req.params.id]) {
                        remote_profile = user.remote_profiles[i].profile.datamodels[req.params.datamodelid][req.params.id];
                        remote = true;
                    } else if (user.remote_profiles[i].profile.datamodels[req.params.datamodelid].read) {
                        remote_profile = user.remote_profiles[i].profile.datamodels[req.params.datamodelid].read;
                        remote = true;
                    }
                }
                break;
            } else {
                continue;
            }
        }
        if (!remote) {
            return res.status(401).json({
                err: 'Incorrect profile!'
            });
        }
    }
    /* else if (user.remote_profiles && user.remote_profiles.length > 0) {
            for (var i = 0; i < user.remote_profiles.length; i++) {
                if (user.remote_profiles[i].type == Constants.UserProfileShare && user.remote_profiles[i].profile.datamodels[req.params.datamodelid]) {
                    if (user.remote_profiles[i].profile.datamodels[req.params.datamodelid][req.params.id]) {
                        remote_profile = user.remote_profiles[i].profile.datamodels[req.params.datamodelid][req.params.id];
                        remote = true;
                        break;
                        //} else {
                        //    if (user.remote_profiles[i].profile.datamodels[req.params.datamodelid].read) {
                        //        remote_profile = user.remote_profiles[i].profile.datamodels[req.params.datamodelid].read;
                        //        remote = true;
                        //    }
                    }

                }
            }
        }*/
    if (!profile || !profile.datamodels[req.params.datamodelid] || !profile.datamodels[req.params.datamodelid].read) {
        if (!remote) {
            return res.status(401).json({
                err: 'Not enough user rights!'
            });
        }
    }
    var search_criteria = JSON.parse(req.query.search_criteria ? req.query.search_criteria : '{}');
    search_criteria._id = {
        $eq: req.params.id
    }
    if (remote) {
        search_criteria._company_code = {
            $eq: remote_profile._company_code
        }
    } else {
        search_criteria._company_code = {
            $eq: profile.datamodels[req.params.datamodelid].read._company_code
        }
        if (profile.datamodels[req.params.datamodelid].read._user) {
            search_criteria._user = {
                $in: profile.datamodels[req.params.datamodelid].read._user
            }
        }
    }
    if (!req.query.populate) {
        req.query.populate = '';
    }
    Metadata.Objects[req.params.datamodelid].findOne(search_criteria).populate(req.query.populate).exec(function (err, object) {
        if (err) {
            console.log(err);
            return next(err);
        } 
        res.json(object);
    });
});

router.put('/:datamodelid/:id', function (req, res, next) {
    var token = req.cookies[Constants.SessionCookie];
    var user = SessionCache.userData[token];
    var profile = SessionCache.getProfile(token, req.params.datamodelid);
    var remote_profile = {};
    var remote = false;
    if (req.query.pid) {
        if (user.remote_profiles && user.remote_profiles.length > 0) {
            for (var i = 0; i < user.remote_profiles.length; i++) {
                if (req.query.pid == user.remote_profiles[i]._id) {
                    if (user.remote_profiles[i].type == Constants.UserProfileShare && user.remote_profiles[i].profile.datamodels[req.params.datamodelid] && user.remote_profiles[i].profile.datamodels[req.params.datamodelid][req.params.id]) {
                        remote_profile = user.remote_profiles[i].profile.datamodels[req.params.datamodelid][req.params.id];
                        remote = true;
                    } else if (user.remote_profiles[i].profile.datamodels[req.params.datamodelid].update) {
                        remote_profile = user.remote_profiles[i].profile.datamodels[req.params.datamodelid].update;
                        remote = true;
                    }
                    break;
                }
            }
        }
        if (!remote) {
            return res.status(401).json({
                err: 'Incorrect profile!'
            });
        }
    }
    /* else {
            if (user.remote_profiles && user.remote_profiles.length > 0) {
                for (var i = 0; i < user.remote_profiles.length; i++) {
                    if (user.remote_profiles[i].type == Constants.UserProfileShare && user.remote_profiles[i].profile.datamodels[req.params.datamodelid] && user.remote_profiles[i].profile.datamodels[req.params.datamodelid][req.params.id]) {
                        remote_profile = user.remote_profiles[i].profile.datamodels[req.params.datamodelid][req.params.id];
                        remote = true;
                        break;
                    }
                }
            }
        }*/
    if (!profile || !profile.datamodels[req.params.datamodelid] || !profile.datamodels[req.params.datamodelid].update || !req.body || !req.body._user) {
        if (!remote) {
            return res.status(401).json({
                err: 'Not enough user rights!'
            });
        }
    }
    var search_criteria = {
        _id: {
            $eq: req.params.id
        }
    }
    var objectToBeUpdated = {};
    if (remote) {
        search_criteria._company_code = {
            $eq: remote_profile._company_code
        }
        search_criteria._user = {
            $eq: req.body._user
        }
        if (remote_profile.constraint) {
            objectToBeUpdated[remote_profile.constraint.key] = remote_profile.constraint.value;
        }
    } else {
        search_criteria._company_code = {
            $eq: profile.datamodels[req.params.datamodelid].update._company_code
        }
        if (profile.datamodels[req.params.datamodelid].update._user) {
            search_criteria._user = {
                $in: profile.datamodels[req.params.datamodelid].update._user
            }
        }
        objectToBeUpdated = req.body;
    }
    search_criteria._updated_at = Date.parse(req.body._updated_at);
    objectToBeUpdated._updated_at = Date.now();
    delete objectToBeUpdated._appointments;
    Metadata.Objects[req.params.datamodelid].findOneAndUpdate(search_criteria, req.body, function (err, object) {
        if (err) {
            console.log(err);
            return next(err);
        } 
        if (object) {
            res.status(200).json({
                msg: 'Data: entry updated!'
            });
        } else {
            delete search_criteria._updated_at;
            Metadata.Objects[req.params.datamodelid].findOne(search_criteria, function (err, object) {
                if (err) {
                    console.log(err);
                    return next(err);
                } 
                res.status(400).json(object);
            });
        }
    });
});

router.delete('/:datamodelid/:id', function (req, res, next) {
    var profile = SessionCache.getProfile(req.cookies[Constants.SessionCookie], req.params.datamodelid);
    if (!profile || !profile.datamodels[req.params.datamodelid] || !profile.datamodels[req.params.datamodelid].delete) {
        return res.status(401).json({
            err: 'Not enough user rights!'
        });
    }
    if (profile.datamodels[req.params.datamodelid].delete._user) {
        var found = false;
        for (var i = 0; i < profile.datamodels[req.params.datamodelid].delete._user.length; i++) {
            if (profile.datamodels[req.params.datamodelid].delete._user[i] == SessionCache.userData[req.cookies[Constants.SessionCookie]]._id) {
                found = true;
                break;
            }
            if (!found) {
                return res.status(401).json({
                    err: 'Not enough user rights!'
                });
            }
        }
    }
    Metadata.Objects[req.params.datamodelid].findOneAndRemove({
        _id: req.params.id,
        _company_code: profile.datamodels[req.params.datamodelid].delete._company_code
    }, function (err, object) {
        if (err) {
            console.log(err);
            return next(err);
        } 
        res.status(200).json({
            msg: 'Data: entry deleted!'
        });
    });
});

module.exports = router;
