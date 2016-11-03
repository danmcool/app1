var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Metadata = require('../models/Metadata.js');
var Session = require('../tools/session');
var Constants = require('../tools/constants.js');
var filterCompanyCode = function(req, filter) {
  var company_code = Session.users[req.cookies.app1_token]._company_code;
  if (req.body != null && req.body._company_code == null) req.body._company_code = company_code;
  if (company_code != Constants.AdminCompany) {
    filter._company_code = {
      "$eq": company_code
    };
    if (req.body != null && req.body._company_code != company_code) {
      req.body._company_code = company_code;
    }
  }
  return filter;
}
var computePage = function(req) {
  return pageOptions = {
    skip: parseInt(req.query.skip) || 0,
    limit: parseInt(req.query.limit) || 10
  }
}
// upload existing data models into memory at run-time (create schema, etc)
var DataModel = Metadata.DataModel;
DataModel.find(function(err, objects) {
  if (err) return next(err);
  for (var i = 0; i < objects.length; i++) {
    var modelSchema;
    try {
      modelSchema = new mongoose.Schema(JSON.parse(objects[i].datamodel ? objects[i].datamodel : "{}"));
    } catch (e) {
      console.log(e);
      modelSchema = new mongoose.Schema({});
    }
    Metadata.ObjectModels[objects[i]._id] = mongoose.model('data' + objects[i]._id, modelSchema);
  }
});
router.get('/datamodel/', function(req, res, next) {
  var pageOptions = computePage(req);
  DataModel.find(filterCompanyCode(req, {})).skip(pageOptions.skip).limit(pageOptions.limit).exec(function(err,
    object) {
    if (err) return next(err);
    res.json(object);
  });
});
router.post('/datamodel/', function(req, res, next) {
  filterCompanyCode(req, {});
  DataModel.create(req.body, function(err, object) {
    if (err) return next(err);
    var modelSchema;
    try {
      if (!object.datamodel) object.datamodel = {};
      object.datamodel._updated_at = "Date";
      object.datamodel._company_code = "String";
      modelSchema = new mongoose.Schema(object.datamodel);
    } catch (e) {
      console.log(e);
      modelSchema = new mongoose.Schema({});
    }
    Metadata.ObjectModels[object._id] = mongoose.model('data' + object._id, modelSchema);
    module.exports = Metadata;
    res.json(object);
  });
});
router.get('/datamodel/:id', function(req, res, next) {
  DataModel.findOne(filterCompanyCode(req, {
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
  req.body.datamodel = JSON.stringify(datamodel);
  try {
    modelSchema = new mongoose.Schema(datamodel);
  } catch (e) {
    console.log(e);
    modelSchema = new mongoose.Schema({});
    res.status(400);
    return res.json(req.body);
  }
  Metadata.ObjectModels[req.body._id] = mongoose.model('data' + req.body._id, modelSchema);
  module.exports = Metadata;
  DataModel.findOneAndUpdate(filterCompanyCode(req, {
    _id: req.body._id
  }), req.body, function(err, object) {
    if (err) return next(err);
    res.json(object);
  });
});
router.delete('/datamodel/:id', function(req, res, next) {
  DataModel.findOneAndRemove(filterCompanyCode(req, {
    _id: req.params.id
  }), req.body, function(err, object) {
    if (err) return next(err);
    res.json(object);
  });
});
var DataModelRelation = Metadata.DataModelRelation;
router.get('/datamodelrelation/', function(req, res, next) {
  var pageOptions = computePage(req);
  DataModelRelation.find(filterCompanyCode(req, {})).skip(pageOptions.skip).limit(pageOptions.limit).exec(function(
    err, object) {
    if (err) return next(err);
    res.json(object);
  });
});
router.post('/datamodelrelation/', function(req, res, next) {
  filterCompanyCode(req, {});
  DataModelRelation.create(req.body, function(err, object) {
    if (err) return next(err);
    res.json(object);
  });
});
router.get('/datamodelrelation/:id', function(req, res, next) {
  DataModelRelation.findOne(filterCompanyCode(req, {
    _id: req.params.id
  }), function(err, object) {
    if (err) return next(err);
    res.json(object);
  });
});
router.put('/datamodelrelation/:id', function(req, res, next) {
  DataModelRelation.findOneAndUpdate(filterCompanyCode(req, {
    _id: req.body._id
  }), req.body, function(err, object) {
    if (err) return next(err);
    res.json(object);
  });
});
router.delete('/datamodelrelation/:id', function(req, res, next) {
  DataModelRelation.findOneAndRemove(filterCompanyCode(req, {
    _id: req.params.id
  }), req.body, function(err, object) {
    if (err) return next(err);
    res.json(object);
  });
});
var Form = Metadata.Form;
router.get('/form/', function(req, res, next) {
  var pageOptions = computePage(req);
  Form.find(filterCompanyCode(req, {})).skip(pageOptions.skip).limit(pageOptions.limit).exec(function(err, object) {
    if (err) return next(err);
    res.json(object);
  });
});
router.post('/form/', function(req, res, next) {
  filterCompanyCode(req, {});
  Form.create(req.body, function(err, object) {
    if (err) return next(err);
    res.json(object);
  });
});
router.get('/form/:id', function(req, res, next) {
  Form.findOne(filterCompanyCode(req, {
    _id: req.params.id
  }), function(err, object) {
    if (err) return next(err);
    res.json(object);
  });
});
router.put('/form/:id', function(req, res, next) {
  Form.findOneAndUpdate(filterCompanyCode(req, {
    _id: req.body._id
  }), req.body, function(err, object) {
    if (err) return next(err);
    res.json(object);
  });
});
router.delete('/form/:id', function(req, res, next) {
  Form.findOneAndRemove(filterCompanyCode(req, {
    _id: req.params.id
  }), req.body, function(err, object) {
    if (err) return next(err);
    res.json(object);
  });
});
var Value = Metadata.Value;
router.get('/value/', function(req, res, next) {
  var pageOptions = computePage(req);
  Value.find(filterCompanyCode(req, {})).skip(pageOptions.skip).limit(pageOptions.limit).exec(function(err, object) {
    if (err) return next(err);
    res.json(object);
  });
});
router.post('/value/', function(req, res, next) {
  filterCompanyCode(req, {});
  Value.create(req.body, function(err, object) {
    if (err) return next(err);
    res.json(object);
  });
});
router.get('/value/:id', function(req, res, next) {
  Value.findOne(filterCompanyCode(req, {
    _id: req.params.id
  }), function(err, object) {
    if (err) return next(err);
    res.json(object);
  });
});
router.put('/value/:id', function(req, res, next) {
  Value.findOneAndUpdate(filterCompanyCode(req, {
    _id: req.body._id
  }), req.body, function(err, object) {
    if (err) return next(err);
    res.json(object);
  });
});
router.delete('/value/:id', function(req, res, next) {
  Value.findOneAndRemove(filterCompanyCode(req, {
    _id: req.params.id
  }), req.body, function(err, object) {
    if (err) return next(err);
    res.json(object);
  });
});
var UserProfile = Metadata.UserProfile;
router.get('/userprofile/', function(req, res, next) {
  var pageOptions = computePage(req);
  UserProfile.find(filterCompanyCode(req, {})).skip(pageOptions.skip).limit(pageOptions.limit).exec(function(err,
    object) {
    if (err) return next(err);
    res.json(object);
  });
});
router.post('/userprofile/', function(req, res, next) {
  filterCompanyCode(req, {});
  UserProfile.create(req.body, function(err, object) {
    if (err) return next(err);
    res.json(object);
  });
});
router.get('/userprofile/:id', function(req, res, next) {
  UserProfile.findOne(filterCompanyCode(req, {
    _id: req.params.id
  }), function(err, object) {
    if (err) return next(err);
    res.json(object);
  });
});
router.put('/userprofile/:id', function(req, res, next) {
  UserProfile.findOneAndUpdate(filterCompanyCode(req, {
    _id: req.body._id
  }), req.body, function(err, object) {
    if (err) return next(err);
    res.json(object);
  });
});
router.delete('/userprofile/:id', function(req, res, next) {
  UserProfile.findOneAndRemove(filterCompanyCode(req, {
    _id: req.params.id
  }), req.body, function(err, object) {
    if (err) return next(err);
    res.json(object);
  });
});
var User = Metadata.User;
router.get('/user/', function(req, res, next) {
  var pageOptions = computePage(req);
  User.find(filterCompanyCode(req, {})).skip(pageOptions.skip).limit(pageOptions.limit).exec(function(err, object) {
    if (err) return next(err);
    res.json(object);
  });
});
router.post('/user/', function(req, res, next) {
  req.body.user = req.body.user.toLowerCase();
  filterCompanyCode(req, {});
  User.create(req.body, function(err, object) {
    if (err) return next(err);
    res.json(object);
  });
});
router.get('/user/:id', function(req, res, next) {
  User.findOne(filterCompanyCode(req, {
    _id: req.params.id
  }), function(err, object) {
    if (err) return next(err);
    res.json(object);
  });
});
router.put('/user/:id', function(req, res, next) {
  if (req.body.user) req.body.user = req.body.user.toLowerCase();
  User.findOneAndUpdate(filterCompanyCode(req, {
    _id: req.body._id
  }), req.body, function(err, object) {
    if (err) return next(err);
    res.json(object);
  });
});
router.delete('/user/:id', function(req, res, next) {
  User.findOneAndRemove(filterCompanyCode(req, {
    _id: req.params.id
  }), req.body, function(err, object) {
    if (err) return next(err);
    res.json(object);
  });
});
var Company = Metadata.Company;
router.get('/company/', function(req, res, next) {
  var pageOptions = computePage(req);
  Company.find(filterCompanyCode(req, {})).skip(pageOptions.skip).limit(pageOptions.limit).exec(function(err,
    object) {
    if (err) return next(err);
    res.json(object);
  });
});
router.post('/company/', function(req, res, next) {
  filterCompanyCode(req, {});
  Company.create(req.body, function(err, object) {
    if (err) return next(err);
    res.json(object);
  });
});
router.get('/company/:id', function(req, res, next) {
  Company.findOne(filterCompanyCode(req, {
    _id: req.params.id
  }), function(err, object) {
    if (err) return next(err);
    res.json(object);
  });
});
router.put('/company/:id', function(req, res, next) {
  Company.findOneAndUpdate(filterCompanyCode(req, {
    _id: req.body._id
  }), req.body, function(err, object) {
    if (err) return next(err);
    res.json(object);
  });
});
router.delete('/company/:id', function(req, res, next) {
  Company.findOneAndRemove(filterCompanyCode(req, {
    _id: req.params.id
  }), req.body, function(err, object) {
    if (err) return next(err);
    res.json(object);
  });
});
var Workflow = Metadata.Workflow;
router.get('/workflow/', function(req, res, next) {
  var pageOptions = computePage(req);
  var filter = {};
  if (req.query.application_id) {
    filter.application_id =  {
      "$eq": req.query.application_id
    };
  }
  Workflow.find(filterCompanyCode(req, filter)).skip(pageOptions.skip).limit(pageOptions.limit).exec(function(err,
    object) {
    if (err) return next(err);
    res.json(object);
  });
});
router.post('/workflow/', function(req, res, next) {
  filterCompanyCode(req, {});
  Workflow.create(req.body, function(err, object) {
    if (err) return next(err);
    res.json(object);
  });
});
router.get('/workflow/:id', function(req, res, next) {
  Workflow.findOne(filterCompanyCode(req, {
    _id: req.params.id
  }), function(err, object) {
    if (err) return next(err);
    res.json(object);
  });
});
router.put('/workflow/:id', function(req, res, next) {
  Workflow.findOneAndUpdate(filterCompanyCode(req, {
    _id: req.body._id
  }), req.body, function(err, object) {
    if (err) return next(err);
    res.json(object);
  });
});
router.delete('/workflow/:id', function(req, res, next) {
  Workflow.findOneAndRemove(filterCompanyCode(req, {
    _id: req.params.id
  }), req.body, function(err, object) {
    if (err) return next(err);
    res.json(object);
  });
});
var Application = Metadata.Application;
router.get('/application/', function(req, res, next) {
  var pageOptions = computePage(req);
  Application.find(filterCompanyCode(req, {})).skip(pageOptions.skip).limit(pageOptions.limit).exec(function(err,
    object) {
    if (err) return next(err);
    res.json(object);
  });
});
router.post('/application/', function(req, res, next) {
  filterCompanyCode(req, {});
  Application.create(req.body, function(err, object) {
    if (err) return next(err);
    res.json(object);
  });
});
router.get('/application/:id', function(req, res, next) {
  Application.findOne(filterCompanyCode(req, {
    _id: req.params.id
  }), function(err, object) {
    if (err) return next(err);
    res.json(object);
  });
});
router.put('/application/:id', function(req, res, next) {
  Application.findOneAndUpdate(filterCompanyCode(req, {
    _id: req.body._id
  }), req.body, function(err, object) {
    if (err) return next(err);
    res.json(object);
  });
});
router.delete('/application/:id', function(req, res, next) {
  Application.findOneAndRemove(filterCompanyCode(req, {
    _id: req.params.id
  }), req.body, function(err, object) {
    if (err) return next(err);
    res.json(object);
  });
});
module.exports = router;
