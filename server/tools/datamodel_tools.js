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
    if (!path) return object;
    if (path == '') return object;
    return path.split('.').reduce(function (previous, current, index, array) {
        if (!previous[current]) {
            previous[current] = {};
        }
        return previous[current];
    }, object);
}

DatamodelTools.buildDataModel = function (projection, index) {
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

        if (projectionItem.index) {
            var fullPath = (projectionItem.path == '' ? projectionItem.technical_name : projectionItem.path + '.' + projectionItem.technical_name);
            index.fields[fullPath] = 'text';
            index.options.weights[fullPath] = projectionItem.index_weight;
        }

        if (projectionItem.path == '' && projectionItem.technical_name == '_updated_at') {
            addedUpdated = true;
            projectionItem.full_path = '_updated_at';
            projectionItem.type = 'date';
            continue;
        }
        if (projectionItem.path == '' && projectionItem.technical_name == '_user') {
            addedUser = true;
            projectionItem.full_path = '_user';
            projectionItem.type = 'reference';
            projectionItem.ref = 'User';
            continue;
        }

        if (projectionItem.type == 'text') {
            currentField[projectionItem.technical_name] = 'String';
        } else if (projectionItem.type == 'number') {
            currentField[projectionItem.technical_name] = 'Number';
        } else if (projectionItem.type == 'boolean') {
            currentField[projectionItem.technical_name] = 'Boolean';
        } else if (projectionItem.type == 'date') {
            currentField[projectionItem.technical_name] = 'Date';
        } else if (projectionItem.type == 'feed') {
            currentField[projectionItem.technical_name] = [{
                from: 'String',
                user: 'String',
                date: 'Date',
                text: 'String'
            }];
        } else if (projectionItem.type == 'address' || projectionItem.type == 'node' || projectionItem.type == 'currency' || projectionItem.type == 'period') {
            currentField[projectionItem.technical_name] = {};
        } else if (projectionItem.type == 'file') {
            currentField[projectionItem.technical_name] = [{
                type: Schema.Types.ObjectId,
                ref: 'File'
            }];
        } else if (projectionItem.type == 'reference') {
            currentField[projectionItem.technical_name] = {
                type: Schema.Types.ObjectId,
                ref: projectionItem.ref
            }
        } else if (projectionItem.type == 'item') {
            currentField[projectionItem.technical_name] = [{
                type: Schema.Types.ObjectId,
                ref: projectionItem.ref
            }];
        } else {
            //console.log('Type error for datamodel - ' + projectionItem.type);
        }
    }
    datamodel._updated_at = 'Date';
    datamodel._company_code = 'String';
    datamodel._user = {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
    datamodel._appointments = Schema.Types.Mixed;
    datamodel._appointment_properties = Schema.Types.Mixed;

    if (!addedUpdated) {
        projection[newId(projection)] = {
            path: '',
            full_path: '_updated_at',
            technical_name: '_updated_at',
            type: 'date',
            name: {
                en: 'Updated at',
                fr: 'Mis a jour à'
            }
        }
    }
    if (!addedUser) {
        projection[newId(projection)] = {
            path: '',
            full_path: '_user',
            technical_name: '_user',
            type: 'reference',
            ref: 'User',
            ref_id: '598c86b68b7cf00974e761fe',
            name: {
                en: 'User',
                fr: 'Utilisateur'
            }
        }
    }

    return datamodel;
}

module.exports = DatamodelTools;
