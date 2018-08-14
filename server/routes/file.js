var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

var Metadata = require('../models/metadata.js');
var SessionCache = require('../tools/session_cache.js');
var Constants = require('../tools/constants.js');;

router.get('/url/:id', function (req, res, next) {
    Metadata.File.findOne({
        _id: req.params.id
    }, function (err, file) {
        if (err) return next(err);
        if (!file) return res.status(401).json({
            'msg': 'Cannot find file object!'
        });
        var user = SessionCache.userData[req.cookies[Constants.SessionCookie]];
        if (file._company_code != user._company_code && JSON.stringify(user.remote_profiles).indexOf(file._company_code) == -1) {
            return res.status(400).json({
                msg: 'Not enough access rights!'
            });
        }
        res.json({
            url: 'https://localhost/client/file/' + file._id
        });
    });
});
router.get('/', function (req, res, next) {
    var userToken = req.cookies[Constants.SessionCookie];
    var pageOptions = {
        skip: parseInt(req.query.skip) || 0,
        limit: parseInt(req.query.limit) || 10
    }
    var search_criteria = JSON.parse(req.query.search_criteria ? req.query.search_criteria : '{}');
    search_criteria._company_code = {
        '$eq': SessionCache.userData[userToken]._company_code
    }
    var sort_by = JSON.parse(req.query.sort_by ? req.query.sort_by : '{}');
    Metadata.File.find(search_criteria).skip(pageOptions.skip).limit(pageOptions.limit).sort(sort_by).exec(function (
        err, objects) {
        if (err) return next(err);
        res.json(objects);
    });
});
router.post('/', function (req, res, next) {
    if (!req.body.name || !req.body.type) {
        return res.status(400).json({
            msg: 'Missing file name or type!'
        });
    }
    var user = SessionCache.userData[req.cookies[Constants.SessionCookie]];
    var company_code = user._company_code;
    if (req.body.pid) {
        for (var i = 0; i < user.remote_profiles.length; i++) {
            if (user.remote_profiles[i]._id == req.body.pid) {
                company_code = user.remote_profiles[i]._company_code;
                break;
            }
        }
    }
    if (req.body) {
        req.body._created_at = Date.now();
        req.body._updated_at = req.body._created_at;
        req.body._company_code = company_code;
    }
    Metadata.File.create(req.body, function (err, file) {
        if (err) return next(err);
        var result = {
            file: file,
            url: '/client/file/upload/' + company_code + '/' + file._id
        }
        res.json(result);
    });
});
router.put('/upload/:company_code/:fileid', function (req, res, next) {
    var encrypt = crypto.createCipher(Constants.FilesCryptingAlgorithm, Constants.SecretKey);
    var file = fs.createWriteStream('./files/' + req.params.company_code + '-' + req.params.fileid);
    req.pipe(encrypt).pipe(file);
    res.status(200).json({
        msg: 'File uploaded successfully!'
    });
    res.end();
});
router.get('/:id', function (req, res, next) {
    Metadata.File.findOne({
        _id: req.params.id
    }, function (err, file) {
        if (err) return next(err);
        if (!file) return res.status(401).json({
            msg: 'Cannot find file object!'
        });
        var user = SessionCache.userData[req.cookies[Constants.SessionCookie]];
        if (file._company_code != user._company_code && JSON.stringify(user.remote_profiles).indexOf(file._company_code) == -1) {
            return res.status(400).json({
                msg: 'Not enough access rights!'
            });
        }
        var readStream = fs.createReadStream('./files/' + file._company_code + '-' + file._id);
        readStream.on('error', function () {
            return res.status(500).json({
                msg: 'File read error!'
            });
        });
        readStream.on('open', function () {
            res.setHeader("Content-Type", file.type);
            res.writeHead(200);
            var decrypt = crypto.createDecipher(Constants.FilesCryptingAlgorithm, Constants.SecretKey);
            readStream.pipe(decrypt).pipe(res);
        });
    });
});
router.put('/:id', function (req, res, next) {
    var lookup_date = Date.parse(req.body._updated_at);
    req.body._updated_at = Date.now();
    Metadata.File.findOneAndUpdate({
        _id: req.params.id,
        _updated_at: lookup_date,
        _company_code: SessionCache.userData[req.cookies[Constants.SessionCookie]]._company_code
    }, req.body, function (err, object) {
        if (err) return next(err);
        if (object) {
            res.json(object);
        } else {
            Metadata.File.findOne({
                _id: req.params.id,
                _company_code: SessionCache.userData[req.cookies[Constants.SessionCookie]]._company_code
            }, function (err, object) {
                if (err) return next(err);
                res.status(400).json(object);
            });
        }
    });
});
router.delete('/:id', function (req, res, next) {
    var user = SessionCache.userData[req.cookies[Constants.SessionCookie]];
    var company_code = user._company_code;
    if (req.query.pid) {
        for (var i = 0; i < user.remote_profiles.length; i++) {
            if (user.remote_profiles[i]._id == req.query.pid) {
                company_code = user.remote_profiles[i]._company_code;
                break;
            }
        }
    }
    Metadata.File.findOneAndRemove({
        _id: req.params.id,
        _company_code: company_code
    }, function (err, file) {
        if (err) return next(err);
        fs.unlink('./files/' + company_code + '-' + file._id, function () {
            res.json({
                msg: 'File has been deleted!'
            });
        });
    });
});
module.exports = router;
