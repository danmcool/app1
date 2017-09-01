var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var Metadata = require('../models/metadata.js');
var SessionCache = require('../tools/session_cache.js');
var Constants = require('../tools/constants.js');
var Email = require('../tools/email.js');
var DatamodelTools = require('../tools/datamodel_tools.js');

var DataModel = Metadata.DataModel;
var User = Metadata.User;
var Company = Metadata.Company;
var UserProfile = Metadata.UserProfile;
var Application = Metadata.Application;
var Workflow = Metadata.Workflow;
var Form = Metadata.Form;
var Value = Metadata.Value;

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
    })).populate('file workflows').exec(function (err, apps) {
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
    })).populate('file forms').exec(function (err,
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
    Form.findOne(SessionCache.filterApplicationCompanyCode(req, {
        _id: {
            '$eq': req.params.id
        }
    })).populate('datamodel values').exec(function (err, formObject) {
        if (err) return next(err);
        if (!formObject) return res.status(400).json({
            msg: 'Object is null!'
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

router.post('/value', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator) {
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
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator) {
        return res.status(401).json({
            err: 'Not enough user rights'
        });
    }
    Value.findOne(SessionCache.filterApplicationCompanyCode(req, {
        _id: {
            '$eq': req.params.id
        }
    })).exec(function (err, valueObject) {
        if (err) return next(err);
        if (!valueObject) return res.status(400).json({
            msg: 'Object is null!'
        });
        return res.status(200).json(valueObject);
    });
});
router.put('/value/:id', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator) {
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
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator) {
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

router.get('/datamodel', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator) {
        return res.status(401).json({
            err: 'Not enough user rights'
        });
    }
    var pageOptions = computePage(req);
    DataModel.find(SessionCache.filterApplicationCompanyCode(req, {})).skip(pageOptions.skip).limit(pageOptions.limit).exec(function (err,
        datamodels) {
        if (err) return next(err);
        res.json(datamodels);
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
    if (req.body.properties && req.body.properties.reference == Constants.DataModelUserId) {
        DataModel.create(req.body, function (err, object) {
            if (err) return next(err);
            Metadata.Objects[object._id] = Metadata.User;
            module.exports = Metadata;
            return res.json(object);
        });
    } else {
        DataModel.create(req.body, function (err, object) {
            if (err) return next(err);
            var modelSchema;
            try {
                modelSchema = new Schema(DatamodelTools.buildDataModel(req.body.projection));
            } catch (e) {
                console.log(e);
                modelSchema = new Schema({});
            }
            Metadata.Objects[object._id] = mongoose.model('data' + object._id, modelSchema);
            module.exports = Metadata;
            return res.json(object);
        });
    }
});

router.get('/datamodel/:id', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator) {
        return res.status(401).json({
            err: 'Not enough user rights'
        });
    }
    DataModel.findOne(SessionCache.filterCompanyCode(req, {
        _id: req.params.id
    })).exec(function (err, datamodelObject) {
        if (err) return next(err);
        if (!datamodelObject) return res.status(400).json({
            msg: 'Object is null!'
        });
        return res.status(200).json(datamodelObject);
    });
});
router.put('/datamodel/:id', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator) {
        return res.status(401).json({
            err: 'Not enough user rights'
        });
    }
    if (req.body.properties && req.body.properties.reference == Constants.DataModelUserId) {
        DataModel.findOneAndUpdate(SessionCache.filterCompanyCode(req, {
            _id: req.body._id
        }), req.body, function (err, object) {
            if (err) return next(err);
            return res.json(object);
        });
    } else {
        delete mongoose.connection.models['data' + req.body._id];
        delete mongoose.modelSchemas['data' + req.body._id];
        delete Metadata.Objects[req.body._id];
        var modelSchema;
        try {
            modelSchema = new Schema(DatamodelTools.buildDataModel(req.body.projection));
        } catch (e) {
            console.log(e);
            modelSchema = new Schema({});
            res.status(400);
            return res.json(req.body);
        }
        Metadata.Objects[req.body._id] = mongoose.model('data' + req.body._id, modelSchema);
        module.exports = Metadata;
        DataModel.findOneAndUpdate(SessionCache.filterCompanyCode(req, {
            _id: req.body._id
        }), req.body, function (err, object) {
            if (err) return next(err);
            return res.json(object);
        });
    }
});
router.delete('/datamodel/:id', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator) {
        return res.status(401).json({
            err: 'Not enough user rights'
        });
    }
    DataModel.findOneAndRemove(SessionCache.filterCompanyCode(req, {
        _id: req.params.id
    }), function (err, object) {
        if (err) return next(err);
        if (req.body.properties && !req.body.properties.reference) {
            delete mongoose.connection.models['data' + req.params._id];
            delete mongoose.modelSchemas['data' + req.params._id];
            delete Metadata.Objects[req.params._id];
        }
        res.json(object);
    });
});

module.exports = router;
