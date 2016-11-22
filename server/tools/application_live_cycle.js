var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var ApplicationLiveCycle = {};
var Metadata = require('../models/metadata.js');
var Constants = require('../tools/constants.js');

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
ApplicationLiveCycle.copyDataModel = function(currentDataModelId, _company_code, objectList, newFormId) {
    if (objectList["d_" + currentDataModelId]) {
        replaceFormDataModel(newFormId, currentDataModelId, objectList["d_" + currentDataModelId]);
        return;
    }
    Metadata.DataModel.findOne({
        _company_code: Constants.ProductionCompany,
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
            Metadata.Objects[newDataModelObject._id].model = mongoose.model('data' + newDataModelObject._id, modelSchema);
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
ApplicationLiveCycle.copyValues = function(currentValueId, _company_code, objectList, newFormId) {
    if (objectList["v_" + currentValueId]) {
        replaceFormValues(newFormId, currentValueId, objectList["v_" + currentValueId]);
        return;
    }
    Metadata.Value.findOne({
        _company_code: Constants.ProductionCompany,
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
ApplicationLiveCycle.copyForm = function(currentFormId, _company_code, objectList, newWorkflowId, parentNewFormId) {
    if (currentFormId == Constants.ApplicationHome) return;
    if (objectList["f_" + currentFormId]) {
        replaceFormPredecessor(newWorkflowId, parentNewFormId, currentFormId, objectList["f_" + currentFormId]);
        return;
    }
    Metadata.Form.findOne({
        _company_code: Constants.ProductionCompany,
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
            ApplicationLiveCycle.copyDataModel(newFormObject.datamodel_id, _company_code, objectList, newFormObject._id);
            if (newFormObject.display) {
                for (var j = 0; j < newFormObject.display.length; j++) {
                    if (newFormObject.display[j].listofvalues) {
                        ApplicationLiveCycle.copyValues(newFormObject.display[j].listofvalues, _company_code, objectList, newFormObject._id);
                    }
                }
            }
            if (newFormObject.actions) {
                for (var i = 0; i < newFormObject.actions.length; i++) {
                    ApplicationLiveCycle.copyForm(newFormObject.actions[i].next_form_id, _company_code, objectList, null, newFormObject._id);
                }
            }
            if (newFormObject.item_actions) {
                for (var k = 0; k < newFormObject.item_actions.length; k++) {
                    ApplicationLiveCycle.copyForm(newFormObject.item_actions[k].next_form_id, _company_code, objectList, null, newFormObject._id);
                }
            }
        });
    });
};
ApplicationLiveCycle.copyWorkflow = function(workflowObject, _company_code, application_id, objectList) {
    if (objectList["w_" + workflowObject._id]) return;
    var newWorkflowObject = new Metadata.Workflow(workflowObject);
    newWorkflowObject._id = mongoose.Types.ObjectId();
    newWorkflowObject.isNew = true;
    newWorkflowObject._company_code = _company_code;
    newWorkflowObject.application_id = "" + application_id;
    objectList["w_" + workflowObject._id] = newWorkflowObject._id;
    newWorkflowObject.save().then(function() {
        //console.log("w"+newWorkflowObject._id)
        ApplicationLiveCycle.copyForm(newWorkflowObject.startup_form_id, _company_code, objectList, newWorkflowObject._id, null);
    });
};
ApplicationLiveCycle.copyApplication = function(appObject, _company_code, objectList) {
    if (objectList["a_" + appObject._id]) return;
    var newAppObject = new Metadata.Application(appObject);
    newAppObject._id = mongoose.Types.ObjectId();
    newAppObject.isNew = true;
    newAppObject._company_code = _company_code;
    objectList["a_" + appObject._id] = newAppObject._id;
    Metadata.Workflow.find({
        _company_code: Constants.ProductionCompany,
        application_id: appObject._id
    }, function(err, workflowObjects) {
        for (var j = 0; j < workflowObjects.length; j++) {
            ApplicationLiveCycle.copyWorkflow(workflowObjects[j], _company_code, newAppObject._id, objectList);
        }
    });
    newAppObject.save();
};
module.exports = ApplicationLiveCycle;
