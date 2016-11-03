var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Metadata = {
    ObjectModels: []
};

var UserProfileSchema = new Schema({
    name: String,
    type: String, // administrator/private/public
    profile: String,
    properties: String, // language (en/fr, etc), color theme, etc.
    _updated_at: {
        type: Date,
        default: Date.now
    },
    _company_code: String
});
Metadata.UserProfile = mongoose.model('UserProfile', UserProfileSchema);
var CompanySchema = new Schema({
    name: String,
    applications: [Schema.Types.ObjectId],
    properties: String,
    _updated_at: {
        type: Date,
        default: Date.now
    },
    _company_code: String
});
Metadata.Company = mongoose.model('Company', CompanySchema);
var UserSchema = new Schema({
    user: String,
    password: String,
    email: String,
    firstname: String,
    lastname: String,
    properties: Schema.Types.Mixed,
    validated: {
        type: Boolean,
        default: false
    },
    profile: {
        type: Schema.Types.ObjectId,
        ref: 'UserProfile'
    },
    company: {
        type: Schema.Types.ObjectId,
        ref: 'Company'
    },
    _updated_at: {
        type: Date,
        default: Date.now
    },
    _company_code: String
});
Metadata.User = mongoose.model('User', UserSchema);

var DataModelSchema = new Schema({
    name: String,
    datamodel: Schema.Types.Mixed,
    translation: Schema.Types.Mixed,
    _updated_at: {
        type: Date,
        default: Date.now
    },
    _company_code: String
});
Metadata.DataModel = mongoose.model('DataModel', DataModelSchema);

var FileSchema = new Schema({
    name: String,
    type: String, // file type (pdf, jpeg, etc.)
    storage: String, // S3 or disk
    path: String, // file path
    file_id: String, // name on disk
    _updated_at: {
        type: Date,
        default: Date.now
    },
    _company_code: String
});
Metadata.File = mongoose.model('File', FileSchema);

var FormSchema = new Schema({
    name: String,
    type: String, // List or Form
    datamodel_id: Schema.Types.ObjectId,
    display: Schema.Types.Mixed, //[{name:String, disabled: Boolean, required: Boolean, display:String, validation: Schema.Types.Mixed}],
    search_criteria: String,
    sort_by: String,
    actions: Schema.Types.Mixed, //[{name:String, icon:String, next_form_id: Schema.Types.ObjectId, action: String, next_form_parameters: String, replace_value:Schema.Types.Mixed}],
    item_actions: Schema.Types.Mixed, //[{name:String, icon:String, next_form_id: Schema.Types.ObjectId, action: String, next_form_parameters: String, replace_value:Schema.Types.Mixed}],
    _updated_at: {
        type: Date,
        default: Date.now
    },
    _company_code: String
});
Metadata.Form = mongoose.model('Form', FormSchema);
var ValueSchema = new Schema({
    name: String,
    type: String, // flat, search
    values: Schema.Types.Mixed,
    _updated_at: {
        type: Date,
        default: Date.now
    },
    _company_code: String
});
Metadata.Value = mongoose.model('Value', ValueSchema);
var WorkflowSchema = new Schema({
    name: String,
    description: String,
    icon: String,
    startup_form_id: Schema.Types.ObjectId,
    application_id: Schema.Types.ObjectId,
    _updated_at: {
        type: Date,
        default: Date.now
    },
    _company_code: String
});
Metadata.Workflow = mongoose.model('Workflow', WorkflowSchema);
var ApplicationSchema = new Schema({
    name: String,
    description: String,
    icon: String,
    _updated_at: {
        type: Date,
        default: Date.now
    },
    _company_code: String
});
Metadata.Application = mongoose.model('Application', ApplicationSchema);

module.exports = Metadata;
