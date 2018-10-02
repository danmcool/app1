app1.controller('DatamodelEditCtrl', ['$scope', 'SessionService', 'DesignDataModel', '$location', '$routeParams', '$mdDialog', function ($scope, SessionService, DesignDataModel, $location, $routeParams, $mdDialog) {
    $scope.sessionData = SessionService.getSessionData();
    $scope.$watch(function () {
        return SessionService.getSessionData();
    }, function (newValue, oldValue) {
        if (newValue != oldValue) {
            $scope.sessionData = newValue;
        }
    });

    $scope.sessionData.applicationName = $scope.sessionData.appData.datamodel_designer;
    SessionService.setSessionData($scope.sessionData);

    $scope.field_type = {
        text: {
            en: 'Text',
            fr: 'Texte'
        },
        number: {
            en: 'Number',
            fr: 'Nombre'
        },
        boolean: {
            en: 'Boolean',
            fr: 'Boolean'
        },
        date: {
            en: 'Date',
            fr: 'Date'
        },
        period: {
            en: 'Period',
            fr: 'Période'
        },
        currency: {
            en: 'Amount',
            fr: 'Montant'
        },
        reference: {
            en: 'Detail',
            fr: 'Détail'
        },
        item: {
            en: 'Detail List',
            fr: 'Liste de détails'
        },
        feed: {
            en: 'Discussion Feed',
            fr: 'Fil de discussion'
        },
        file: {
            en: 'File',
            fr: 'Fichier'
        },
        address: {
            en: 'Address',
            fr: 'Adresse'
        },
        node: {
            en: 'Node',
            fr: 'Noeud'
        },
        array: {
            en: 'Array',
            fr: 'Tableau'
        }
    }
    var keysOfFieldType = Object.keys($scope.field_type);
    $scope.field_types = [];
    for (i = 0; i < keysOfFieldType.length; i++) {
        $scope.field_type[keysOfFieldType[i]].translated_name = SessionService.translate($scope.field_type[keysOfFieldType[i]]);
        $scope.field_types.push({
            translated_name: $scope.field_type[keysOfFieldType[i]].translated_name,
            type: keysOfFieldType[i]
        });
    }

    $scope.datamodel_keys = [];

    DesignDataModel.get({
        id: $routeParams.id
    }, function (resultDatamodel, err) {
        if (resultDatamodel) {
            $scope.datamodel = resultDatamodel;
            if ($scope.datamodel.projection) {
                var datamodelkeys = Object.keys($scope.datamodel.projection);
                for (var i = 0; i < datamodelkeys.length; i++) {
                    var field = $scope.datamodel.projection[datamodelkeys[i]];
                    field.full_path = (field.path == '' ? field.technical_name : field.path + '.' + field.technical_name);
                    $scope.datamodel_keys.push(field);
                }
            } else {
                $scope.datamodel.projection = {};
            }
        } else {
            $scope.datamodel = {
                projection: {}
            }
        }
        $scope.datamodel_keys.sort(function (a, b) {
            return a.full_path.trim().localeCompare(b.full_path.trim());
        });
    });

    DesignDataModel.query({
        skip: 0,
        limit: 500,
    }, function (datamodels) {
        for (var i = 0; i < datamodels.length; i++) {
            if (datamodels[i].properties) {
                if (datamodels[i].properties.reference == 'userdata') {
                    datamodels[i].corrected_ref = 'User';
                } else if (datamodels[i].properties.reference == 'filedata') {
                    datamodels[i].corrected_ref = 'File';
                } else {
                    datamodels[i].corrected_ref = 'datas' + datamodels[i]._id;
                }
            } else {
                datamodels[i].corrected_ref = 'datas' + datamodels[i]._id;
            }
            datamodels[i].translated_name = SessionService.translate(datamodels[i].name);
        }
        $scope.datamodels = datamodels;
    });

    $scope.editText = function (object, property, multipleLines, id) {
        if (!object[property]) {
            object[property] = {};
        }
        $mdDialog.show({
            templateUrl: 'designer/text.html',
            controller: 'TextCtrl',
            locals: {
                text: object[property],
                multipleLines: multipleLines
            },
            parent: angular.element(document.body),
            clickOutsideToClose: true
        }).then(function (result) {
            object[property] = result;
        });
    };

    $scope.editTextCopy = function (object, property, multipleLines, id) {
        if (!object[property]) {
            object[property] = {};
        }
        $mdDialog.show({
            templateUrl: 'designer/text.html',
            controller: 'TextCtrl',
            locals: {
                text: object[property],
                multipleLines: multipleLines
            },
            parent: angular.element(document.body),
            clickOutsideToClose: true
        }).then(function (result) {
            object[property] = result;
        });
    };

    var computeNewId = function () {
        var newId = Object.keys($scope.datamodel.projection).length;
        do {
            newId = newId + 1;
        } while ($scope.datamodel.projection[newId]);
        return newId;
    }

    $scope.changeFieldRef = function (field) {
        for (var i = 0; i < $scope.datamodels.length; i++) {
            if ($scope.datamodels[i]._id == field.ref_id) {
                field.ref = $scope.datamodels[i].corrected_ref;
                break;
            }
        }
    }

    $scope.newField = function (parent_path, parent_name) {
        $mdDialog.show({
            templateUrl: 'datamodel/new.html',
            controller: 'NewFieldCtrl',
            parent: angular.element(document.body),
            clickOutsideToClose: true
        }).then(function (result) {
            var newId = computeNewId();
            result.path = (parent_path == '' ? parent_name : parent_path + '.' + parent_name);
            result.full_path = (result.path == '' ? result.technical_name : result.path + '.' + result.technical_name);
            $scope.datamodel.projection[newId] = result;
            $scope.datamodel_keys.push($scope.datamodel.projection[newId]);
            if (result.type == 'currency') {
                var newIdAm = computeNewId();
                $scope.datamodel.projection[newIdAm] = {
                    path: result.full_path,
                    type: 'number',
                    technical_name: 'value',
                    full_path: result.full_path + '.value',
                    name: {
                        en: 'Value',
                        fr: 'Montant'
                    }
                }
                $scope.datamodel_keys.push($scope.datamodel.projection[newIdAm]);
                var newIdCu = computeNewId();
                $scope.datamodel.projection[newIdCu] = {
                    path: result.full_path,
                    type: 'text',
                    technical_name: 'currency',
                    full_path: result.full_path + '.currency',
                    name: {
                        en: 'Currency',
                        fr: 'Monnaie'
                    }
                }
                $scope.datamodel_keys.push($scope.datamodel.projection[newIdCu]);
            } else if (result.type == 'period') {
                var newIdSt = computeNewId();
                $scope.datamodel.projection[newIdSt] = {
                    path: result.full_path,
                    type: 'date',
                    technical_name: 'start_time',
                    full_path: result.full_path + '.start_time',
                    name: {
                        en: 'Start Time',
                        fr: 'Heure de debut'
                    }
                }
                $scope.datamodel_keys.push($scope.datamodel.projection[newIdSt]);
                var newIdEn = computeNewId();
                $scope.datamodel.projection[newIdEn] = {
                    path: result.full_path,
                    type: 'date',
                    technical_name: 'end_time',
                    full_path: result.full_path + '.end_time',
                    name: {
                        en: 'End Time',
                        fr: 'Heure de fin'
                    }
                }
                $scope.datamodel_keys.push($scope.datamodel.projection[newIdEn]);
            } else if (result.type == 'address') {
                var newIdL1 = computeNewId();
                $scope.datamodel.projection[newIdL1] = {
                    path: result.full_path,
                    type: 'text',
                    technical_name: 'address_line1',
                    full_path: result.full_path + '.address_line1',
                    name: {
                        en: 'Address Line 1',
                        fr: 'Adresse ligne 1'
                    }
                }
                $scope.datamodel_keys.push($scope.datamodel.projection[newIdL1]);
                var newIdL2 = computeNewId();
                $scope.datamodel.projection[newIdL2] = {
                    path: result.full_path,
                    type: 'text',
                    technical_name: 'address_line2',
                    full_path: result.full_path + '.address_line2',
                    name: {
                        en: 'Address Line 2',
                        fr: 'Adresse ligne 2'
                    }
                }
                $scope.datamodel_keys.push($scope.datamodel.projection[newIdL2]);
                var newIdCty = computeNewId();
                $scope.datamodel.projection[newIdCty] = {
                    path: result.full_path,
                    type: 'text',
                    technical_name: 'address_city',
                    full_path: result.full_path + '.address_city',
                    name: {
                        en: 'City',
                        fr: 'Ville'
                    }
                }
                $scope.datamodel_keys.push($scope.datamodel.projection[newIdCty]);
                var newIdSta = computeNewId();
                $scope.datamodel.projection[newIdSta] = {
                    path: result.full_path,
                    type: 'text',
                    technical_name: 'address_state',
                    full_path: result.full_path + '.address_state',
                    name: {
                        en: 'State',
                        fr: 'Region'
                    }
                }
                $scope.datamodel_keys.push($scope.datamodel.projection[newIdSta]);
                var newIdPos = computeNewId();
                $scope.datamodel.projection[newIdPos] = {
                    path: result.full_path,
                    type: 'text',
                    technical_name: 'address_postal_code',
                    full_path: result.full_path + '.address_postal_code',
                    name: {
                        en: 'Postal Code',
                        fr: 'Code Postal'
                    }
                }
                $scope.datamodel_keys.push($scope.datamodel.projection[newIdPos]);
                var newIdCou = computeNewId();
                $scope.datamodel.projection[newIdCou] = {
                    path: result.full_path,
                    type: 'text',
                    technical_name: 'address_country',
                    full_path: result.full_path + '.address_country',
                    name: {
                        en: 'Country',
                        fr: 'Pays'
                    }
                }
                $scope.datamodel_keys.push($scope.datamodel.projection[newIdCou]);
            }
            $scope.datamodel_keys.sort(function (a, b) {
                return a.full_path.trim().localeCompare(b.full_path.trim());
            });
        });
    }

    $scope.deleteField = function (full_path) {
        for (var i = $scope.datamodel_keys.length - 1; i >= 0; i--) {
            if ($scope.datamodel_keys[i].full_path.indexOf(full_path)) {
                $scope.datamodel_keys.splice(i, 1);
            }
        }
        var datamodelkeys = Object.keys($scope.datamodel.projection);
        for (var i = 0; i < datamodelkeys.length; i++) {
            if ($scope.datamodel.projection[datamodelkeys[i]].full_path.indexOf(full_path)) {
                delete $scope.datamodel.projection[datamodelkeys[i]];
            }
        }
    }

    $scope.save = function () {
        DesignDataModel.update({
            id: $scope.datamodel._id
        }, $scope.datamodel, function (res) {
            SessionService.location('/datamodel/');
        }, function (res) {
            $scope.datamodel = res.datamodel;
            updateErrorAlert();
        });
    }
}]);
