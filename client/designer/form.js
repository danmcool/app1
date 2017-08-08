app1.controller('FormEditCtrl', ['$scope', '$resource', '$location', '$routeParams', '$mdDialog', 'SessionService', 'DesignForm', 'DesignDataModel', 'DesignValue', function ($scope, $resource, $location, $routeParams, $mdDialog, SessionService, DesignForm, DesignDataModel, DesignValue) {
    var swap = function (arr, i, j) {
        var tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }

    $scope.sessionData = SessionService.getSessionData();
    $scope.$watch(function () {
        return SessionService.getSessionData();
    }, function (newValue, oldValue) {
        if (newValue != oldValue) {
            $scope.sessionData = newValue;
        }
    });

    DesignForm.get({
        id: $routeParams.id
    }, function (resultForm, err) {
        //for (var i = 0; i < resultForm.actions.length; i++) {
        //    resultForm.actions[i].translated_name = SessionService.translate(resultForm.actions[i].name);
        //    resultForm.actions[i].translated_description = SessionService.translate(resultForm.actions[i].description);
        //}
        $scope.form = resultForm;
        if ($scope.form.actions) {
            for (var i = 0; i < $scope.form.actions.length; i++) {
                $scope.form.actions[i].translated_name = SessionService.translate($scope.form.actions[i].name);
            }
        }
        if ($scope.form.values) {
            for (var i = 0; i < $scope.form.values.length; i++) {
                $scope.form.values[i].translated_name = SessionService.translate($scope.form.values[i].name);
            }
        }
        if ($scope.form.display) {
            for (var i = 0; i < $scope.form.display.length; i++) {
                for (var j = 0; j < $scope.form.display[i].blocks.length; j++) {
                    for (var k = 0; k < $scope.form.display[i].blocks[j].fields.length; k++) {
                        if ($scope.form.display[i].blocks[j].fields[k].text) {
                            $scope.form.display[i].blocks[j].fields[k].translated_name = SessionService.translate($scope.form.display[i].blocks[j].fields[k].text);
                        } else {
                            $scope.form.display[i].blocks[j].fields[k].translated_name = SessionService.translate($scope.form.datamodel.translation[$scope.form.display[i].blocks[j].fields[k].name])
                        }
                    }
                }
            }
        }
        $scope.sessionData.applicationName = $scope.sessionData.appData.app_designer;
        SessionService.setSessionData($scope.sessionData);
    });

    DesignDataModel.query(function (datamodels) {
        for (var i = 0; i < datamodels.length; i++) {
            datamodels[i].translated_name = SessionService.translate(datamodels[i].name);
        }
        $scope.datamodels = datamodels;
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

    var saveFormForward = function (url) {
        DesignForm.update({
            id: $scope.form._id
        }, $scope.form).$promise.then(function (res) {
            SessionService.location(url);
        }).catch(function (res) {
            updateErrorAlert();
        });
    }

    $scope.editField = function (section, block, field) {
        saveFormForward('/form_display_edit/' + $scope.form._id + '?section=' + section + '&block=' + block + '&field=' + field + '&application_id=' + $routeParams.application_id + '&workflow_id=' + $routeParams.workflow_id);
    };

    $scope.deleteField = function (section, block, field) {
        if ($scope.form.display[section].blocks[block].fields.length > 0) {
            $scope.form.display[section].blocks[block].fields.splice(field, 1);
        }
        if ($scope.form.display[section].blocks[block].fields.length == 0) {
            $scope.form.display[section].blocks.splice(block, 1);
        }
        if ($scope.form.display[section].blocks.length == 0) {
            $scope.form.display.splice(section, 1);
        }
    };

    $scope.editAction = function (action) {
        saveFormForward('/form_action_edit/' + $scope.form._id + '?action=' + action + '&application_id=' + $routeParams.application_id + '&workflow_id=' + $routeParams.workflow_id);
    };

    $scope.deleteAction = function (action) {
        $scope.form.actions.splice(action, 1);
    }

    $scope.editValue = function (value) {
        saveFormForward('/form_value_edit/' + value._id + '?datamodel_id=' + $scope.form.datamodel._id + '&application_id=' + $routeParams.application_id + '&workflow_id=' + $routeParams.workflow_id + '&form_id=' + $scope.form._id);
    };

    $scope.deleteValue = function (value) {
        $scope.form.values.splice(value, 1);
    }

    $scope.newAction = function () {
        $mdDialog.show(
            $mdDialog.prompt()
            .parent(angular.element(document.body))
            .clickOutsideToClose(true)
            .title($scope.sessionData.appData.new_action)
            .initialValue('My Action')
            .ok($scope.sessionData.appData.ok)
            .cancel($scope.sessionData.appData.cancel)
        ).then(function (result) {
            if (!$scope.form.actions) {
                $scope.form.actions = [];
            }
            var name = {};
            name[$scope.sessionData.userData.properties.language] = result;
            $scope.form.actions.push({
                name: name,
                translated_name: result
            });
            saveFormForward('/form_action_edit/' + $scope.form._id + '?action=' + ($scope.form.actions.length - 1) + '&application_id=' + $routeParams.application_id + '&workflow_id=' + $routeParams.workflow_id);
        });
    };

    $scope.newValue = function () {
        $mdDialog.show(
            $mdDialog.prompt()
            .parent(angular.element(document.body))
            .clickOutsideToClose(true)
            .title($scope.sessionData.appData.new_value)
            .initialValue('My Value')
            .ok($scope.sessionData.appData.ok)
            .cancel($scope.sessionData.appData.cancel)
        ).then(function (result) {
            var name = {};
            name[$scope.sessionData.userData.properties.language] = result;
            var newValue = new DesignValue({
                name: name
            });
            newValue.$save(function () {
                if (!$scope.form.values) {
                    $scope.form.values = [];
                }
                $scope.form.values.push({
                    name: name,
                    _id: newValue._id
                });
                saveFormForward('/form_value_edit/' + newValue._id + '?datamodel_id=' + $scope.form.datamodel._id + '&application_id=' + $routeParams.application_id + '&workflow_id=' + $routeParams.workflow_id + '&form_id=' + $scope.form._id);
            });
        });
    };

    $scope.newSection = function () {
        $mdDialog.show(
            $mdDialog.prompt()
            .parent(angular.element(document.body))
            .clickOutsideToClose(true)
            .title($scope.sessionData.appData.new_field)
            .textContent($scope.sessionData.appData.new_field_name)
            .initialValue('New Field')
            .ok($scope.sessionData.appData.ok)
            .cancel($scope.sessionData.appData.cancel)
        ).then(function (result) {
            if (!$scope.form.display) {
                $scope.form.display = [];
            }
            var text = {};
            text[$scope.sessionData.userData.properties.language] = result;
            $scope.form.display.push({
                blocks: [{
                    fields: [{
                        text: text,
                        translated_name: result
                    }]
                }]
            });
        });
    };

    $scope.newBlock = function (blocks) {
        $mdDialog.show(
            $mdDialog.prompt()
            .parent(angular.element(document.body))
            .clickOutsideToClose(true)
            .title($scope.sessionData.appData.new_field)
            .textContent($scope.sessionData.appData.new_field_name)
            .initialValue('New Field')
            .ok($scope.sessionData.appData.ok)
            .cancel($scope.sessionData.appData.cancel)
        ).then(function (result) {
            if (!$scope.form.display) {
                $scope.form.display = [];
            }
            var text = {};
            text[$scope.sessionData.userData.properties.language] = result;
            blocks.push({
                fields: [{
                    text: text,
                    translated_name: result
                }]
            });
        });
    };

    $scope.newField = function (fields) {
        $mdDialog.show(
            $mdDialog.prompt()
            .parent(angular.element(document.body))
            .clickOutsideToClose(true)
            .title($scope.sessionData.appData.new_field)
            .textContent($scope.sessionData.appData.new_field_name)
            .initialValue('New Field')
            .ok($scope.sessionData.appData.ok)
            .cancel($scope.sessionData.appData.cancel)
        ).then(function (result) {
            if (!$scope.form.display) {
                $scope.form.display = [];
            }
            var text = {};
            text[$scope.sessionData.userData.properties.language] = result;
            fields.push({
                text: text,
                translated_name: result
            });
        });
    }

    $scope.save = function () {
        saveFormForward('/workflow_edit/' + $routeParams.workflow_id + '?application_id=' + $routeParams.application_id);
    }

    $scope.onDragEnter = function (event) {
        element.classList.add('dash_line');
    }

    function onDragLeave(event) {
        element.classList.remove('dash_line'); // this / e.target is previous target element.
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
