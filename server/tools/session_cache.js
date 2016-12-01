var mongoose = require('mongoose');

var Metadata = require('../models/metadata.js');
var Constants = require('../tools/constants.js');

var SessionCache = {
    user: {},
    timeout: {}
};

setInterval(function() {
    var current_time = Date.now();
    Metadata.Session.remove({
        timeout: {
            "$lt": current_time
        }
    });
    var keys = Object.keys(SessionCache.timeout);
    for (var i = 0; i < keys.length; i++) {
        if (SessionCache.timeout[keys[i]] < current_time) {
            SessionCache.logout(keys[i]);
        }
    }
}, 60 * 60 * 1000);

/*
    var rand = function() {
        return Math.random().toString(36).substr(2);
    };
    var tokenGenerator = function() {
        return rand() + rand();
    };
    var token = tokenGenerator();
    while (Session.users[token]) {
        token = tokenGenerator();
    }*/


SessionCache.prepareUser = function(userObject) {
    var strUser = JSON.stringify(userObject);
    if (userObject.user) strUser = strUser.replace(/@@user/g, userObject.user);
    if (userObject.manager) strUser = strUser.replace(/@@manager/g, userObject.manager);
    if (userObject.reports) strUser = strUser.replace(/@@reports/g, JSON.stringify(userObject.reports).replace(/]|[[]/g, ""));
    if (userObject._company_code) strUser = strUser.replace(/@@company_code/g, userObject._company_code);
    return JSON.parse(strUser);
}

SessionCache.login = function(token, userObject) {
    SessionCache.user[token] = SessionCache.prepareUser(userObject);
    SessionCache.touch(token);
};

SessionCache.update = function(token, userObject) {
    SessionCache.user[token] = SessionCache.prepareUser(userObject);
    SessionCache.touch(token);
};

SessionCache.isActive = function(token) {
    if (SessionCache.timeout[token] && SessionCache.timeout[token] > Date.now()) {
        return true;
    }
    return false;
};

SessionCache.touch = function(token) {
    SessionCache.timeout[token] = Date.now() + Constants.MaxSessionTimeout;
};

SessionCache.logout = function(token) {
    delete SessionCache.user[token];
    delete SessionCache.timeout[token];
};

SessionCache.filterCompanyCode = function(req, filter) {
    var company_code = SessionCache.user[req.cookies.app1_token]._company_code;
    if (req.body != null && req.body._company_code == null) req.body._company_code = company_code;
    if (company_code != Constants.AdminCompany) {
        if (!filter) filter = {};
        filter._company_code = {
            "$eq": company_code
        };
        if (req.body != null && req.body._company_code != company_code) {
            req.body._company_code = company_code;
        }
    }
    return filter;
}

SessionCache.filterApplicationCompanyCode = function(req, filter) {
    var company_code = SessionCache.user[req.cookies.app1_token]._company_code;
    if (company_code != Constants.AdminCompany) {
        if (!filter) filter = {};
        filter._company_code = {
            "$in": [company_code, Constants.ProductionCompany]
        };
        if (req.body != null && req.body._company_code != company_code) {
            req.body._company_code = company_code;
        }
    }
    return filter;
}

SessionCache.filterDataUserProfile = function(req, filter, datamodel_id, data_id) {
    var company_code = SessionCache.user[req.cookies.app1_token]._company_code;
    if (req.body != null && req.body._company_code == null) req.body._company_code = company_code;
    if (company_code != Constants.AdminCompany) {
        if (!filter) filter = {};
        filter._company_code = {
            "$eq": company_code
        };
        if (req.body != null && req.body._company_code != company_code) {
            req.body._company_code = company_code;
        }
    }
    return filter;
}

module.exports = SessionCache;
