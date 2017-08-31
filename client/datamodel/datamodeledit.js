app1.controller('DatamodelEditCtrl', ['$scope', 'SessionService', 'DesignDataModel', '$location', '$routeParams', '$mdDialog', function ($scope, SessionService, DesignDataModel, $location, $routeParams, $mdDialog) {
    $scope.sessionData = SessionService.getSessionData();
    $scope.$watch(function () {
        return SessionService.getSessionData();
    }, function (newValue, oldValue) {
        if (newValue != oldValue) {
            $scope.sessionData = newValue;
        }
    });
    $scope.resolvePathObject = function (object, path) {
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
        currency: {
            en: 'Amount',
            fr: 'Montant'
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
        }
    }
    var keysOfFieldType = Object.keys($scope.field_type);
    $scope.field_types = [];
    for (i = 0; i < keysOfFieldType.length; i++) {
        $scope.field_types.push({
            translated_name: SessionService.translate($scope.field_type[keysOfFieldType[i]]),
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
                    $scope.datamodel_keys.push({
                        path: $scope.datamodel.projection[datamodelkeys[i]].path,
                        technical_name: $scope.datamodel.projection[datamodelkeys[i]].path,
                        type: $scope.datamodel.projection[datamodelkeys[i]].type,
                        translated_name: SessionService.translate($scope.datamodel.projection[datamodelkeys[i]].name),
                        id: datamodelkeys[i]
                    });
                }
            } else {
                $scope.datamodel.projection = {};
            }
        } else {
            $scope.datamodel = {
                projection: {}
            };
        }
        $scope.datamodel_keys.sort(function (a, b) {
            if (a.path.trim().localeCompare(b.path.trim()) == 0) return a.technical_name.trim().localeCompare(b.technical_name.trim());
            return a.path.trim().localeCompare(b.path.trim());
        });
        $scope.sessionData.applicationName = $scope.sessionData.appData.app_designer;
        SessionService.setSessionData($scope.sessionData);
    });

    $scope.editText = function (object, property, multipleLines) {
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

    $scope.editForm = function (formId) {
        DesignWorkflow.update({
            id: $scope.workflow._id
        }, $scope.workflow).$promise.then(function (res) {
            SessionService.init();
            SessionService.location('/form_edit/' + formId + '?application_id=' + $routeParams.application_id + '&workflow_id=' + $scope.workflow._id);
        }).catch(function (res) {
            $scope.application = res.application;
            updateErrorAlert();
        });
    }

    $scope.newField = function (path) {
        $mdDialog.show({
            templateUrl: 'datamodel/new.html',
            controller: 'NewFieldCtrl',
            locals: {
                field_types: $scope.field_types
            },
            parent: angular.element(document.body),
            clickOutsideToClose: true
        }).then(function (result) {
            var keysOfIdList = Object.keys($scope.datamodel.projection);
            var newId = keysOfIdList.length;
            do {
                newId = newId + 1;
            } while ($scope.datamodel.projection[newId]);
            result.path = path;
            $scope.datamodel.projection[newId] = result;
            $scope.datamodel_keys.push({
                path: result.path,
                technical_name: result.technical_name,
                type: result.type,
                translated_name: '',
                id: newId
            });
            $scope.datamodel_keys.sort(function (a, b) {
                if (a.path.trim().localeCompare(b.path.trim()) == 0) return a.technical_name.trim().localeCompare(b.technical_name.trim());
                return a.path.trim().localeCompare(b.path.trim());
            });
        });
    }

    $scope.save = function () {
        $scope.datamodel.datamodel = '' + $scope.datamodel.datamodel;
        DesignDataModel.update({
            id: $scope.datamodel._id
        }, $scope.datamodel).$promise.then(function (res) {
            SessionService.location('/datamodel/');
        }).catch(function (res) {
            $scope.datamodel = res.datamodel;
            updateErrorAlert();
        });
    }
}]);
