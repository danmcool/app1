var exec = require('child_process').exec;
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Metadata = require('../models/metadata.js');
var SessionCache = require('../tools/session_cache.js');
var Constants = require('../tools/constants.js');

var computePage = function (req) {
    return pageOptions = {
        skip: parseInt(req.query.skip) || Constants.QuerySkip,
        limit: parseInt(req.query.limit) || Constants.QueryLimit
    }
}

var DataModel = Metadata.DataModel;
router.get('/datamodel/', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
        return res.status(401).json({
            err: 'Not enough user rights'
        });
    }
    var pageOptions = computePage(req);
    DataModel.find(SessionCache.filterCompanyCode(req, {})).skip(pageOptions.skip).limit(pageOptions.limit).exec(function (err,
        object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.post('/datamodel/', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
        return res.status(401).json({
            err: 'Not enough user rights'
        });
    }
    SessionCache.filterCompanyCode(req, {});
    if (req.body.properties && (req.body.properties.reference == Constants.DataModelUserId || req.body.properties.reference == Constants.DataModelFileId)) {
        DataModel.create(req.body, function (err, object) {
            if (err) return next(err);
            Metadata.Objects[object._id] = Metadata.User;
            module.exports = Metadata;
            return res.json(object);
        });
    } else {
        var modelSchema;
        var index = {
            fields: {},
            options: {
                name: Constants.DataModelIndexName,
                weights: {}
            }
        };
        try {
            modelSchema = new Schema(DatamodelTools.buildDataModel(req.body.projection, index));
        } catch (e) {
            console.log(e);
            modelSchema = new Schema({});
            res.status(400);
            return res.json(req.body);
        }
        DataModel.create(req.body, function (err, object) {
            if (err) return next(err);
            modelSchema.index(index.fields, index.options);
            Metadata.Objects[object._id] = mongoose.model(Constants.DataModelPrefix + object._id, modelSchema, Constants.DataModelPrefix + req.body._id);
            module.exports = Metadata;
            return res.json(object);
        });
    }
});
router.get('/datamodel/:id', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
        return res.status(401).json({
            err: 'Not enough user rights'
        });
    }
    DataModel.findOne(SessionCache.filterCompanyCode(req, {
        _id: req.params.id
    }), function (err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.put('/datamodel/:id', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
        return res.status(401).json({
            err: 'Not enough user rights'
        });
    }
    if (req.body.properties && (req.body.properties.reference == Constants.DataModelUserId || req.body.properties.reference == Constants.DataModelFileId)) {
        DataModel.findOneAndUpdate(SessionCache.filterCompanyCode(req, {
            _id: req.body._id
        }), req.body, function (err, object) {
            if (err) return next(err);
            return res.json(object);
        });
    } else {
        var modelSchema;
        var index = {
            fields: {},
            options: {
                name: Constants.DataModelIndexName,
                weights: {}
            }
        }
        try {
            modelSchema = new Schema(DatamodelTools.buildDataModel(req.body.projection, index));
        } catch (e) {
            console.log(e);
            modelSchema = new Schema({});
            res.status(400);
            return res.json(req.body);
        }
        DataModel.findOneAndUpdate(SessionCache.filterCompanyCode(req, {
            _id: req.body._id
        }), req.body, function (err, object) {
            if (err) return next(err);

            if (mongoose.connections[0].collections[Constants.DataModelPrefix + object._id]) {
                mongoose.connections[0].collections[Constants.DataModelPrefix + object._id].dropIndex(Constants.DataModelIndexName);
            }
            delete mongoose.connection.models[Constants.DataModelPrefix + object._id];
            delete mongoose.modelSchemas[Constants.DataModelPrefix + object._id];
            delete Metadata.Objects[object._id];
            modelSchema.index(index.fields, index.options);
            Metadata.Objects[object._id] = mongoose.model(Constants.DataModelPrefix + object._id, modelSchema, Constants.DataModelPrefix + object._id);
            module.exports = Metadata;
            return res.json(object);
        });
    }
});
router.delete('/datamodel/:id', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
        return res.status(401).json({
            err: 'Not enough user rights'
        });
    }
    DataModel.findOneAndRemove(SessionCache.filterCompanyCode(req, {
        _id: req.params.id
    }), function (err, object) {
        if (err) return next(err);
        delete mongoose.connection.models['data' + req.params._id];
        delete mongoose.modelSchemas['data' + req.params._id];
        delete Metadata.Objects[req.params._id];
        res.json(object);
    });
});

var Value = Metadata.Value;
router.get('/value/', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
        return res.status(401).json({
            err: 'Not enough user rights'
        });
    }
    var pageOptions = computePage(req);
    Value.find(SessionCache.filterCompanyCode(req, {})).skip(pageOptions.skip).limit(pageOptions.limit).exec(function (err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.post('/value/', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
        return res.status(401).json({
            err: 'Not enough user rights'
        });
    }
    SessionCache.filterCompanyCode(req, {});
    Value.create(req.body, function (err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.get('/value/:id', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
        return res.status(401).json({
            err: 'Not enough user rights'
        });
    }
    Value.findOne(SessionCache.filterCompanyCode(req, {
        _id: req.params.id
    }), function (err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.put('/value/:id', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
        return res.status(401).json({
            err: 'Not enough user rights'
        });
    }
    Value.findOneAndUpdate(SessionCache.filterCompanyCode(req, {
        _id: req.body._id
    }), req.body, function (err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.delete('/value/:id', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
        return res.status(401).json({
            err: 'Not enough user rights'
        });
    }
    Value.findOneAndRemove(SessionCache.filterCompanyCode(req, {
        _id: req.params.id
    }), function (err, object) {
        if (err) return next(err);
        res.json(object);
    });
});

var Form = Metadata.Form;
router.get('/form/', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
        return res.status(401).json({
            err: 'Not enough user rights'
        });
    }
    var pageOptions = computePage(req);
    Form.find(SessionCache.filterCompanyCode(req, {})).skip(pageOptions.skip).limit(pageOptions.limit).exec(function (err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.post('/form/', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
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
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
        return res.status(401).json({
            err: 'Not enough user rights'
        });
    }
    Form.findOne(SessionCache.filterCompanyCode(req, {
        _id: req.params.id
    }), function (err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.put('/form/:id', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
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
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
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

var Company = Metadata.Company;
router.get('/company/', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
        return res.status(401).json({
            err: 'Not enough user rights'
        });
    }
    var pageOptions = computePage(req);
    Company.find(SessionCache.filterCompanyCode(req, {})).skip(pageOptions.skip).limit(pageOptions.limit).exec(function (err,
        object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.post('/company/', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
        return res.status(401).json({
            err: 'Not enough user rights'
        });
    }
    SessionCache.filterCompanyCode(req, {});
    Company.create(req.body, function (err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.get('/company/:id', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
        return res.status(401).json({
            err: 'Not enough user rights'
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
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
        return res.status(401).json({
            err: 'Not enough user rights'
        });
    }
    Company.findOneAndUpdate(SessionCache.filterCompanyCode(req, {
        _id: req.body._id
    }), req.body, function (err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.delete('/company/:id', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
        return res.status(401).json({
            err: 'Not enough user rights'
        });
    }
    Company.findOneAndRemove(SessionCache.filterCompanyCode(req, {
        _id: req.params.id
    }), function (err, object) {
        if (err) return next(err);
        res.json(object);
    });
});

var UserProfile = Metadata.UserProfile;
router.get('/userprofile/', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
        return res.status(401).json({
            err: 'Not enough user rights'
        });
    }
    var pageOptions = computePage(req);
    UserProfile.find(SessionCache.filterCompanyCode(req, {})).skip(pageOptions.skip).limit(pageOptions.limit).exec(function (err,
        object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.post('/userprofile/', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
        return res.status(401).json({
            err: 'Not enough user rights'
        });
    }
    SessionCache.filterCompanyCode(req, {});
    UserProfile.create(req.body, function (err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.get('/userprofile/:id', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
        return res.status(401).json({
            err: 'Not enough user rights'
        });
    }
    UserProfile.findOne(SessionCache.filterCompanyCode(req, {
        _id: req.params.id
    }), function (err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.put('/userprofile/:id', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
        return res.status(401).json({
            err: 'Not enough user rights'
        });
    }
    UserProfile.findOneAndUpdate(SessionCache.filterCompanyCode(req, {
        _id: req.body._id
    }), req.body, function (err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.delete('/userprofile/:id', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
        return res.status(401).json({
            err: 'Not enough user rights'
        });
    }
    UserProfile.findOneAndRemove(SessionCache.filterCompanyCode(req, {
        _id: req.params.id
    }), function (err, object) {
        if (err) return next(err);
        res.json(object);
    });
});

var Session = Metadata.Session;
router.get('/session/', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
        return res.status(401).json({
            err: 'Not enough user rights'
        });
    }
    var pageOptions = computePage(req);
    Session.find(SessionCache.filterCompanyCode(req, {})).skip(pageOptions.skip).limit(pageOptions.limit).exec(function (err,
        object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.post('/session/', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
        return res.status(401).json({
            err: 'Not enough user rights'
        });
    }
    SessionCache.filterCompanyCode(req, {});
    Session.create(req.body, function (err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.get('/session/:id', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
        return res.status(401).json({
            err: 'Not enough user rights'
        });
    }
    Session.findOne(SessionCache.filterCompanyCode(req, {
        _id: req.params.id
    }), function (err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.put('/session/:id', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
        return res.status(401).json({
            err: 'Not enough user rights'
        });
    }
    Session.findOneAndUpdate(SessionCache.filterCompanyCode(req, {
        _id: req.body._id
    }), req.body, function (err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.delete('/session/:id', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
        return res.status(401).json({
            err: 'Not enough user rights'
        });
    }
    Session.findOneAndRemove(SessionCache.filterCompanyCode(req, {
        _id: req.params.id
    }), function (err, object) {
        if (err) return next(err);
        res.json(object);
    });
});

var User = Metadata.User;
router.get('/user/', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
        return res.status(401).json({
            err: 'Not enough user rights'
        });
    }
    var pageOptions = computePage(req);
    User.find(SessionCache.filterCompanyCode(req, {})).skip(pageOptions.skip).limit(pageOptions.limit).exec(function (err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.post('/user/', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
        return res.status(401).json({
            err: 'Not enough user rights'
        });
    }
    req.body.user = req.body.user.toLowerCase();
    SessionCache.filterCompanyCode(req, {});
    User.create(req.body, function (err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.get('/user/:id', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
        return res.status(401).json({
            err: 'Not enough user rights'
        });
    }
    User.findOne(SessionCache.filterCompanyCode(req, {
        _id: req.params.id
    }), function (err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.put('/user/:id', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
        return res.status(401).json({
            err: 'Not enough user rights'
        });
    }
    if (req.body.user) req.body.user = req.body.user.toLowerCase();
    User.findOneAndUpdate(SessionCache.filterCompanyCode(req, {
        _id: req.body._id
    }), req.body, function (err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.delete('/user/:id', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
        return res.status(401).json({
            err: 'Not enough user rights'
        });
    }
    User.findOneAndRemove(SessionCache.filterCompanyCode(req, {
        _id: req.params.id
    }), function (err, object) {
        if (err) return next(err);
        res.json(object);
    });
});

var Workflow = Metadata.Workflow;
router.get('/workflow/', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
        return res.status(401).json({
            err: 'Not enough user rights'
        });
    }
    var pageOptions = computePage(req);
    Workflow.find(SessionCache.filterCompanyCode(req, {})).skip(pageOptions.skip).limit(pageOptions.limit).exec(function (err,
        object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.post('/workflow/', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
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
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
        return res.status(401).json({
            err: 'Not enough user rights'
        });
    }
    Workflow.findOne(SessionCache.filterCompanyCode(req, {
        _id: req.params.id
    }), function (err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.put('/workflow/:id', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
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
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
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
var Application = Metadata.Application;
router.get('/application/', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
        return res.status(401).json({
            err: 'Not enough user rights'
        });
    }
    var pageOptions = computePage(req);
    Application.find(SessionCache.filterCompanyCode(req, {})).skip(pageOptions.skip).limit(pageOptions.limit).exec(function (err,
        object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.post('/application/', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
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
router.get('/application/:id', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
        return res.status(401).json({
            err: 'Not enough user rights'
        });
    }
    Application.findOne(SessionCache.filterCompanyCode(req, {
        _id: req.params.id
    }), function (err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.put('/application/:id', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
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
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
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
router.put('/update', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator || SessionCache.userData[userToken]._company_code != Constants.AdminCompany) {
        return res.status(401).json({
            err: 'Not enough user rights'
        });
    }
    if (SessionCache.userData[req.cookies[Constants.SessionCookie]]._company_code != Constants.AdminCompany) {
        return res.status(400).json({
            error: 'Invalid user rights!'
        });
    }
    if (!req.body.repository) {
        return res.status(400).json({
            error: 'Invalid repository!'
        });
    }
    exec('git pull ' + req.body.repository, function (error, stdout, stderr) {
        object = {
            error: error,
            stdout: stdout,
            stderr: stderr
        };
        res.json(object);
    });
});
module.exports = router;
