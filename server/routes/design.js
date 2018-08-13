var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var Metadata = require('../models/metadata.js');
var SessionCache = require('../tools/session_cache.js');
var Constants = require('../tools/constants.js');
var DatamodelTools = require('../tools/datamodel_tools.js');

var DataModel = Metadata.DataModel;
var Application = Metadata.Application;
var Workflow = Metadata.Workflow;
var Form = Metadata.Form;
var Value = Metadata.Value;

var computePage = function (req) {
    return {
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
    Application.find(SessionCache.filterApplicationCompanyCode(req)).populate('profiles').skip(pageOptions.skip).limit(pageOptions.limit).exec(function (err,
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
    Application.findOne(SessionCache.filterApplicationCompanyCode(req, {
        _id: req.params.id
    })).populate('file workflows profiles').exec(function (err, apps) {
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
    Form.findOne(SessionCache.filterAddProductionCompanyCode(req, {
        _id: {
            $eq: req.params.id
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

router.get('/value', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator) {
        return res.status(401).json({
            err: 'Not enough user rights'
        });
    }
    var pageOptions = computePage(req);
    Value.find(SessionCache.filterAddProductionCompanyCode(req, {})).skip(pageOptions.skip).limit(pageOptions.limit).exec(function (err, value) {
        if (err) return next(err);
        res.json(value);
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
    Value.findOne(SessionCache.filterAddProductionCompanyCode(req, {
        _id: {
            $eq: req.params.id
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
    DataModel.find(SessionCache.filterAddProductionCompanyCode(req, {})).skip(pageOptions.skip).limit(pageOptions.limit).exec(function (err,
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
    if (req.body.properties) {
        if (req.body.properties.reference == Constants.DataModelUserId) {
            DataModel.create(req.body, function (err, object) {
                if (err) return next(err);
                Metadata.Objects[object._id] = Metadata.User;
                module.exports = Metadata;
                return res.json(object);
            });
        } else if (req.body.properties.reference == Constants.DataModelFileId) {
            DataModel.create(req.body, function (err, object) {
                if (err) return next(err);
                Metadata.Objects[object._id] = Metadata.File;
                module.exports = Metadata;
                return res.json(object);
            });
        }
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
            if (!object) return res.status(401).json({
                err: 'Not enough user rights'
            });
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
    if (SessionCache.userData[userToken].profile.type != Constants.UserProfileAdministrator) {
        return res.status(401).json({
            err: 'Not enough user rights'
        });
    }
    DataModel.findOneAndRemove(SessionCache.filterCompanyCode(req, {
        _id: req.params.id
    }), function (err, object) {
        if (err) return next(err);
        if (object.properties && !object.properties.reference) {
            delete mongoose.connection.models[Constants.DataModelPrefix + req.params._id];
            delete mongoose.modelSchemas[Constants.DataModelPrefix + req.params._id];
            delete Metadata.Objects[req.params._id];
        }
        res.json(object);
    });
});

module.exports = router;
