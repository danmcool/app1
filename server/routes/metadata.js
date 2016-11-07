var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Metadata = require('../models/Metadata.js');
var Session = require('../tools/session');
var Constants = require('../tools/constants.js');

var computePage = function(req) {
    return pageOptions = {
        skip: parseInt(req.query.skip) || Constants.QuerySkip,
        limit: parseInt(req.query.limit) || Constants.QueryLimit
    }
}

// upload existing data models into memory at run-time (create schema, etc)
var DataModel = Metadata.DataModel;
DataModel.find(function(err, objects) {
    if (err) return next(err);
    for (var i = 0; i < objects.length; i++) {
        var modelSchema;
        try {
            modelSchema = new Schema(JSON.parse(objects[i].datamodel ? objects[i].datamodel : "{}"));
        } catch (e) {
            console.log(e);
            modelSchema = new Schema({});
        }
        Metadata.ObjectModels[objects[i]._id] = mongoose.model('data' + objects[i]._id, modelSchema);
    }
});

router.get('/datamodel/', function(req, res, next) {
    var pageOptions = computePage(req);
    DataModel.find(Session.filterCompanyCode(req, {})).skip(pageOptions.skip).limit(pageOptions.limit).exec(function(err,
        object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.post('/datamodel/', function(req, res, next) {
    Session.filterCompanyCode(req, {});
    DataModel.create(req.body, function(err, object) {
        if (err) return next(err);
        var modelSchema;
        try {
            if (!object.datamodel) object.datamodel = {};
            object.datamodel._updated_at = "Date";
            object.datamodel._company_code = "String";
            object.datamodel._user = "String";
            object.datamodel._files = ["String"];
            modelSchema = new Schema(object.datamodel);
        } catch (e) {
            console.log(e);
            modelSchema = new Schema({});
        }
        Metadata.ObjectModels[object._id] = mongoose.model('data' + object._id, modelSchema);
        module.exports = Metadata;
        res.json(object);
    });
});
router.get('/datamodel/:id', function(req, res, next) {
    DataModel.findOne(Session.filterCompanyCode(req, {
        _id: req.params.id
    }), function(err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.put('/datamodel/:id', function(req, res, next) {
    delete mongoose.connection.models['data' + req.body._id];
    delete mongoose.modelSchemas['data' + req.body._id];
    delete Metadata.ObjectModels[req.body._id];
    var modelSchema;
    var datamodel = JSON.parse(req.body.datamodel ? req.body.datamodel : "{}");
    datamodel._updated_at = "Date";
    datamodel._company_code = "String";
    datamodel._user = "String";
    datamodel._files = ["String"];
    req.body.datamodel = JSON.stringify(datamodel);
    try {
        modelSchema = new Schema(datamodel);
    } catch (e) {
        console.log(e);
        modelSchema = new Schema({});
        res.status(400);
        return res.json(req.body);
    }
    Metadata.ObjectModels[req.body._id] = mongoose.model('data' + req.body._id, modelSchema);
    module.exports = Metadata;
    DataModel.findOneAndUpdate(Session.filterCompanyCode(req, {
        _id: req.body._id
    }), req.body, function(err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.delete('/datamodel/:id', function(req, res, next) {
    DataModel.findOneAndRemove(Session.filterCompanyCode(req, {
        _id: req.params.id
    }), req.body, function(err, object) {
        if (err) return next(err);
        res.json(object);
    });
});

var Value = Metadata.Value;
router.get('/value/', function(req, res, next) {
    var pageOptions = computePage(req);
    Value.find(Session.filterCompanyCode(req, {})).skip(pageOptions.skip).limit(pageOptions.limit).exec(function(err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.post('/value/', function(req, res, next) {
    Session.filterCompanyCode(req, {});
    Value.create(req.body, function(err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.get('/value/:id', function(req, res, next) {
    Value.findOne(Session.filterCompanyCode(req, {
        _id: req.params.id
    }), function(err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.put('/value/:id', function(req, res, next) {
    Value.findOneAndUpdate(Session.filterCompanyCode(req, {
        _id: req.body._id
    }), req.body, function(err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.delete('/value/:id', function(req, res, next) {
    Value.findOneAndRemove(Session.filterCompanyCode(req, {
        _id: req.params.id
    }), req.body, function(err, object) {
        if (err) return next(err);
        res.json(object);
    });
});

var Form = Metadata.Form;
router.get('/form/', function(req, res, next) {
    var pageOptions = computePage(req);
    Form.find(Session.filterCompanyCode(req, {})).skip(pageOptions.skip).limit(pageOptions.limit).exec(function(err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.post('/form/', function(req, res, next) {
    Session.filterCompanyCode(req, {});
    Form.create(req.body, function(err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.get('/form/:id', function(req, res, next) {
    Form.findOne(Session.filterCompanyCode(req, {
        _id: req.params.id
    }), function(err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.put('/form/:id', function(req, res, next) {
    Form.findOneAndUpdate(Session.filterCompanyCode(req, {
        _id: req.body._id
    }), req.body, function(err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.delete('/form/:id', function(req, res, next) {
    Form.findOneAndRemove(Session.filterCompanyCode(req, {
        _id: req.params.id
    }), req.body, function(err, object) {
        if (err) return next(err);
        res.json(object);
    });
});

var Company = Metadata.Company;
router.get('/company/', function(req, res, next) {
    var pageOptions = computePage(req);
    Company.find(Session.filterCompanyCode(req, {})).skip(pageOptions.skip).limit(pageOptions.limit).exec(function(err,
        object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.post('/company/', function(req, res, next) {
    Session.filterCompanyCode(req, {});
    Company.create(req.body, function(err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.get('/company/:id', function(req, res, next) {
    Company.findOne(Session.filterCompanyCode(req, {
        _id: req.params.id
    }), function(err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.put('/company/:id', function(req, res, next) {
    Company.findOneAndUpdate(Session.filterCompanyCode(req, {
        _id: req.body._id
    }), req.body, function(err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.delete('/company/:id', function(req, res, next) {
    Company.findOneAndRemove(Session.filterCompanyCode(req, {
        _id: req.params.id
    }), req.body, function(err, object) {
        if (err) return next(err);
        res.json(object);
    });
});

var UserProfile = Metadata.UserProfile;
router.get('/userprofile/', function(req, res, next) {
    var pageOptions = computePage(req);
    UserProfile.find(Session.filterCompanyCode(req, {})).skip(pageOptions.skip).limit(pageOptions.limit).exec(function(err,
        object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.post('/userprofile/', function(req, res, next) {
    Session.filterCompanyCode(req, {});
    UserProfile.create(req.body, function(err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.get('/userprofile/:id', function(req, res, next) {
    UserProfile.findOne(Session.filterCompanyCode(req, {
        _id: req.params.id
    }), function(err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.put('/userprofile/:id', function(req, res, next) {
    UserProfile.findOneAndUpdate(Session.filterCompanyCode(req, {
        _id: req.body._id
    }), req.body, function(err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.delete('/userprofile/:id', function(req, res, next) {
    UserProfile.findOneAndRemove(Session.filterCompanyCode(req, {
        _id: req.params.id
    }), req.body, function(err, object) {
        if (err) return next(err);
        res.json(object);
    });
});

var User = Metadata.User;
router.get('/user/', function(req, res, next) {
    var pageOptions = computePage(req);
    User.find(Session.filterCompanyCode(req, {})).skip(pageOptions.skip).limit(pageOptions.limit).exec(function(err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.post('/user/', function(req, res, next) {
    req.body.user = req.body.user.toLowerCase();
    Session.filterCompanyCode(req, {});
    User.create(req.body, function(err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.get('/user/:id', function(req, res, next) {
    User.findOne(Session.filterCompanyCode(req, {
        _id: req.params.id
    }), function(err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.put('/user/:id', function(req, res, next) {
    if (req.body.user) req.body.user = req.body.user.toLowerCase();
    User.findOneAndUpdate(Session.filterCompanyCode(req, {
        _id: req.body._id
    }), req.body, function(err, object) {
        if (err) return next(err);
        //Session.users[req.cookies.app1_token] =
        res.json(object);
    });
});
router.delete('/user/:id', function(req, res, next) {
    User.findOneAndRemove(Session.filterCompanyCode(req, {
        _id: req.params.id
    }), req.body, function(err, object) {
        if (err) return next(err);
        res.json(object);
    });
});

var Workflow = Metadata.Workflow;
router.get('/workflow/', function(req, res, next) {
    var pageOptions = computePage(req);
    Workflow.find(Session.filterCompanyCode(req, {})).skip(pageOptions.skip).limit(pageOptions.limit).exec(function(err,
        object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.post('/workflow/', function(req, res, next) {
    Session.filterCompanyCode(req, {});
    Workflow.create(req.body, function(err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.get('/workflow/:id', function(req, res, next) {
    Workflow.findOne(Session.filterCompanyCode(req, {
        _id: req.params.id
    }), function(err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.put('/workflow/:id', function(req, res, next) {
    Workflow.findOneAndUpdate(Session.filterCompanyCode(req, {
        _id: req.body._id
    }), req.body, function(err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.delete('/workflow/:id', function(req, res, next) {
    Workflow.findOneAndRemove(Session.filterCompanyCode(req, {
        _id: req.params.id
    }), req.body, function(err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
var Application = Metadata.Application;
router.get('/application/', function(req, res, next) {
    var pageOptions = computePage(req);
    Application.find(Session.filterCompanyCode(req, {})).skip(pageOptions.skip).limit(pageOptions.limit).exec(function(err,
        object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.post('/application/', function(req, res, next) {
    Session.filterCompanyCode(req, {});
    Application.create(req.body, function(err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.get('/application/:id', function(req, res, next) {
    Application.findOne(Session.filterCompanyCode(req, {
        _id: req.params.id
    }), function(err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.put('/application/:id', function(req, res, next) {
    Application.findOneAndUpdate(Session.filterCompanyCode(req, {
        _id: req.body._id
    }), req.body, function(err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
router.delete('/application/:id', function(req, res, next) {
    Application.findOneAndRemove(Session.filterCompanyCode(req, {
        _id: req.params.id
    }), req.body, function(err, object) {
        if (err) return next(err);
        res.json(object);
    });
});
module.exports = router;
