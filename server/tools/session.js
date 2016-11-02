var mongoose = require('mongoose');
var Session = {
    users: {},
    count: 0
};
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
    Session.count++;
    return token;
};
Session.isActive = function(token) {
    if (!Session.users[token]) return false;
    return true;
};
Session.logout = function(token) {
    delete Session.users[token];
    Session.count--;
};
module.exports = Session;
