var mongoose = require('mongoose');

var Constants = require('../tools/constants.js');

var Session = {
    users: {},
    timeouts: {},
    count: 0
};

setInterval(function() {
    var current_time = new Date().getTime();
    var keys = Object.keys(Session.timeouts);
    for (var i = 0; i < keys.length; i++) {
        if (Session.timeouts[keys[i]] < current_time) {
            logout(keys[i]);
        }
    }
}, 60 * 60 * 1000);

Session.login = function(user) {
    var rand = function() {
        return Math.random().toString(36).substr(2);
    };
    var tokenGenerator = function() {
        return rand() + rand();
    };
    var token = tokenGenerator();
    while (Session.users[token]) {
        token = tokenGenerator();
    }
    Session.users[token] = user;
    Session.touch(token);
    Session.count++;
    return token;
};

Session.isActive = function(token) {
    if (!Session.users[token]) return false;
    Session.touch(token);
    return true;
};

Session.touch = function(token) {
    Session.timeouts[token] = new Date().getTime() + Constants.MaxSessionTimeout;
};

Session.logout = function(token) {
    delete Session.users[token];
    delete Session.timeouts[token];
    Session.count--;
};

Session.filterCompanyCode = function(req, filter) {
    var company_code = Session.users[req.cookies.app1_token]._company_code;
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

module.exports = Session;
