app1.controller('FormValueEditCtrl', ['$scope', '$routeParams', '$mdDialog', 'SessionService', 'DesignValue', 'DesignDataModel', function ($scope, $routeParams, $mdDialog, SessionService, DesignValue, DesignDataModel) {
    $scope.sessionData = SessionService.getSessionData();
    $scope.$watch(function () {
        return SessionService.getSessionData();
    }, function (newValue, oldValue) {
        if (newValue != oldValue) {
            $scope.sessionData = newValue;
        }
    });

    $scope.value_type = {
        list: {
            en: 'List',
            fr: 'Liste'
        },
        user: {
            en: 'User',
            fr: 'Utilisateur'
        },
        query: {
            en: 'Query',
            fr: 'Requette'
        }
    }

    $scope.value_relation_user_type = {
        user_manager: {
            en: 'Manager',
            fr: 'Manager'
        },
        user_reports: {
            en: 'Colleague',
            fr: 'Collaborateur'
        },
        user_list: {
            en: 'User list',
            fr: 'Liste utilisateurs'
        }
    }

    var keysOfActionType = Object.keys($scope.value_type);
    $scope.value_types = [];
    for (i = 0; i < keysOfActionType.length; i++) {
        $scope.value_types.push({
            translated_name: SessionService.translate($scope.value_type[keysOfActionType[i]]),
            type: keysOfActionType[i]
        });
    }

    var keysOfValueUserRelationType = Object.keys($scope.value_relation_user_type);
    $scope.value_relation_user_types = [];
    for (i = 0; i < keysOfValueUserRelationType.length; i++) {
        $scope.value_relation_user_types.push({
            translated_name: SessionService.translate($scope.value_relation_user_type[keysOfValueUserRelationType[i]]),
            type: keysOfValueUserRelationType[i]
        });
    }

    DesignValue.get({
        id: $routeParams.id
    }, function (resultForm, err) {
        $scope.value = resultForm;
        if (!$scope.value.values) {
            $scope.value.values = {};
        }
        $scope.sessionData.applicationName = $scope.sessionData.appData.app_designer;
        SessionService.setSessionData($scope.sessionData);
    })

    DesignDataModel.get({
        id: $routeParams.datamodel_id
    }, function (resultDataModel, err) {
        $scope.datamodel = resultDataModel;
        $scope.datamodel_keys = [];
        var datamodelkeys = Object.keys(resultDataModel.translation);
        for (var i = 0; i < datamodelkeys.length; i++) {
            $scope.datamodel_keys.push({
                translated_name: SessionService.translate(resultDataModel.translation[datamodelkeys[i]]),
                id: datamodelkeys[i]
            });
        }
    });

    $scope.editText = function (object, property, multipleLines) {
        if (!object[property]) object[property] = {};
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
    }

    $scope.addValue = function () {
        $scope.value.values.push({
            _id: $scope.value.values.length
        });
    }

    $scope.deleteValue = function (index) {
        $scope.value.values.splice(index, 1);
    }

    $scope.save = function () {
        DesignValue.update({
            id: $routeParams.id
        }, $scope.value).$promise.then(function (res) {
            SessionService.location('/form_edit/' + $routeParams.form_id + '?application_id=' + $routeParams.application_id + '&workflow_id=' + $routeParams.workflow_id);
        }).catch(function (res) {
            updateErrorAlert();
        });
    }

    $scope.toggleInFormula = function (item) {
        var idx = $scope.action.formula.indexOf(item.id);
        if (idx > -1) {
            $scope.action.formula.splice(idx, 1);
        } else {
            $scope.action.formula.push(item.id);
        }
    }

    $scope.existsInFormula = function (item) {
        return $scope.action.formula.indexOf(item.id) > -1;
    }

    var updateErrorAlert = function () {
        $mdDialog.show(
            $mdDialog.alert()
            .parent(angular.element(document.body))
            .clickOutsideToClose(true)
            .title($scope.sessionData.appData.new_document_version)
            .textContent($scope.sessionData.appData.already_modified_document)
            .ok($scope.sessionData.appData.ok)
        );
    }
}]);
