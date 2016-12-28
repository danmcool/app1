var express = require('express');
var router = express.Router();

var Metadata = require('../models/metadata.js');
var SessionCache = require('../tools/session_cache.js');
var DataModel = Metadata.DataModel;

var computePage = function(req) {
    return pageOptions = {
        skip: parseInt(req.query.skip) || 0,
        limit: parseInt(req.query.limit) || 10
    }
}

router.get('/:datamodelid/', function(req, res, next) {
    var profile = SessionCache.user[req.cookies[Constants.SessionCookie]].profile.profile;
    if (!profile || !profile.datamodels[req.params.datamodelid] || !profile.datamodels[req.params.datamodelid].list) {
        return res.status(401).json({
            err: "Not enough user rights!"
        });
    }
    var pageOptions = computePage(req);
    var sort_by = JSON.parse(req.query.sort_by ? req.query.sort_by : "{}");
    var search_criteria = JSON.parse(req.query.search_criteria ? req.query.search_criteria : "{}");
    search_criteria._company_code = {
        "$eq": profile.datamodels[req.params.datamodelid].list._company_code
    };
    search_criteria._user = {
        "$in": profile.datamodels[req.params.datamodelid].list._user
    };
    Metadata.Objects[req.params.datamodelid].find(search_criteria).skip(pageOptions.skip).limit(pageOptions.limit)
        .sort(sort_by).exec(function(err, objects) {
            if (err) return next(err);
            res.json(objects);
        });
});

router.post('/:datamodelid/', function(req, res, next) {
    var profile = SessionCache.user[req.cookies[Constants.SessionCookie]].profile.profile;
    if (!profile || !profile.datamodels[req.params.datamodelid] || !profile.datamodels[req.params.datamodelid].create) {
        return res.status(401).json({
            err: "Not enough user rights!"
        });
    }
    if (req.body) {
        req.body._updated_at = Date.now();
        req.body._company_code = profile.datamodels[req.params.datamodelid].create._company_code;
        req.body._user = profile.datamodels[req.params.datamodelid].create._user;
    }
    Metadata.Objects[req.params.datamodelid].create(req.body, function(err, object) {
        if (err) return next(err);
        res.status(200).json({
            "msg": "Data: entry created!"
        });
    });
});

router.get('/:datamodelid/:id', function(req, res, next) {
    var user = SessionCache.user[req.cookies[Constants.SessionCookie]];
    var profile = user.profile.profile;
    var remote_profile = {};
    var remote = false;
    if (!profile || !profile.datamodels[req.params.datamodelid] || !profile.datamodels[req.params.datamodelid].read) {
        if (!user.remote_profiles || user.remote_profiles.length == 0) {
            return res.status(401).json({
                err: "Not enough user rights!"
            });
        }
        for (var i = 0; i < user.remote_profiles.length; i++) {
            if (user.remote_profiles[i].properties.datamodels[req.params.datamodelid] && user.remote_profiles[i].properties.datamodels[req.params.datamodelid][req.params.id]) {
                remote_profile = user.remote_profiles[i].properties.datamodels[req.params.datamodelid][req.params.id];
                remote = true;
                break;
            }
        }
        if (!remote) {
            return res.status(401).json({
                err: "Not enough user rights!"
            });
        }
    }
    var search_criteria = {
        _id: {
            "$eq": req.params.id
        }
    };
    if (remote) {
        search_criteria._company_code = {
            "$eq": remote_profile._company_code
        };
        search_criteria[remote_profile.constraint.key] = {
            "$eq": remote_profile.constraint.value
        };
    } else {
        search_criteria._company_code = {
            "$eq": profile.datamodels[req.params.datamodelid].read._company_code
        };
        search_criteria._user = {
            "$in": profile.datamodels[req.params.datamodelid].read._user
        };
    }
    Metadata.Objects[req.params.datamodelid].findOne(search_criteria).populate('_files').exec(function(err, object) {
        if (err) return next(err);
        res.json(object);
    });
});

router.put('/:datamodelid/:id', function(req, res, next) {
    var user = SessionCache.user[req.cookies[Constants.SessionCookie]];
    var profile = user.profile.profile;
    var remote_profile = {};
    var remote = false;
    if (!profile || !profile.datamodels[req.params.datamodelid] || !profile.datamodels[req.params.datamodelid].update || !req.body._user) {
        if (!user.remote_profiles || user.remote_profiles.length == 0) {
            return res.status(401).json({
                err: "Not enough user rights!"
            });
        }
        for (var i = 0; i < user.remote_profiles.length; i++) {
            if (user.remote_profiles[i].properties.datamodels[req.params.datamodelid] && user.remote_profiles[i].properties.datamodels[req.params.datamodelid][req.params.id]) {
                remote_profile = user.remote_profiles[i].properties.datamodels[req.params.datamodelid][req.params.id];
                remote = true;
                break;
            }
        }
        if (!remote) {
            return res.status(401).json({
                err: "Not enough user rights!"
            });
        }
    }
    if (!remote) {
        var found = false;
        for (var i = 0; i < profile.datamodels[req.params.datamodelid].update._user.length; i++) {
            if (profile.datamodels[req.params.datamodelid].update._user[i] == req.body._user) {
                found = true;
                break;
            }
        }
        if (!found) {
            return res.status(401).json({
                err: "Not enough user rights!"
            });
        }
    }
    var search_criteria = {
        _id: {
            "$eq": req.params.id
        }
    };
    if (remote) {
        search_criteria._company_code = {
            "$eq": remote_profile._company_code
        };
        search_criteria._user = {
            "$eq": req.body._user
        };
        search_criteria[remote_profile.constraint.key] = {
            "$eq": remote_profile.constraint.value
        };
    } else {
        search_criteria._company_code = {
            "$eq": profile.datamodels[req.params.datamodelid].read._company_code
        };
        search_criteria._user = {
            "$in": profile.datamodels[req.params.datamodelid].read._user
        };
    }
    var lookup_date = Date.parse(req.body._updated_at);
    req.body._updated_at = Date.now();
    Metadata.Objects[req.params.datamodelid].findOneAndUpdate({
        _id: req.params.id,
        _updated_at: lookup_date
    }, req.body, function(err, object) {
        if (err) return next(err);
        if (object) {
            res.status(200).json({
                "msg": "Data: entry updated!"
            });
        } else {
            Metadata.Objects[req.params.datamodelid].findOne({
                _id: req.params.id,
                _company_code: profile.datamodels[req.params.datamodelid].update._company_code
            }, function(err, object) {
                if (err) return next(err);
                res.status(400).json(object);
            });
        }
    });
});

router.delete('/:datamodelid/:id', function(req, res, next) {
    var profile = SessionCache.user[req.cookies[Constants.SessionCookie]].profile.profile;
    if (!profile || !profile.datamodels[req.params.datamodelid] || !profile.datamodels[req.params.datamodelid].delete || !req.body._user) {
        return res.status(401).json({
            err: "Not enough user rights!"
        });
    }
    var found = false;
    for (var i = 0; i < profile.datamodels[req.params.datamodelid].delete._user.length; i++) {
        if (profile.datamodels[req.params.datamodelid].delete._user[i] == req.body._user) {
            found = true;
            break;
        }
        if (!found) {
            return res.status(401).json({
                err: "Not enough user rights!"
            });
        }
    }
    Metadata.Objects[req.params.datamodelid].findOneAndRemove({
        _id: req.params.id,
        _company_code: profile.datamodels[req.params.datamodelid].delete._company_code
    }, function(err, object) {
        if (err) return next(err);
        res.status(200).json({
            "msg": "Data: entry deleted!"
        });
    });
});

module.exports = router;
