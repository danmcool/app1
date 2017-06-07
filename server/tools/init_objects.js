var mongoose = require('mongoose');
var fs = require('fs');
var saml2 = require('saml2-js');

var Schema = mongoose.Schema;

var Metadata = require('../models/metadata.min.js');
var SessionCache = require('../tools/session_cache.min.js');

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
		Metadata.Objects[objects[i]._id] = mongoose.model('data' + objects[i]._id, modelSchema);
	}
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
