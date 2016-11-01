var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Metadata = {
    ObjectModels: [],
    Constants: {
        WebAddress: "ec2-52-57-61-58.eu-central-1.compute.amazonaws.com",
        AdminCompany: "00000",
        ProductionCompany: "00000",
        ApplicationHome: "home",
        InitialPassword: "Start123",
        UserProfileAdministrator: "administrator",
        UserProfilePrivate: "private",
        UserProfilePublic: "public"
    }
};
var UserSchema = new Schema({
    user: String,
    password: String,
    email: String,
    firstname: String,
    lastname: String,
    validated: {
        type: Boolean,
        default: false
    },
    profile_id: Schema.Types.ObjectId,
    _updated_at: {
        type: Date,
        default: Date.now
    },
    _company_code: String
});
Metadata.User = mongoose.model('User', UserSchema);
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
var DataModelRelationSchema = new Schema({
    name: String,
    datamodel1: Schema.Types.ObjectId,
    datamodel2: Schema.Types.ObjectId,
    type: String, // 1-1, 1-n
    _updated_at: {
        type: Date,
        default: Date.now
    },
    _company_code: String
});
Metadata.DataModelRelation = mongoose.model('DataModelRelation', DataModelRelationSchema);
var FormSchema = new Schema({
    name: String,
    type: String, // List or Form
    datamodel_id: Schema.Types.ObjectId,
    display: Schema.Types.Mixed, //[{name:String, disabled: Boolean, required: Boolean, display:String, validation: Schema.Types.Mixed}],
    search_criteria: String,
    sort_by: String,
    actions: Schema.Types.Mixed, //[{name:String, icon:String, next_form_id: Schema.Types.ObjectId, action: String, formula: String}],
    item_actions: Schema.Types.Mixed, //[{name:String, icon:String, next_form_id: Schema.Types.ObjectId, action: String, formula: String}],
    _updated_at: {
        type: Date,
        default: Date.now
    },
    _company_code: String
});
Metadata.Form = mongoose.model('Form', FormSchema);
var ValueSchema = new Schema({
    name: String,
    type: String, // Flat or Hierarchy
    values: [String],
    _updated_at: {
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
    _company_code: String
});
Metadata.File = mongoose.model('File', FileSchema);
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
var replaceFormDataModel = function(formId, oldDataModel, newDataModel) {
    //console.log(formId + "-"+oldDataModel+"-"+newDataModel);
    if (formId) {
        Metadata.Form.update({
            "_id": formId,
            "datamodel_id": oldDataModel
        }, {
            "$set": {
                "datamodel_id": newDataModel
            }
        }, function(error) {
            if (error) console.log(error);
        });;
    }
}
Metadata.copyDataModel = function(currentDataModelId, _company_code, objectList, newFormId) {
    if (objectList["d_" + currentDataModelId]) {
        replaceFormDataModel(newFormId, currentDataModelId, objectList["d_" + currentDataModelId]);
        return;
    }
    Metadata.DataModel.findOne({
        _company_code: Metadata.Constants.ProductionCompany,
        _id: currentDataModelId
    }, function(err, dataModelObject) {
        if (!dataModelObject) return;
        if (objectList["d_" + currentDataModelId]) {
            replaceFormDataModel(newFormId, currentDataModelId, objectList["d_" + currentDataModelId]);
            return;
        }
        var newDataModelObject = new Metadata.DataModel(dataModelObject);
        newDataModelObject._id = mongoose.Types.ObjectId();
        objectList["d_" + currentDataModelId] = newDataModelObject._id;
        newDataModelObject.isNew = true;
        newDataModelObject._company_code = _company_code;
        newDataModelObject.save().then(function() {
            //console.log("d"+newDataModelObject._id)
            replaceFormDataModel(newFormId, currentDataModelId, objectList["d_" + currentDataModelId]);
            var modelSchema;
            try {
                modelSchema = new Schema(JSON.parse(newDataModelObject.datamodel ? newDataModelObject.datamodel : "{}"));
            } catch (e) {
                console.log(e);
                modelSchema = new Schema({});
            }
            Metadata.ObjectModels[newDataModelObject._id] = mongoose.model('data' + newDataModelObject._id, modelSchema);
            module.exports = Metadata;
        });
    });
}
var replaceFormValues = function(formId, oldValues, newValues) {
    //console.log("f"+formId + "-"+oldValues+"-"+newValues);
    if (formId) {
        Metadata.Form.update({
            "_id": formId,
            "display.listofvalues": oldValues
        }, {
            "$set": {
                "display.$.listofvalues": newValues
            }
        }, function(error) {
            if (error) console.log(error);
        });;
    }
};
Metadata.copyValues = function(currentValueId, _company_code, objectList, newFormId) {
    if (objectList["v_" + currentValueId]) {
        replaceFormValues(newFormId, currentValueId, objectList["v_" + currentValueId]);
        return;
    }
    Metadata.Value.findOne({
        _company_code: Metadata.Constants.ProductionCompany,
        _id: currentValueId
    }, function(err, valueObject) {
        if (!valueObject) return;
        if (objectList["v_" + currentValueId]) {
            replaceFormValues(newFormId, currentValueId, objectList["v_" + currentValueId]);
            return;
        }
        var newValueObject = new Metadata.Value(valueObject);
        newValueObject._id = mongoose.Types.ObjectId();
        objectList["v_" + currentValueId] = newValueObject._id;
        newValueObject.isNew = true;
        newValueObject._company_code = _company_code;
        newValueObject.save().then(function() {
            //console.log("v"+newValueObject._id)
            replaceFormValues(newFormId, currentValueId, objectList["v_" + currentValueId]);
        });
    });
};
var replaceFormPredecessor = function(workflowId, parentFormId, oldFormId, newFormId) {
    //console.log("w"+workflowId + "-"+oldFormId+"-"+newFormId);
    if (workflowId) {
        Metadata.Workflow.update({
            "_id": workflowId,
            "startup_form_id": oldFormId
        }, {
            "$set": {
                "startup_form_id": newFormId
            }
        }, function(error) {
            if (error) console.log(error);
        });;
    }
    //console.log("f"+parentFormId + "-"+oldFormId+"-"+newFormId);
    if (parentFormId) {
        Metadata.Form.update({
            "_id": parentFormId,
            "actions.next_form_id": oldFormId
        }, {
            "$set": {
                "actions.$.next_form_id": newFormId
            }
        }, function(error) {
            if (error) console.log(error);
        });;
        Metadata.Form.update({
            "_id": parentFormId,
            "item_actions.next_form_id": oldFormId
        }, {
            "$set": {
                "item_actions.$.next_form_id": newFormId
            }
        }, function(error) {
            if (error) console.log(error);
        });;
    }
};
Metadata.copyForm = function(currentFormId, _company_code, objectList, newWorkflowId, parentNewFormId) {
    if (currentFormId == Metadata.Constants.ApplicationHome) return;
    if (objectList["f_" + currentFormId]) {
        replaceFormPredecessor(newWorkflowId, parentNewFormId, currentFormId, objectList["f_" + currentFormId]);
        return;
    }
    Metadata.Form.findOne({
        _company_code: Metadata.Constants.ProductionCompany,
        _id: currentFormId
    }, function(err, formObject) {
        if (!formObject) return;
        if (objectList["f_" + currentFormId]) {
            replaceFormPredecessor(newWorkflowId, parentNewFormId, currentFormId, objectList["f_" + currentFormId]);
            return;
        }
        var newFormObject = new Metadata.Form(formObject);
        newFormObject._id = mongoose.Types.ObjectId();
        objectList["f_" + currentFormId] = newFormObject._id;
        newFormObject.isNew = true;
        newFormObject._company_code = _company_code;
        newFormObject.save().then(function() {
            //console.log("f"+newFormObject._id)
            replaceFormPredecessor(newWorkflowId, parentNewFormId, currentFormId, objectList["f_" + currentFormId]);
            Metadata.copyDataModel(newFormObject.datamodel_id, _company_code, objectList, newFormObject._id);
            if (newFormObject.display) {
                for (var j = 0; j < newFormObject.display.length; j++) {
                    if (newFormObject.display[j].listofvalues) {
                        Metadata.copyValues(newFormObject.display[j].listofvalues, _company_code, objectList, newFormObject._id);
                    }
                }
            }
            if (newFormObject.actions) {
                for (var i = 0; i < newFormObject.actions.length; i++) {
                    Metadata.copyForm(newFormObject.actions[i].next_form_id, _company_code, objectList, null, newFormObject._id);
                }
            }
            if (newFormObject.item_actions) {
                for (var k = 0; k < newFormObject.item_actions.length; k++) {
                    Metadata.copyForm(newFormObject.item_actions[k].next_form_id, _company_code, objectList, null, newFormObject._id);
                }
            }
        });
    });
};
Metadata.copyWorkflow = function(workflowObject, _company_code, application_id, objectList) {
    if (objectList["w_" + workflowObject._id]) return;
    var newWorkflowObject = new Metadata.Workflow(workflowObject);
    newWorkflowObject._id = mongoose.Types.ObjectId();
    newWorkflowObject.isNew = true;
    newWorkflowObject._company_code = _company_code;
    newWorkflowObject.application_id = "" + application_id;
    objectList["w_" + workflowObject._id] = newWorkflowObject._id;
    newWorkflowObject.save().then(function() {
        //console.log("w"+newWorkflowObject._id)
        Metadata.copyForm(newWorkflowObject.startup_form_id, _company_code, objectList, newWorkflowObject._id, null);
    });
};
Metadata.copyApplication = function(appObject, _company_code, objectList) {
    if (objectList["a_" + appObject._id]) return;
    var newAppObject = new Metadata.Application(appObject);
    newAppObject._id = mongoose.Types.ObjectId();
    newAppObject.isNew = true;
    newAppObject._company_code = _company_code;
    objectList["a_" + appObject._id] = newAppObject._id;
    Metadata.Workflow.find({
        _company_code: Metadata.Constants.ProductionCompany,
        application_id: appObject._id
    }, function(err, workflowObjects) {
        for (var j = 0; j < workflowObjects.length; j++) {
            Metadata.copyWorkflow(workflowObjects[j], _company_code, newAppObject._id, objectList);
        }
    });
    newAppObject.save();
};
module.exports = Metadata;
