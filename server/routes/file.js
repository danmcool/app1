var express = require('express');
var router = express.Router();
var Session = require('../models/Session');
const S3_BUCKET = 'app1data';
const REGION = 'eu-central-1';
var AWS = require('aws-sdk');
AWS.config.update({
  accessKeyId: 'AKIAIYXUGMUVMMXJXR3A',
  secretAccessKey: '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',
  region: REGION
});
var s3 = new AWS.S3({
  params: {
    Bucket: S3_BUCKET
  }
});
var mongoose = require('mongoose');
var Metadata = require('../models/Metadata.js');
var Session = require('../models/Session');

router.get('/', function(req, res, next) {
  var pageOptions = {
    skip: parseInt(req.query.skip) || 0,
    limit: parseInt(req.query.limit) || 10
  }
  var search_criteria = JSON.parse(req.query.search_criteria ? req.query.search_criteria : "{}");
  search_criteria._company_code = {
    "$eq": Session.users[req.cookies.app1_token]._company_code
  };
  var sort_by = JSON.parse(req.query.sort_by ? req.query.sort_by : "{}");
  Metadata.File.find(search_criteria).skip(pageOptions.skip).limit(pageOptions.limit).sort(sort_by).exec(function(
    err, objects) {
    if (err) return next(err);
    res.json(objects);
  });
});
router.post('/', function(req, res, next) {
  if (req.body) {
    req.body._updated_at = Date.now();
    req.body._company_code = Session.users[req.cookies.app1_token]._company_code;
  }
  Metadata.File.create(req.body, function(err, object) {
    if (err) return next(err);
    var params = {
      Key: req.body._company_code + "/" + object._id,
      ContentType: object.type,
      ACL: 'public-read'
    };
    s3.getSignedUrl('putObject', params, (err, data) => {
      if (err) {
        console.log(err);
        return next(err);
      }
      var result = {
        file: object,
        signedRequest: data,
        url: 'http://s3.' + REGION + '.amazonaws.com/' + S3_BUCKET + '/' + object._company_code + '/' +
          object._id
      }
      res.json(result);
      res.end();
    });
  });
});
router.get('/:id', function(req, res, next) {
  Metadata.File.findOne({
    _id: req.params.id,
    _company_code: Session.users[req.cookies.app1_token]._company_code
  }, function(err, object) {
    if (err) return next(err);
    var params = {
      Key: req.body._company_code + "/" + object._id,
      ContentType: object.type,
      ACL: 'public-read'
    };
    s3.getSignedUrl('getObject', params, function(err, url) {
      console.log("The URL is", url);
      var result = {
        file: object,
        url: url
      }
      res.json(result);
    });
  });
});
router.put('/:id', function(req, res, next) {
  var lookup_date = Date.parse(req.body._updated_at);
  req.body._updated_at = Date.now();
  Metadata.File.findOneAndUpdate({
    _id: req.params.id,
    _updated_at: lookup_date,
    _company_code: Session.users[req.cookies.app1_token].code
  }, req.body, function(err, object) {
    if (err) return next(err);
    if (object) {
      res.json(object);
    } else {
      Metadata.File.findOne({
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
router.delete('/:id', function(req, res, next) {
  Metadata.File.findOneAndRemove({
    _id: req.params.id,
    _company_code: Session.users[req.cookies.app1_token]._company_code
  }, function(err, object) {
    if (err) return next(err);
    res.json(object);
  });
});
module.exports = router;
