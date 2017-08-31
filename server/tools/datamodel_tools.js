var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var DatamodelTools = {};

var newId = function (projection) {
    var keysOfIdList = Object.keys(projection);
    var newId = keysOfIdList.length;
    do {
        newId = newId + 1;
    } while (projection[newId]);
    return newId;
}

var resolvePathObject = function (object, path) {
    if (path == '') return object;
    path.split('.').reduce(function (previous, current, index, array) {
        if (index < array.length - 1) {
            if (!previous) {
                previous = {};
            }
            if (!previous[current]) {
                previous[current] = {};
            }
        } else {
            return previous[current];
        }
    }, object);
}

DatamodelTools.buildDataModel = function (projection) {
    var datamodel = {};
    if (!projection) {
        return datamodel;
    }
    var datamodelkeys = Object.keys(projection);
    var addedUpdated = false;
    var addedUser = false;
    for (var i = 0; i < datamodelkeys.length; i++) {
        var projectionItem = projection[datamodelkeys[i]];
        var currentField = resolvePathObject(datamodel, projectionItem.path);
        if (projectionItem.type == 'text') {
            currentField[projectionItem.technical_name] = 'String';
        } else if (projectionItem.type == 'number') {
            currentField[projectionItem.technical_name] = 'Number';
        } else if (projectionItem.type == 'boolean') {
            currentField[projectionItem.technical_name] = 'Boolean';
        } else if (projectionItem.type == 'date') {
            currentField[projectionItem.technical_name] = 'Date';
        } else if (projectionItem.type == 'currency') {
            currentField[projectionItem.technical_name] = {
                value: 'Number',
                currency: 'String'
            };
        } else if (projectionItem.type == 'feed') {
            currentField[projectionItem.technical_name] = [{
                from: 'String',
                date: 'Date',
                text: 'String'
                }];
        } else if (projectionItem.type == 'address') {
            currentField[projectionItem.technical_name] = {
                address_line1: 'String',
                address_line2: 'String',
                address_city: 'String',
                address_state: 'String',
                address_postal_code: 'String',
                address_country: 'String'
            };
        } else if (projectionItem.type == 'node') {
            currentField[projectionItem.technical_name] = {};
        } else if (projectionItem.type == 'file') {
            currentField[projectionItem.technical_name] = [{
                type: Schema.Types.ObjectId,
                ref: 'File'
                }];
        } else if (projectionItem.type == 'item') {
            currentField[projectionItem.technical_name] = [{
                type: Schema.Types.ObjectId,
                ref: projectionItem.ref
                }];
        } else {
            console.log('Type error for datamodel');
        }

        if (projectionItem.path == '' && projectionItem.technical_name == '_updated_at') {
            addedUpdated = true;
            projectionItem.type = 'Date';
        }
        if (projectionItem.path == '' && projectionItem.technical_name == '_user') {
            addedUser = true;
            projectionItem.type = {
                type: Schema.Types.ObjectId,
                ref: 'User'
            };
        }
    }
    datamodel._updated_at = 'Date';
    datamodel._company_code = 'String';
    datamodel._user = 'String';

    if (!addedUpdated) {
        projection[newId(projection)] = {
            path: '',
            technical_name: '_updated_at',
            type: 'Date',
            name: {
                en: 'Updated at',
                fr: 'Mis a jour à'
            }
        };
    }

    if (!addedUser) {
        projection[newId(projection)] = {
            path: '',
            technical_name: '_user',
            type: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            },
            name: {
                en: 'User',
                fr: 'Utilisateur'
            }
        };
    }

    return datamodel;
}

module.exports = DatamodelTools;