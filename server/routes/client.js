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

var computePage = function (req) {
	return pageOptions = {
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
			User.find(userParams, 'user email firstname lastname').skip(pageOptions.skip).limit(pageOptions.limit).exec(function (errUserObjects, userObjects) {
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

router.get('/form/:id', function (req, res, next) {
	if (!req.params.id) return res.status(400).json({
		msg: 'Form id is null!'
	});
	Metadata.Form.findOne(SessionCache.filterApplicationCompanyCode(req, {
		_id: {
			'$eq': req.params.id
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
	Application.find(SessionCache.filterApplicationCompanyCode(req, {
		'_id': {
			'$in': SessionCache.userData[req.cookies[Constants.SessionCookie]].company.applications
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
					apps.splice(i, 1)
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
			if (profileFound) {
				for (var j = apps[i].workflows.length - 1; j >= 0; j--) {
					if (!profileFound.profile.applications[apps[i]._id].workflows[apps[i].workflows[j]._id]) {
						apps[i].workflows.splice(j, 1);
					}
				}
			}
		}
		res.json(apps);
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
		if (err) return res.status(400).json({
			errUser: err
		});
		res.json(object);
		SessionCache.removeUserCache(userToken);
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

router.put('/notify/:user_id', function (req, res, next) {
	if (!req.body.email_title || !req.body.email_html) return res.status(400).json({
		err: 'Invalid parameters!'
	});
	User.findOne({
		_id: req.params.user_id,
		_company_code: SessionCache.userData[req.cookies[Constants.SessionCookie]]._company_code,
		validated: true
	}, 'email firstname lastname').exec(function (errUser, userObject) {
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
