app1.controller('WorkflowEditCtrl', ['$scope', 'SessionService', 'DesignWorkflow', 'DesignForm', 'Files', '$location', '$routeParams', '$mdDialog', function ($scope, SessionService, DesignWorkflow, DesignForm, Files, $location, $routeParams, $mdDialog) {
    $scope.sessionData = SessionService.getSessionData();
    $scope.$watch(function () {
        return SessionService.getSessionData();
    }, function (newValue, oldValue) {
        if (newValue != oldValue) {
            $scope.sessionData = newValue;
        }
    });

    DesignWorkflow.get({
        id: $routeParams.id
    }, function (resultWorkflow, err) {
        for (var i = 0; i < resultWorkflow.forms.length; i++) {
            resultWorkflow.forms[i].translated_name = SessionService.translate(resultWorkflow.forms[i].name);
            resultWorkflow.forms[i].translated_description = SessionService.translate(resultWorkflow.forms[i].description);
        }
        $scope.workflow = resultWorkflow;
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
        }, function (result) {
            object[property] = result;
        });
    };

    $scope.editForm = function (formId) {
        DesignWorkflow.update({
            id: $scope.workflow._id
        }, $scope.workflow, function (res) {
            SessionService.init();
            SessionService.location('/form_edit/' + formId + '?application_id=' + $routeParams.application_id + '&workflow_id=' + $scope.workflow._id);
        }, function (res) {
            $scope.application = res.application;
            updateErrorAlert();
        });
    }

    $scope.newForm = function () {
        var name = {};
        name[$scope.sessionData.userData.properties.language] = '';
        var newForm = new DesignForm({
            name: name
        });
        newForm.$save(function () {
            newForm.translated_name = newForm.name.en;
            $scope.workflow.forms.push(newForm);
            DesignWorkflow.update({
                id: $scope.workflow._id
            }, $scope.workflow, function (res) {
                SessionService.init();
                SessionService.location('/form_edit/' + newForm._id + '?application_id=' + $routeParams.application_id + '&workflow_id=' + $scope.workflow._id);
            }, function (res) {
                $scope.workflow = res.workflow;
                updateErrorAlert();
            });
        });
    }

    $scope.deleteForm = function (formIndex) {
        var formId = $scope.workflow.forms[formIndex]._id;
        $scope.workflow.forms.splice(formIndex, 1);
        DesignWorkflow.update({
            id: $scope.workflow._id
        }, $scope.workflow, function (resWkf) {
            DesignForm.remove({
                id: formId
            }, function (res) {}, function (res) {
                /* show error*/
            });
        });
    }

    $scope.save = function () {
        DesignWorkflow.update({
            id: $scope.workflow._id
        }, $scope.workflow, function (res) {
            SessionService.init();
            SessionService.location('/application_edit/' + $routeParams.application_id);
        }, function (res) {
            $scope.application = res.application;
            updateErrorAlert();
        });
    }

    $scope.uploadFile = function (file, signedRequest, url) {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', signedRequest);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    document.getElementById('file_upload').textContent = $scope.sessionData.appData.uploading_done;
                    setTimeout(function () {
                        document.getElementById('file_upload').textContent = '';
                    }, 4 * 1000);
                } else {
                    alert('Could not upload file.');
                }
            }
        };
        xhr.send(file);
    };
    $scope.changeFile = function (files) {
        if (files.length != 1) return;
        for (k = files.length - 1; k >= 0; k--) {
            if (files[k].size / 1048576 > 35) {
                files.splice(k, 1);
            }
        }
        document.getElementById('file_upload').textContent = $scope.sessionData.appData.uploading_in_progress + ' 1/1';
        var file = new Files({
            'name': files[0].name,
            'type': files[0].type
        });
        file.$save(function (res) {
            $scope.workflow.file = {
                '_id': res.file._id,
                'name': res.file.name,
                'type': res.file.type
            };
            $scope.uploadFile(files[0], res.signedRequest, res.url);
        });
    }
    $scope.removeFile = function (fileId) {
        Files.remove({
            id: fileId
        }, function (res) {
            $scope.workflow.file = null;
        }, function (res) {
            /* show error*/
        })
    }
}]);
