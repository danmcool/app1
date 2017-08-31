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
                        translated_name: SessionService.translate($scope.datamodel.projection[datamodelkeys[i]]),
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

    $scope.newField = function () {
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
            result.path = '';
            $scope.datamodel.projection[newId] = result;
            var dmObject = $scope.resolvePathObject($scope.datamodel.datamodel, result.path);
            if (result.type == 'text') {
                dmObject[result.technical_name] = 'String';
            } else if (result.type == 'number') {
                dmObject[result.technical_name] = 'Number';
            } else if (result.type == 'boolean') {
                dmObject[result.technical_name] = 'Boolean';
            } else if (result.type == 'date') {
                dmObject[result.technical_name] = 'Date';
            } else if (result.type == 'currency') {
                dmObject[result.technical_name] = {
                    value: 'Number',
                    currency: 'String'
                };
            } else if (result.type == 'feed') {
                dmObject[result.technical_name] = [{
                    from: 'String',
                    date: 'Date',
                    text: 'String'
                }];
            } else if (result.type == 'text') {} else if (result.type == 'text') {} else if (result.type == 'text') {} else if (result.type == 'text') {} else if (result.type == 'text') {}

            var datamodelkeys = Object.keys($scope.datamodel.projection);
            for (var i = 0; i < datamodelkeys.length; i++) {
                $scope.datamodel_keys.push({
                    translated_name: SessionService.translate($scope.datamodel.projection[datamodelkeys[i]]),
                    id: datamodelkeys[i]
                });
            }
        });
    }

    $scope.save = function () {
        DesignDataModel.update({
            id: $scope.datamodel._id
        }, $scope.datamodel).$promise.then(function (res) {
            SessionService.location('/datamodel_edit/');
        }).catch(function (res) {
            $scope.datamodel = res.datamodel;
            updateErrorAlert();
        });
    }
}]);
