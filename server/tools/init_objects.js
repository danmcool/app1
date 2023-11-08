var mongoose = require('mongoose');
//var fs = require('fs');
var saml2 = require('saml2-js');

var Schema = mongoose.Schema;

var Metadata = require('../models/metadata.js');
var Constants = require('../tools/constants.js');
var SessionCache = require('../tools/session_cache.js');
var DatamodelTools = require('../tools/datamodel_tools.js');

mongoose.set('debug', true);
// upload existing data models into memory at run-time (create schema, etc)
var DataModel = Metadata.DataModel;
DataModel.find(function (err, objects) {
    if (err) return next(err);
    var userFound = false;
    var fileFound = false;
    for (var i = 0; i < objects.length; i++) {
        var modelSchema;
        if (objects[i].properties && objects[i].properties.reference == Constants.DataModelUserId) {
            Metadata.Objects[objects[i]._id] = Metadata.User;
            Metadata.UserRefId = objects[i]._id;
            userFound = true;
        } else if (objects[i].properties && objects[i].properties.reference == Constants.DataModelFileId) {
            Metadata.Objects[objects[i]._id] = Metadata.File;
            Metadata.FileRefId = objects[i]._id;
            fileFound = true;
        } else {
            var modelSchema;
            var index = {
                fields: {},
                options: {
                    name: Constants.DataModelIndexName,
                    weights: {},
                    language_override: Constants.DataModelIndexLanguageOverride
                }
            }
            try {
                modelSchema = new Schema(DatamodelTools.buildDataModel(objects[i].projection, index));
            } catch (e) {
                console.log(e);
                modelSchema = new Schema({});
            }
            if (Object.keys(index.fields).length > 0) {
                modelSchema.index(index.fields, index.options);
            }
            Metadata.Objects[objects[i]._id] = mongoose.model(Constants.DataModelPrefix + objects[i]._id, modelSchema, Constants.DataModelPrefix + objects[i]._id);
            Metadata.Objects[objects[i]._id].syncIndexes();
        }
    }
    if (!userFound) {
        DataModel.create('"name": {"en": "User"},"_company_code": "00000","_updated_at": "{}","_created_at": "2023-11-06T14:01:27.170Z","properties": {"reference": "userdata"}', function (err, object) {
            if (err) return next(err);
            Metadata.Objects[object._id] = Metadata.User;
            module.exports = Metadata;
        });
    }
});

// initialize saml service provider
var sp_options = {
    entity_id: 'app1_saml_metadata.xml', //'https://localhost/authentication/saml_metadata',
    //private_key: fs.readFileSync('./server/ssl/app1-key.pem', 'utf8'),
    //certificate: fs.readFileSync('./server/ssl/app1-cert.crt', 'utf8'),
    assert_endpoint: 'https://' + process.env.APP1_SERVER_NAME + '/authentication/saml_callback',
    force_authn: false,
    //auth_context: {
    //    comparison: 'exact',
    //    class_refs: ['urn:oasis:names:tc:SAML:1.0:am:password']
    //},
    //nameid_format: 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient',
    sign_get_request: false,
    allow_unencrypted_assertion: true
}
SessionCache.serviceProvider = new saml2.ServiceProvider(sp_options);
