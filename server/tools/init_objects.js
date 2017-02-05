var mongoose = require('mongoose');
var fs = require('fs');
var saml2 = require('saml2-js');

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
        Metadata.Objects[objects[i]._id] = mongoose.model('data' + objects[i]._id, modelSchema);
    }
});

// create session cache
/*var Session = Metadata.Session;
var User = Metadata.User;
Session.find({
    timeout: {
        "$gt": Date.now()
    }
}).exec(function(errSessions, existingSessions) {
    if (errSessions) return next(errSessions);
    if (!existingSessions) return;
    for (var i = 0; i < existingSessions.length; i++) {
        var token = existingSessions[i]._id;
        User.findOne({
            _id: existingSessions[i].user,
            validated: true
        }, 'email firstname lastname user _company_code properties company profile remote_profiles manager reports')
            .populate('company profile remote_profiles').exec(
                function(err, userObject) {
                    if (err) return next(err);
                    if (!userObject) return;
                    SessionCache.login(token, userObject);
                });
    }
});*/

// initialize saml service provider
var sp_options = {
    entity_id: "app1_saml_metadata.xml", //'https://localhost/authentication/saml_metadata',
    private_key: fs.readFileSync("./server/ssl/app1-key.pem", "utf8"),
    certificate: fs.readFileSync("./server/ssl/app1-cert.crt", "utf8"),
    assert_endpoint: "https://app1.cloud/authentication/saml_callback",
    force_authn: false,
    /*auth_context: {
        comparison: 'exact',
        class_refs: ['urn:oasis:names:tc:SAML:1.0:am:password']
    },*/
    //nameid_format: 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient',
    sign_get_request: false,
    allow_unencrypted_assertion: true
}
SessionCache.service_provider = new saml2.ServiceProvider(sp_options);

// initialize saml identity providers
var idp_options = {
    sso_login_url: "https://idp.ssocircle.com:443/sso/SSORedirect/metaAlias/publicidp",
    //sso_login_url: 'https://idp.testshib.org/idp/profile/SAML2/Redirect/SSO',
    //sso_logout_url: '',
    certificates: [fs.readFileSync("./server/ssl/idp-cert.crt", "utf8")]
};
SessionCache.updateCompanyIdP("00000", new saml2.IdentityProvider(idp_options));
