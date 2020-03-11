var mongoose = require('mongoose');

var Metadata = require('../models/metadata.js');
var Constants = require('../tools/constants.js');
var Session = Metadata.Session;
var User = Metadata.User;

var SessionCache = {
    userData: {},
    userTimeout: {},
    serviceProvider: {},
    identityProvider: {}
}

var SamlServiceProviderCache = {};

// clean server sessions
setInterval(function () {
    var current_time = Date.now();
    Metadata.Session.deleteMany({
        timeout: {
            $lt: Date(current_time)
        }
    }, function (err) {
        if (err) console.log(err);
    });
}, Constants.DBSessionTimerCleanup);

// clean local cache to remove or update user data (to avoid using a message queue)
setInterval(function () {
    var current_time = Date.now();
    var keys = Object.keys(SessionCache.userTimeout);
    for (var i = 0; i < keys.length; i++) {
        if (SessionCache.userTimeout[keys[i]] < current_time) {
            SessionCache.removeUserCache(keys[i]);
        }
    }
}, Constants.CacheSessionTimerCleanup);

SessionCache.prepareUser = function (userObject) {
    var publicUserId;
    if (userObject.profile.type == Constants.UserProfilePublic) {
        publicUserId = userObject._id;
    } else {
        publicUserId = Constants.PublicUser + '@' + userObject._company_code;
    }
    if (userObject.remote_profiles && userObject.remote_profiles.length > 0) {
        for (var i = 0; i < userObject.remote_profiles.length; i++) {
            if (userObject.remote_profiles[i].type == Constants.UserProfileShare && userObject.remote_profiles[i].properties.workflow) {
                var strRemote = JSON.stringify(userObject.remote_profiles[i]);
                strRemote = strRemote.replace(/@@sharing_company_code/g, userObject.remote_profiles[i]._company_code);
                userObject.remote_profiles[i] = JSON.parse(strRemote);
            }
        }
    }
    var strUser = JSON.stringify(userObject);
    if (userObject.user) strUser = strUser.replace(/@@user/g, userObject._id);
    if (userObject.manager) strUser = strUser.replace(/@@manager/g, userObject.manager);
    strUser = strUser.replace(/@@public/g, publicUserId);
    if (userObject.reports && userObject.reports.length > 0) strUser = strUser.replace(/"@@reports"/g, JSON.stringify(userObject.reports).replace(/\[|\]/g, ''));
    else strUser = strUser.replace(/"@@reports",/g, '');
    if (userObject._company_code) strUser = strUser.replace(/@@company_code/g, userObject._company_code);
    var resUser = JSON.parse(strUser);
    if (resUser.company.properties) resUser.company.properties.saml = {};
    return resUser;
}

SessionCache.cacheUser = function (token, userObject) {
    SessionCache.userData[token] = SessionCache.prepareUser(userObject);
    SessionCache.touch(token);
}

SessionCache.update = function (token, userObject) {
    SessionCache.userData[token] = SessionCache.prepareUser(userObject);
}

SessionCache.isActive = function (req, callback) {
    var token = req.cookies[Constants.SessionCookie];
    SessionCache.isActiveToken(token, function (active) {
        callback(active);
    });
}

SessionCache.isActiveToken = function (token, callback) {
    if (!token) {
        callback(false);
        return;
    }
    var current_time = Date.now();
    if (SessionCache.userTimeout[token] && SessionCache.userTimeout[token] > current_time) {
        callback(true);
        return;
    }
    Session.findOneAndUpdate({
        _id: {
            $eq: token
        },
        timeout: {
            $gt: current_time
        }
    }, {
        timeout: current_time + Constants.MaxSessionTimeout
    }).exec(function (errSession, existingSession) {
        if (errSession) return next(errSession);
        if (!existingSession) {
            callback(false);
            return;
        }
        User.findOne({
                _id: existingSession.user,
                validated: true
            }, 'email firstname lastname user _company_code properties company profile remote_profiles remote_applications manager reports')
            .populate('company profile remote_profiles').exec(
                function (err, userObject) {
                    if (err) return next(err);
                    if (!userObject) return;
                    SessionCache.cacheUser(token, userObject);
                    callback(true);
                });
    });
}

SessionCache.touch = function (token) {
    SessionCache.userTimeout[token] = Date.now() + Constants.MaxSessionCacheTimeout;
}

SessionCache.removeUserCache = function (token) {
    delete SessionCache.userData[token];
    delete SessionCache.userTimeout[token];
}

SessionCache.filterCompanyCode = function (req, filter) {
    var company_code = SessionCache.userData[req.cookies[Constants.SessionCookie]]._company_code;
    if (req.body != null && req.body._company_code == null) {
        req.body._company_code = company_code;
    }
    if (company_code != Constants.AdminCompany) {
        if (!filter) filter = {};
        filter._company_code = {
            $eq: company_code
        }
        if (req.body != null && req.body._company_code != company_code) {
            req.body._company_code = company_code;
        }
    }
    return filter;
}

SessionCache.filterAddProductionCompanyCode = function (req, filter) {
    var company_code = SessionCache.userData[req.cookies[Constants.SessionCookie]]._company_code;
    if (company_code != Constants.AdminCompany) {
        if (!filter) filter = {};
        filter._company_code = {
            $in: [company_code, Constants.ProductionCompany]
        };
        if (req.body != null && req.body._company_code != company_code) {
            req.body._company_code = company_code;
        }
    }
    return filter;
}

SessionCache.filterAddRemoteAppsAndProductionCompanyCode = function (req, companyApps, remoteApps) {
    var company_code = SessionCache.userData[req.cookies[Constants.SessionCookie]]._company_code;
    var filter = {};
    if (company_code != Constants.AdminCompany) {
        filter = {
            $or: [{
                _company_code: {
                    $in: [company_code, Constants.ProductionCompany]
                },
                _id: {
                    $in: companyApps
                }
                }, {
                _id: {
                    $in: remoteApps
                }
            }],
            active: true
        }
        if (req.body != null && req.body._company_code != company_code) {
            req.body._company_code = company_code;
        }
    } else {
        filter = {
            $or: [{
                _id: {
                    $in: companyApps
                }
                }, {
                _id: {
                    $in: remoteApps
                }
            }],
            active: true
        }
    }
    return filter;
}

SessionCache.filterApplicationCompanyCode = function (req, filter) {
    var company_code = SessionCache.userData[req.cookies[Constants.SessionCookie]]._company_code;
    if (company_code != Constants.AdminCompany) {
        if (!filter) filter = {};
        filter = {
            $and: [filter, {
                $or: [{
                    _company_code: company_code
                }, {
                    $and: [{
                        _company_code: Constants.ProductionCompany
                        }, {
                        active: true
                        }]
                }]
            }]
        }
        if (req.body != null && req.body._company_code != company_code) {
            req.body._company_code = company_code;
        }
    }
    return filter;
}

SessionCache.filterDataUserProfile = function (req, filter, datamodel_id, data_id) {
    var company_code = SessionCache.userData[req.cookies[Constants.SessionCookie]]._company_code;
    if (req.body != null && req.body._company_code == null) req.body._company_code = company_code;
    if (company_code != Constants.AdminCompany) {
        if (!filter) filter = {};
        filter._company_code = {
            $eq: company_code
        };
        if (req.body != null && req.body._company_code != company_code) {
            req.body._company_code = company_code;
        }
    }
    return filter;
}

var getDefaultProfile = function (userType) {
    if (userType == Constants.UserProfileAdministrator) {
        return Constants.UserProfileAdministratorDefault;
    } else if (userType == Constants.UserProfilePrivate) {
        return Constants.UserProfilePrivateDefault;
    } else if (userType == Constants.UserProfilePublic) {
        return Constants.UserProfilePublicDefault;
    } else {
        return null;
    }
}

SessionCache.getProfile = function (token, datamodel_id) {
    var user = SessionCache.userData[token];
    var profile = user.profile.profile;
    if (!profile) {
        profile = {
            datamodels: {}
        };
    }
    if (!profile.datamodels[datamodel_id]) {
        profile.datamodels[datamodel_id] = getDefaultProfile(SessionCache.userData[token].profile.type);
        user.profile.profile = profile;
        SessionCache.update(token, user);
        profile = SessionCache.userData[token].profile.profile;
    }
    return profile;
}

SessionCache.createSecurityFiltersUpdate = function (token, remote_user_id, datamodel_id, object_id, security_filter) {
    var user = SessionCache.userData[token];
    var profile = SessionCache.getProfile(token, datamodel_id);
    var remote_profile = {};
    var remote = false;
    if (user.remote_profiles && user.remote_profiles.length > 0) {
        for (var i = 0; i < user.remote_profiles.length; i++) {
            if (user.remote_profiles[i].type == Constants.UserProfileShare && user.remote_profiles[i].profile.datamodels[datamodel_id] && user.remote_profiles[i].profile.datamodels[datamodel_id][object_id]) {
                remote_profile = user.remote_profiles[i].profile.datamodels[datamodel_id][object_id];
                remote = true;
                break;
            }
        }
    }
    if (!profile || !profile.datamodels[datamodel_id] || !profile.datamodels[datamodel_id].update) {
        if (!remote) return false;
    }
    if (remote) {
        security_filter._company_code = {
            $eq: remote_profile._company_code
        }
        security_filter._user = {
            $eq: remote_user_id
        }
        if (remote_profile.constraint.key) {
            security_filter[remote_profile.constraint.key] = {
                $eq: remote_profile.constraint.value
            }
        }
    } else {
        security_filter._company_code = {
            $eq: profile.datamodels[datamodel_id].update._company_code
        }
        if (profile.datamodels[datamodel_id].update._user) {
            security_filter._user = {
                $in: profile.datamodels[datamodel_id].update._user
            }
        }
    }
    return true;
}

SessionCache.createSecurityFiltersDelete = function (token, remote_user_id, datamodel_id, object_id, security_filter) {
    var user = SessionCache.userData[token];
    var profile = SessionCache.getProfile(token, datamodel_id);
    if (!profile || !profile.datamodels[datamodel_id] || !profile.datamodels[datamodel_id].delete) {
        return false;
    }
    if (profile.datamodels[datamodel_id].delete._user) {
        var found = false;
        for (var i = 0; i < profile.datamodels[datamodel_id].delete._user.length; i++) {
            if (profile.datamodels[datamodel_id].delete._user[i] == user._id) {
                found = true;
                break;
            }
        }
        if (!found) {
            return false;
        }
    }
    security_filter._company_code = {
        $eq: profile.datamodels[datamodel_id].delete._company_code
    }
    if (profile.datamodels[datamodel_id].delete._user) {
        security_filter._user = {
            $in: profile.datamodels[datamodel_id].delete._user
        }
    }
    return true;
}

SessionCache.createSecurityFiltersList = function (token, datamodel_id, query_pid, search_criteria) {
    var user = SessionCache.userData[token];
    var profile = SessionCache.getProfile(token, datamodel_id);
    var remote_profile = {};
    var remote = false;
    if (query_pid) {
        for (var i = 0; i < user.remote_profiles.length; i++) {
            if (query_pid == user.remote_profiles[i]._id) {
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
            return false;
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
    if (!profile || !profile.datamodels[datamodel_id] || !profile.datamodels[datamodel_id].list) {
        if (!remote) {
            return false;
        }
    }
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
            $eq: profile.datamodels[datamodel_id].list._company_code
        }
        if (profile.datamodels[datamodel_id].list._user) {
            search_criteria._user = {
                $in: profile.datamodels[datamodel_id].list._user
            }
        }
    }
    return true;
}

module.exports = SessionCache;
