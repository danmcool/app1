var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Metadata = require('../models/Metadata.js');
var Session = require('../models/Session');
var DataModel = Metadata.DataModel;
router.get('/:datamodelid/', function(req, res, next) {
  var pageOptions = {
    skip: parseInt(req.query.skip) || 0,
    limit: parseInt(req.query.limit) || 10
  }
  var search_criteria = JSON.parse(req.query.search_criteria ? req.query.search_criteria : "{}");
  search_criteria._company_code = {
    "$eq": Session.users[req.cookies.app1_token]._company_code
  };
  var sort_by = JSON.parse(req.query.sort_by ? req.query.sort_by : "{}");
  Metadata.ObjectModels[req.params.datamodelid].find(search_criteria).skip(pageOptions.skip).limit(pageOptions.limit)
    .sort(sort_by).exec(function(err, objects) {
      if (err) return next(err);
      res.json(objects);
    });
});
router.post('/:datamodelid/', function(req, res, next) {
  if (req.body) {
    req.body._updated_at = Date.now();
    req.body._company_code = Session.users[req.cookies.app1_token]._company_code;
  }
  Metadata.ObjectModels[req.params.datamodelid].create(req.body, function(err, object) {
    if (err) return next(err);
    res.json(object);
  });
});
router.get('/:datamodelid/:id', function(req, res, next) {
  Metadata.ObjectModels[req.params.datamodelid].findOne({
    _id: req.params.id,
    _company_code: Session.users[req.cookies.app1_token]._company_code
  }, function(err, object) {
    if (err) return next(err);
    res.json(object);
  });
});
router.put('/:datamodelid/:id', function(req, res, next) {
  var lookup_date = Date.parse(req.body._updated_at);
  req.body._updated_at = Date.now();
  Metadata.ObjectModels[req.params.datamodelid].findOneAndUpdate({
    _id: req.params.id,
    _updated_at: lookup_date,
    _company_code: Session.users[req.cookies.app1_token]._company_code
  }, req.body, function(err, object) {
    if (err) return next(err);
    if (object) {
      res.json(object);
    } else {
      Metadata.ObjectModels[req.params.datamodelid].findOne({
        _id: req.params.id,
        _company_code: Session.users[req.cookies.app1_token]._company_code
      }, function(err, object) {
        if (err) return next(err);
        res.status(400);
        res.json(object);
      });
    }
  });
});
router.delete('/:datamodelid/:id', function(req, res, next) {
  Metadata.ObjectModels[req.params.datamodelid].findOneAndRemove({
    _id: req.params.id,
    _company_code: Session.users[req.cookies.app1_token]._company_code
  }, function(err, object) {
    if (err) return next(err);
    res.json(object);
  });
});
module.exports = router;
