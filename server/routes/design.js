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

router.get('/application', function (req, res, next) {
	var userToken = req.cookies[Constants.SessionCookie];
	if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator) {
		return res.status(401).json({
			err: 'Not enough user rights'
		});
	}
	var pageOptions = computePage(req);
	Application.find(SessionCache.filterApplicationCompanyCode(req, {})).populate('profiles').skip(pageOptions.skip).limit(pageOptions.limit).exec(function (err,
		apps) {
		if (err) return next(err);
		res.json(apps);
	});
});
router.post('/application/', function (req, res, next) {
	var userToken = req.cookies[Constants.SessionCookie];
	if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator) {
		return res.status(401).json({
			err: 'Not enough user rights'
		});
	}
	SessionCache.filterCompanyCode(req, {});
	Application.create(req.body, function (err, object) {
		if (err) return next(err);
		res.json(object);
	});
});
router.get('/application/:id/', function (req, res, next) {
	var userToken = req.cookies[Constants.SessionCookie];
	if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator) {
		return res.status(401).json({
			err: 'Not enough user rights'
		});
	}
	Application.findOne(SessionCache.filterCompanyCode(req, {
		_id: req.params.id
	})).populate('workflows').exec(function (err, apps) {
		if (err) return next(err);
		res.json(apps);
	});
});
router.put('/application/:id', function (req, res, next) {
	var userToken = req.cookies[Constants.SessionCookie];
	if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator) {
		return res.status(401).json({
			err: 'Not enough user rights'
		});
	}
	Application.findOneAndUpdate(SessionCache.filterCompanyCode(req, {
		_id: req.body._id
	}), req.body, function (err, object) {
		if (err) return next(err);
		res.json(object);
	});
});
router.delete('/application/:id', function (req, res, next) {
	var userToken = req.cookies[Constants.SessionCookie];
	if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator) {
		return res.status(401).json({
			err: 'Not enough user rights'
		});
	}
	Application.findOneAndRemove(SessionCache.filterCompanyCode(req, {
		_id: req.params.id
	}), function (err, object) {
		if (err) return next(err);
		res.json(object);
	});
});

router.post('/workflow/', function (req, res, next) {
	var userToken = req.cookies[Constants.SessionCookie];
	if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator) {
		return res.status(401).json({
			err: 'Not enough user rights'
		});
	}
	SessionCache.filterCompanyCode(req, {});
	Workflow.create(req.body, function (err, object) {
		if (err) return next(err);
		res.json(object);
	});
});
router.get('/workflow/:id', function (req, res, next) {
	var userToken = req.cookies[Constants.SessionCookie];
	if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator) {
		return res.status(401).json({
			err: 'Not enough user rights'
		});
	}
	Workflow.findOne(SessionCache.filterCompanyCode(req, {
		_id: req.params.id
	})).populate('forms').exec(function (err,
		object) {
		if (err) return next(err);
		res.json(object);
	});
});
router.put('/workflow/:id', function (req, res, next) {
	var userToken = req.cookies[Constants.SessionCookie];
	if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator) {
		return res.status(401).json({
			err: 'Not enough user rights'
		});
	}
	Workflow.findOneAndUpdate(SessionCache.filterCompanyCode(req, {
		_id: req.body._id
	}), req.body, function (err, object) {
		if (err) return next(err);
		res.json(object);
	});
});
router.delete('/workflow/:id', function (req, res, next) {
	var userToken = req.cookies[Constants.SessionCookie];
	if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator) {
		return res.status(401).json({
			err: 'Not enough user rights'
		});
	}
	Workflow.findOneAndRemove(SessionCache.filterCompanyCode(req, {
		_id: req.params.id
	}), function (err, object) {
		if (err) return next(err);
		res.json(object);
	});
});

router.post('/form', function (req, res, next) {
	var userToken = req.cookies[Constants.SessionCookie];
	if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator) {
		return res.status(401).json({
			err: 'Not enough user rights'
		});
	}
	SessionCache.filterCompanyCode(req, {});
	Form.create(req.body, function (err, object) {
		if (err) return next(err);
		res.json(object);
	});
});
router.get('/form/:id', function (req, res, next) {
	var userToken = req.cookies[Constants.SessionCookie];
	if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator) {
		return res.status(401).json({
			err: 'Not enough user rights'
		});
	}
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
router.put('/form/:id', function (req, res, next) {
	var userToken = req.cookies[Constants.SessionCookie];
	if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator) {
		return res.status(401).json({
			err: 'Not enough user rights'
		});
	}
	Form.findOneAndUpdate(SessionCache.filterCompanyCode(req, {
		_id: req.body._id
	}), req.body, function (err, object) {
		if (err) return next(err);
		res.json(object);
	});
});
router.delete('/form/:id', function (req, res, next) {
	var userToken = req.cookies[Constants.SessionCookie];
	if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator) {
		return res.status(401).json({
			err: 'Not enough user rights'
		});
	}
	Form.findOneAndRemove(SessionCache.filterCompanyCode(req, {
		_id: req.params.id
	}), function (err, object) {
		if (err) return next(err);
		res.json(object);
	});
});

router.post('/datamodel', function (req, res, next) {
	var userToken = req.cookies[Constants.SessionCookie];
	if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator) {
		return res.status(401).json({
			err: 'Not enough user rights'
		});
	}
	SessionCache.filterCompanyCode(req, {});
	Form.create(req.body, function (err, object) {
		if (err) return next(err);
		res.json(object);
	});
});
router.get('/datamodel/:id', function (req, res, next) {
	var userToken = req.cookies[Constants.SessionCookie];
	if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator) {
		return res.status(401).json({
			err: 'Not enough user rights'
		});
	}
	Metadata.Form.findOne(SessionCache.filterCompanyCode(req, {
		_id: req.params.id
	})).exec(function (err, formObject) {
		if (err) return next(err);
		if (!formObject) return res.status(400).json({
			msg: 'Url is null!'
		});
		return res.status(200).json(formObject);
	});
});
router.put('/datamodel/:id', function (req, res, next) {
	var userToken = req.cookies[Constants.SessionCookie];
	if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator) {
		return res.status(401).json({
			err: 'Not enough user rights'
		});
	}
	Form.findOneAndUpdate(SessionCache.filterCompanyCode(req, {
		_id: req.body._id
	}), req.body, function (err, object) {
		if (err) return next(err);
		res.json(object);
	});
});
router.delete('/datamodel/:id', function (req, res, next) {
	var userToken = req.cookies[Constants.SessionCookie];
	if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator) {
		return res.status(401).json({
			err: 'Not enough user rights'
		});
	}
	Form.findOneAndRemove(SessionCache.filterCompanyCode(req, {
		_id: req.params.id
	}), function (err, object) {
		if (err) return next(err);
		res.json(object);
	});
});

module.exports = router;
