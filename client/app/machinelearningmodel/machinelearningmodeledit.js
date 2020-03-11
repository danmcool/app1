app1.controller('MachineLearningModelEditCtrl', ['$scope', 'SessionService', 'DesignMachineLearningModel', 'TrainMachineLearningModel', '$location', '$routeParams', '$mdDialog', function ($scope, SessionService, DesignMachineLearningModel, TrainMachineLearningModel, $location, $routeParams, $mdDialog) {
    $scope.sessionData = SessionService.getSessionData();
    $scope.$watch(function () {
        return SessionService.getSessionData();
    }, function (newValue, oldValue) {
        if (newValue != oldValue) {
            $scope.sessionData = newValue;
        }
    });

    $scope.sessionData.applicationName = $scope.sessionData.appData.machinelearningmodel_designer;
    SessionService.setSessionData($scope.sessionData);

    $scope.datamodel_keys_input = [{
        full_path: '',
        translated_name: $scope.sessionData.appData.machinelearningmodel_new_calculation,
        type: '',
        id: null
    }];
    $scope.datamodel_keys_output = [{
        full_path: '',
        translated_name: $scope.sessionData.appData.machinelearningmodel_new_calculation,
        type: '',
        id: null
    }];

    DesignMachineLearningModel.get({
        id: $routeParams.id
    }, function (resultMachineLearningModel, err) {
        if (resultMachineLearningModel) {
            $scope.machinelearningmodel = resultMachineLearningModel;
            $scope.datamodel = resultMachineLearningModel.datamodel;
            var projection = $scope.datamodel.projection;
            if (projection) {
                var datamodelKeys = Object.keys(projection);
                for (var i = 0; i < datamodelKeys.length; i++) {
                    if (projection[datamodelKeys[i]].type == 'boolean' || projection[datamodelKeys[i]].type == 'number') {
                        $scope.datamodel_keys_input.push({
                            full_path: projection[datamodelKeys[i]].full_path,
                            translated_name: SessionService.translate(projection[datamodelKeys[i]].name),
                            type: projection[datamodelKeys[i]].type,
                            id: datamodelKeys[i]
                        });
                    }
                    $scope.datamodel_keys_output.push({
                        full_path: projection[datamodelKeys[i]].full_path,
                        translated_name: SessionService.translate(projection[datamodelKeys[i]].name),
                        type: projection[datamodelKeys[i]].type,
                        id: datamodelKeys[i]
                    });
                }
            }
        }
        $scope.datamodel_keys_input.sort(function (a, b) {
            return a.full_path.trim().localeCompare(b.full_path.trim());
        });
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

    $scope.newInputField = function () {
        $mdDialog.show({
            templateUrl: 'machinelearningmodel/newInput.html',
            controller: 'NewInputFieldCtrl',
            locals: {
                datamodel_keys: $scope.datamodel_keys_input
            },
            parent: angular.element(document.body),
            clickOutsideToClose: true
        }).then(function (result) {
            if (result.type == 'number') {
                $scope.machinelearningmodel.input.push({
                    formula: '(1/data.' + result.full_path + ')'
                });
            } else if (result.type == 'boolean') {
                $scope.machinelearningmodel.input.push({
                    formula: '(data.' + result.full_path + '?1:0)'
                });
            } else {
                $scope.machinelearningmodel.input.push({
                    formula: ''
                });
            }
        });
    }

    $scope.newOutputField = function () {
        $mdDialog.show({
            templateUrl: 'machinelearningmodel/newOutput.html',
            controller: 'NewOutputFieldCtrl',
            locals: {
                datamodel_keys: $scope.datamodel_keys_output
            },
            parent: angular.element(document.body),
            clickOutsideToClose: true
        }).then(function (result) {
            if (result.id == null || result.values == null) {
                $scope.machinelearningmodel.output.push({
                    formula: ''
                });
            } else {
                var valueList = result.values.split(';');
                var formula = '(';
                for (var i = 0; i < valueList.length; i++) {
                    formula = formula + 'data.' + result.full_path + '==' + valueList[i];
                    if (i < valueList.length - 1) formula = formula + '||';
                }
                formula = formula + '?1:0)';
                $scope.machinelearningmodel.output.push({
                    formula: formula
                });
            }
        });
    }

    $scope.deleteInputField = function (index) {
        $scope.machinelearningmodel.input.splice(index, 1);
    }

    $scope.deleteOutputField = function (index) {
        $scope.machinelearningmodel.output.splice(index, 1);
    }

    $scope.run = function () {
        TrainMachineLearningModel.get({
            mlmodel_id: $scope.machinelearningmodel._id,
            datamodel_id: $scope.machinelearningmodel.datamodel._id
        }, function (resultTrainMachineLearningModel) {
            SessionService.location('/machinelearningmodel/');
        });
    }

    $scope.save = function () {
        DesignMachineLearningModel.update({
            id: $scope.machinelearningmodel._id
        }, $scope.machinelearningmodel, function (res) {
            SessionService.location('/machinelearningmodel/');
        }, function (res) {
            $scope.machinelearningmodel = res.machinelearningmodel;
            updateErrorAlert();
        });
    }
}]);
