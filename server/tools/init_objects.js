var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Metadata = require('../models/metadata.js');
var SessionCache = require('../tools/session_cache.js');

// upload existing data models into memory at run-time (create schema, etc)
var DataModel = Metadata.DataModel;
DataModel.find(function(err, objects) {
    if (err) return next(err);
    for (var i = 0; i < objects.length; i++) {
        var modelSchema;
        try {
            var datamodel = JSON.parse(objects[i].datamodel ? objects[i].datamodel : "{}");
            datamodel._updated_at = "Date";
            datamodel._company_code = "String";
            datamodel._user = "String";
            datamodel._files = [{
                type: Schema.Types.ObjectId,
                ref: 'File'
            }];
            modelSchema = new Schema(datamodel);
        } catch (e) {
            console.log(e);
            modelSchema = new Schema({});
        }
        Metadata.ObjectModels[objects[i]._id] = mongoose.model('data' + objects[i]._id, modelSchema);
    }
});

var Session = Metadata.Session;
var User = Metadata.User;
Session.find({
    timeout: {
        "$gt": Date.now()
    }
}).populate('user').exec(function(errSessions, existingSessions) {
    if (errSessions) return next(errSessions);
    if (!existingSessions) return;
    for (var i = 0; i < existingSessions.length; i++) {
        var token = existingSessions[i]._id;
        User.findOne({
            _id: existingSessions[i].user._id,
            validated: true
        }, 'email firstname lastname user _company_code properties company profile')
            .populate('company profile').exec(
                function(err, user) {
                    if (err) return next(err);
                    if (!user) return;
                    var jsonUser = JSON.parse(JSON.stringify(user));
                    SessionCache.login(token, jsonUser);
                });
    }
});
