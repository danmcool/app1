var mongoose = require('mongoose');
var fs = require('fs');
var saml2 = require('saml2-js');

var Schema = mongoose.Schema;

var Metadata = require('../models/metadata.js');
var Constants = require('../tools/constants.js');
var SessionCache = require('../tools/session_cache.js');

var prepareIndex = function (translation, path, index) {
    if (typeof (translation) != 'object') return;
    var keys = Object.keys(translation);
    if (path != '') {
        path = path + '.';
    }
    for (var i = 0; i < keys.length; i++) {
        var field = path + keys[i];
        if (translation[keys[i]] && translation[keys[i]].index) {
            index.fields[field] = 'text';
            index.options.weights[field] = translation[keys[i]].index_weight;
        }
        prepareIndex(translation[keys[i]], field, index);
    }
}

// upload existing data models into memory at run-time (create schema, etc)
var DataModel = Metadata.DataModel;
DataModel.find(function (err, objects) {
    if (err) return next(err);
    for (var i = 0; i < objects.length; i++) {
        var modelSchema;
        try {
            var datamodel = JSON.parse(objects[i].datamodel ? objects[i].datamodel : '{}');
            datamodel._updated_at = 'Date';
            datamodel._company_code = 'String';
            datamodel._user = 'String';
            datamodel._files = [{
                type: Schema.Types.ObjectId,
                ref: 'File'
            }];
            modelSchema = new Schema(datamodel);
        } catch (e) {
            console.log(e);
            modelSchema = new Schema({});
        }
        var index = {
            fields: {},
            options: {
                name: '_search',
                weights: {}
            }
        };
        var translation = objects[i].translation ? objects[i].translation : {};
        prepareIndex(translation, '', index);
        modelSchema.index(index.fields, index.options);
        Metadata.Objects[objects[i]._id] = mongoose.model(Constants.DataModelPrefix + objects[i]._id, modelSchema);
    }
    Metadata.Objects[Constants.DataModelUserData] = Metadata.User;
});

// initialize saml service provider
var sp_options = {
    entity_id: 'app1_saml_metadata.xml', //'https://localhost/authentication/saml_metadata',
    private_key: fs.readFileSync('./server/ssl/app1-key.pem', 'utf8'),
    certificate: fs.readFileSync('./server/ssl/app1-cert.crt', 'utf8'),
    assert_endpoint: 'https://app1.cloud/authentication/saml_callback',
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
