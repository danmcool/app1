var mongoose = require('mongoose');

var Metadata = require('../models/metadata.min.js');
var Constants = require('../tools/constants.min.js');
var Session = Metadata.Session;
var User = Metadata.User;

var SessionCache = {
	userData: {},
	userTimeout: {},
	serviceProvider: {},
	identityProvider: {}
};

var SamlServiceProviderCache = {};

// clean server sessions
setInterval(function () {
	var current_time = Date.now();
	Metadata.Session.remove({
		timeout: {
			'$lt': current_time
		}
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
	var strUser = JSON.stringify(userObject);
	if (userObject.user) strUser = strUser.replace(/@@user/g, userObject._id);
	if (userObject.manager) strUser = strUser.replace(/@@manager/g, userObject.manager);
	strUser = strUser.replace(/@@public/g, Constants.PublicUser + '@' + userObject._company_code);
	if (userObject.reports) strUser = strUser.replace(/'@@reports'/g, (userObject.reports ? (userObject.reports.length > 0 ? JSON.stringify(userObject.reports).replace(/]|[[]/g, '') : '\'\'') : '\'\''));
	if (userObject._company_code) strUser = strUser.replace(/@@company_code/g, userObject._company_code);
	var resUser = JSON.parse(strUser);
	if (resUser.company.properties) resUser.company.properties.saml = {};
	return resUser;
}

SessionCache.cacheUser = function (token, userObject) {
	SessionCache.userData[token] = SessionCache.prepareUser(userObject);
	SessionCache.touch(token);
};

SessionCache.update = function (token, userObject) {
	SessionCache.userData[token] = SessionCache.prepareUser(userObject);
};

SessionCache.isActive = function (req, callback) {
	var token = req.cookies[Constants.SessionCookie];
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
			'$eq': token
		},
		timeout: {
			'$gt': current_time
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
			}, 'email firstname lastname user _company_code properties company profile remote_profiles manager reports')
			.populate('company profile remote_profiles').exec(
				function (err, userObject) {
					if (err) return next(err);
					if (!userObject) return;
					SessionCache.cacheUser(token, userObject);
					callback(true);
				});
	});
};

SessionCache.touch = function (token) {
	SessionCache.userTimeout[token] = Date.now() + Constants.MaxSessionCacheTimeout;
};

SessionCache.removeUserCache = function (token) {
	delete SessionCache.userData[token];
	delete SessionCache.userTimeout[token];
};

SessionCache.filterCompanyCode = function (req, filter) {
	var company_code = SessionCache.userData[req.cookies[Constants.SessionCookie]]._company_code;
	if (req.body != null && req.body._company_code == null) req.body._company_code = company_code;
	if (company_code != Constants.AdminCompany) {
		if (!filter) filter = {};
		filter._company_code = {
			'$eq': company_code
		};
		if (req.body != null && req.body._company_code != company_code) {
			req.body._company_code = company_code;
		}
	}
	return filter;
}

SessionCache.filterApplicationCompanyCode = function (req, filter) {
	var company_code = SessionCache.userData[req.cookies[Constants.SessionCookie]]._company_code;
	if (company_code != Constants.AdminCompany) {
		if (!filter) filter = {};
		filter._company_code = {
			'$in': [company_code, Constants.ProductionCompany]
		};
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
			'$eq': company_code
		};
		if (req.body != null && req.body._company_code != company_code) {
			req.body._company_code = company_code;
		}
	}
	return filter;
}

module.exports = SessionCache;
