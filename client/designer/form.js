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

    $scope.field_id_list = {};
    var computeNewId = function () {
        var keysOfIdList = Object.keys($scope.field_id_list);
        var newId = keysOfIdList.length;
        do {
            newId = newId + 1;
        } while ($scope.field_id_list[newId]);
        $scope.field_id_list[newId] = true;
        return newId;
    }

    DesignForm.get({
        id: $routeParams.id
    }, function (resultForm, err) {
        $scope.form = resultForm;
        if ($scope.form.actions) {
            for (var i = 0; i < $scope.form.actions.length; i++) {
                $scope.form.actions[i].translated_name = SessionService.translate($scope.form.actions[i].name);
            }
        } else {
            $scope.form.actions = [];
        }
        if ($scope.form.values) {
            for (var i = 0; i < $scope.form.values.length; i++) {
                $scope.form.values[i].translated_name = SessionService.translate($scope.form.values[i].name);
            }
        } else {
            $scope.form.values = [];
        }
        if ($scope.form.display) {
            for (var i = 0; i < $scope.form.display.length; i++) {
                for (var j = 0; j < $scope.form.display[i].blocks.length; j++) {
                    for (var k = 0; k < $scope.form.display[i].blocks[j].fields.length; k++) {
                        if (!$scope.form.display[i].blocks[j].fields[k].id) {
                            $scope.form.display[i].blocks[j].fields[k].id = computeNewId();
                        }
                        $scope.field_id_list[$scope.form.display[i].blocks[j].fields[k].id] = true;
                        if ($scope.form.display[i].blocks[j].fields[k].text) {
                            $scope.form.display[i].blocks[j].fields[k].translated_name = SessionService.translate($scope.form.display[i].blocks[j].fields[k].text);
                        } else {
                            $scope.form.display[i].blocks[j].fields[k].translated_name = SessionService.translate($scope.form.datamodel.projection[$scope.form.display[i].blocks[j].fields[k].name])
                        }
                    }
                }
            }
        } else {
            $scope.form.display = [];
        }

        $scope.sessionData.applicationName = $scope.sessionData.appData.app_designer;
        SessionService.setSessionData($scope.sessionData);
    });

    DesignDataModel.query({
        skip: 0,
        limit: 500,
    }, function (datamodels) {
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
    }

    var saveFormForward = function (url) {
        if ($scope.form.actions) {
            for (var l = 0; l < $scope.form.actions.length; l++) {
                delete $scope.form.actions[l]['translated_name'];
            }
        }
        if ($scope.form.values) {
            for (var m = 0; m < $scope.form.values.length; m++) {
                delete $scope.form.values[m]['translated_name'];
            }
        }
        if ($scope.form.display) {
            for (var i = 0; i < $scope.form.display.length; i++) {
                for (var j = 0; j < $scope.form.display[i].blocks.length; j++) {
                    for (var k = 0; k < $scope.form.display[i].blocks[j].fields.length; k++) {
                        delete $scope.form.display[i].blocks[j].fields[k]['translated_name'];
                    }
                }
            }
        }
        DesignForm.update({
            id: $scope.form._id
        }, $scope.form, function (res) {
            SessionService.location(url);
        }, function (res) {
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
        for (var i = 0; i < $scope.form.display[section].blocks.length; i++) {
            $scope.form.display[section].blocks[i].flex = 100 / $scope.form.display[section].blocks.length;
        }
    }

    $scope.editAction = function (actionIndex) {
        saveFormForward('/form_action_edit/' + $scope.form._id + '?action=' + actionIndex + '&application_id=' + $routeParams.application_id + '&workflow_id=' + $routeParams.workflow_id);
    }

    $scope.deleteAction = function (actionIndex) {
        $scope.form.actions.splice(actionIndex, 1);
    }

    $scope.editValue = function (value) {
        saveFormForward('/form_value_edit/' + value._id + '?datamodel_id=' + $scope.form.datamodel._id + '&application_id=' + $routeParams.application_id + '&workflow_id=' + $routeParams.workflow_id + '&form_id=' + $scope.form._id);
    }

    $scope.deleteValue = function (valueIndex) {
        $scope.form.values.splice(valueIndex, 1);
    }

    $scope.newAction = function () {
        var name = {};
        name[$scope.sessionData.userData.properties.correctedLanguage] = '';
        $scope.form.actions.push({
            name: name,
            translated_name: ''
        });
        saveFormForward('/form_action_edit/' + $scope.form._id + '?action=' + ($scope.form.actions.length - 1) + '&application_id=' + $routeParams.application_id + '&workflow_id=' + $routeParams.workflow_id);
    }

    $scope.newValue = function () {
        $mdDialog.show({
            templateUrl: 'designer/newvalue.html',
            controller: 'NewValueCtrl',
            parent: angular.element(document.body),
            clickOutsideToClose: true
        }).then(function (result) {
            if (result == '') {
                var name = {};
                name[$scope.sessionData.userData.properties.correctedLanguage] = '';
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
            } else {
                $scope.form.values.push({
                    name: '',
                    _id: result
                });
                saveFormForward('/form_value_edit/' + result + '?datamodel_id=' + $scope.form.datamodel._id + '&application_id=' + $routeParams.application_id + '&workflow_id=' + $routeParams.workflow_id + '&form_id=' + $scope.form._id);
            }
        });
    }

    $scope.newSection = function () {
        if (!$scope.form.display) {
            $scope.form.display = [];
        }
        var text = {};
        text[$scope.sessionData.userData.properties.correctedLanguage] = '';
        $scope.form.display.push({
            blocks: [{
                flex: 100,
                fields: [{
                    text: text,
                    translated_name: '',
                    disabled: false,
                    mandatory: false,
                    id: computeNewId()
                    }]
                }]
        });
    }

    $scope.newBlock = function (blocks) {
        if (!$scope.form.display) {
            $scope.form.display = [];
        }
        var text = {};
        text[$scope.sessionData.userData.properties.correctedLanguage] = '';
        blocks.push({
            fields: [{
                text: text,
                translated_name: '',
                disabled: false,
                mandatory: false,
                id: computeNewId()
                }]
        });
        for (var i = 0; i < blocks.length; i++) {
            blocks[i].flex = 100 / blocks.length;
        }
    }

    $scope.newField = function (fields) {
        var text = {};
        text[$scope.sessionData.userData.properties.correctedLanguage] = '';
        fields.push({
            text: text,
            translated_name: '',
            disabled: false,
            mandatory: false,
            id: computeNewId()
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
