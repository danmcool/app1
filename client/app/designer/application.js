app1.controller('ApplicationEditCtrl', ['$scope', 'SessionService', 'DesignApplication', 'DesignWorkflow', 'Files', '$location', '$routeParams', '$mdDialog', function ($scope, SessionService, DesignApplication, DesignWorkflow, Files, $location, $routeParams, $mdDialog) {
    $scope.sessionData = SessionService.getSessionData();
    $scope.$watch(function () {
        return SessionService.getSessionData();
    }, function (newValue, oldValue) {
        if (newValue != oldValue) {
            $scope.sessionData = newValue;
        }
    });

    DesignApplication.get({
        id: $routeParams.id
    }, function (resultApp, err) {
        if (resultApp.workflows) {
            for (var i = 0; i < resultApp.workflows.length; i++) {
                resultApp.workflows[i].translated_name = SessionService.translate(resultApp.workflows[i].name);
                resultApp.workflows[i].translated_description = SessionService.translate(resultApp.workflows[i].description);
            }
        }
        $scope.application = resultApp;
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
    }

    $scope.editWorkflow = function (workflowId) {
        DesignApplication.update({
            id: $scope.application._id
        }, $scope.application, function (res) {
            SessionService.init();
            SessionService.location('/workflow_edit/' + workflowId + '?application_id=' + $scope.application._id);
        }, function (res) {
            $scope.application = res.application;
            updateErrorAlert();
        });
    }

    $scope.editAppSecurity = function () {
        DesignApplication.update({
            id: $scope.application._id
        }, $scope.application, function (res) {
            SessionService.init();
            SessionService.location('/application_security/' + $scope.application._id);
        }, function (res) {
            $scope.application = res.application;
            updateErrorAlert();
        });
    }

    $scope.newWorkflow = function () {
        var name = {};
        name[$scope.sessionData.userData.properties.correctedLanguage] = '';
        var newWorkflow = new DesignWorkflow({
            name: name,
            icon: 'clear'
        });
        newWorkflow.$save(function () {
            newWorkflow.translated_name = '';
            $scope.application.workflows.push(newWorkflow);
            DesignApplication.update({
                id: $scope.application._id
            }, $scope.application, function (res) {
                SessionService.init();
                SessionService.location('/workflow_edit/' + newWorkflow._id + '?application_id=' + $scope.application._id);
            }, function (res) {
                $scope.application = res.application;
                updateErrorAlert();
            });
        });
    }

    $scope.deleteWorkflow = function (workflowIndex) {
        var workflowId = $scope.application.workflows[workflowIndex]._id;
        $scope.application.workflows.splice(workflowIndex, 1);
        DesignApplication.update({
            id: $scope.application._id
        }, $scope.application, function (resApp) {
            DesignWorkflow.remove({
                id: workflowId
            }, function (res) {}, function (res) {
                /* show error*/
            });
        });
    }

    $scope.testApp = function () {
        DesignApplication.update({
            id: $scope.application._id
        }, $scope.application, function (res) {
            SessionService.init();
            SessionService.location('/workflows/' + $scope.application._id + '?test');
        }, function (res) {
            $scope.application = res.application;
            updateErrorAlert();
        });
    }

    $scope.save = function () {
        DesignApplication.update({
            id: $scope.application._id
        }, $scope.application, function (res) {
            SessionService.init();
            SessionService.location('/designer');
        }, function (res) {
            $scope.application = res.application;
            updateErrorAlert();
        });
    }

    $scope.uploadFile = function (file, url) {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', url);
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
        }
        xhr.send(file);
    };
    changeFileInApplicationsJS = function (files) {
        if (files.length != 1) return;
        for (k = files.length - 1; k >= 0; k--) {
            if (files[k].size / 1048576 > 35) {
                files.splice(k, 1);
            }
        }
        document.getElementById('file_upload').textContent = $scope.sessionData.appData.uploading_in_progress + ' 1/1';
        var file = new Files({
            name: files[0].name,
            type: files[0].type
        });
        file.$save(function (res) {
            $scope.application.file = {
                _id: res.file._id,
                name: res.file.name,
                type: res.file.type
            };
            $scope.uploadFile(files[0], res.url);
        });
    }
    $scope.removeFile = function (fileId) {
        Files.remove({
            id: fileId
        }, function (res) {
            $scope.application.file = null;
        }, function (res) {
            /* show error*/
        })
    }
}]);
