var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Constants = require('../tools/constants.js');

var Metadata = {
    Objects: {}
};

var DataModelSchema = new Schema({
    name: Schema.Types.Mixed,
    description: Schema.Types.Mixed,
    projection: Schema.Types.Mixed,
    properties: Schema.Types.Mixed,
    _updated_at: {
        type: Date,
        default: Date.now
    },
    _created_at: {
        type: Date,
        default: Date.now
    },
    _company_code: String
});
Metadata.DataModel = mongoose.model('DataModel', DataModelSchema);

var MachineLearningModelSchema = new Schema({
    name: Schema.Types.Mixed,
    description: Schema.Types.Mixed,
    datamodel: {
        type: Schema.Types.ObjectId,
        ref: 'DataModel'
    },
    brain: Schema.Types.Mixed,
    input: Schema.Types.Mixed,
    output: Schema.Types.Mixed,
    learning_configuration: {
        error_threshold: {
            type: Number,
            default: 0.005
        },
        max_iterations: {
            type: Number,
            default: 20000
        },
        learning_rate: {
            type: Number,
            default: 0.3
        }
    },
    learning_result: {
        run_date: Date,
        iterations: Number,
        error: Number
    },
    values: [{
        type: Schema.Types.ObjectId,
        ref: 'Value'
    }],
    properties: Schema.Types.Mixed,
    neural_network: Schema.Types.Mixed,
    _updated_at: {
        type: Date,
        default: Date.now
    },
    _created_at: {
        type: Date,
        default: Date.now
    },
    _company_code: String
});
Metadata.MachineLearningModel = mongoose.model('MachineLearningModel', MachineLearningModelSchema);

var ValueSchema = new Schema({
    name: Schema.Types.Mixed,
    type: String, // flat, search
    values: Schema.Types.Mixed,
    _updated_at: {
        type: Date,
        default: Date.now
    },
    _created_at: {
        type: Date,
        default: Date.now
    },
    _company_code: String
});
Metadata.Value = mongoose.model('Value', ValueSchema);

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
    _created_at: {
        type: Date,
        default: Date.now
    },
    _company_code: String
});
Metadata.File = mongoose.model('File', FileSchema);

var FormSchema = new Schema({
    name: Schema.Types.Mixed,
    datamodel: {
        type: Schema.Types.ObjectId,
        ref: 'DataModel'
    },
    search_criteria: String,
    sort_by: String,
    display: Schema.Types.Mixed,
    actions: Schema.Types.Mixed,
    values: [{
        type: Schema.Types.ObjectId,
        ref: 'Value'
    }],
    _updated_at: {
        type: Date,
        default: Date.now
    },
    _created_at: {
        type: Date,
        default: Date.now
    },
    _company_code: String
});
Metadata.Form = mongoose.model('Form', FormSchema);

var WorkflowSchema = new Schema({
    name: Schema.Types.Mixed,
    description: Schema.Types.Mixed,
    icon: String,
    type: String, // workflow/url/file
    file: {
        type: Schema.Types.ObjectId,
        ref: 'File'
    },
    url: String,
    startup_form: {
        type: Schema.Types.ObjectId,
        ref: 'Form'
    },
    forms: [{
        type: Schema.Types.ObjectId,
        ref: 'Form'
    }],
    _updated_at: {
        type: Date,
        default: Date.now
    },
    _created_at: {
        type: Date,
        default: Date.now
    },
    _company_code: String
});
Metadata.Workflow = mongoose.model('Workflow', WorkflowSchema);

var ApplicationSchema = new Schema({
    name: Schema.Types.Mixed,
    description: Schema.Types.Mixed,
    icon: Schema.Types.Mixed,
    type: String, // application/url/file
    active: {
        type: Boolean,
        default: false
    },
    file: {
        type: Schema.Types.ObjectId,
        ref: 'File'
    },
    url: String,
    workflows: [{
        type: Schema.Types.ObjectId,
        ref: 'Workflow'
    }],
    profiles: [{
        type: Schema.Types.ObjectId,
        ref: 'UserProfile'
    }],
    default_profile: {
        type: Schema.Types.ObjectId,
        ref: 'UserProfile'
    },
    properties: Schema.Types.Mixed,
    _updated_at: {
        type: Date,
        default: Date.now
    },
    _created_at: {
        type: Date,
        default: Date.now
    },
    _company_code: String
});
Metadata.Application = mongoose.model('Application', ApplicationSchema);

var UserProfileSchema = new Schema({
    name: Schema.Types.Mixed,
    type: String, // administrator/private/public/share/application
    profile: Schema.Types.Mixed,
    properties: Schema.Types.Mixed, // application,
    _updated_at: {
        type: Date,
        default: Date.now
    },
    _created_at: {
        type: Date,
        default: Date.now
    },
    _company_code: String
});
Metadata.UserProfile = mongoose.model('UserProfile', UserProfileSchema);

var SessionSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    timeout: Date,
    properties: String, // browser, device, etc
    _updated_at: {
        type: Date,
        default: Date.now
    },
    _created_at: {
        type: Date,
        default: Date.now
    },
    _company_code: String
});
Metadata.Session = mongoose.model('Session', SessionSchema);

var SubscriptionSchema = new Schema({
    name: String,
    users: {
        type: Number,
        default: 10
    },
    applications: {
        type: Number,
        default: 10
    },
    create_applications: {
        type: Number,
        default: 1
    },
    datamodels: {
        type: Number,
        default: 1
    },
    properties: Schema.Types.Mixed,
    _updated_at: {
        type: Date,
        default: Date.now
    },
    _created_at: {
        type: Date,
        default: Date.now
    },
    _company_code: {
        type: String,
        unique: true
    }
});
Metadata.Subscription = mongoose.model('Subscription', SubscriptionSchema);

var CompanySchema = new Schema({
    name: String,
    applications: [{
        type: Schema.Types.ObjectId,
        ref: 'Application'
    }],
    subscription: {
        type: Schema.Types.ObjectId,
        ref: 'Subscription'
    },
    properties: Schema.Types.Mixed,
    _updated_at: {
        type: Date,
        default: Date.now
    },
    _created_at: {
        type: Date,
        default: Date.now
    },
    _company_code: {
        type: String,
        unique: true
    }
});
Metadata.Company = mongoose.model('Company', CompanySchema);

var UserSchema = new Schema({
    user: {
        type: String,
        unique: true
    },
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
    remote_profiles: [{
        type: Schema.Types.ObjectId,
        ref: 'UserProfile'
    }],
    remote_applications: [{
        type: Schema.Types.ObjectId,
        ref: 'Application'
    }],
    company: {
        type: Schema.Types.ObjectId,
        ref: 'Company'
    },
    manager: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reports: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    _updated_at: {
        type: Date,
        default: Date.now
    },
    _created_at: {
        type: Date,
        default: Date.now
    },
    _company_code: String
});
var indexUser = {
    fields: {
        firstname: 'text',
        lastname: 'text',
        email: 'text',
        '$**': 'text'
    },
    options: {
        name: Constants.DataModelIndexName,
        weights: {
            firstname: 5,
            lastname: 5,
            email: 3,
            '$**': 2
        },
        language_override: Constants.DataModelIndexLanguageOverride
    }
};
UserSchema.index(indexUser.fields, indexUser.options);
Metadata.User = mongoose.model('User', UserSchema);
Metadata.User.syncIndexes();

module.exports = Metadata;
