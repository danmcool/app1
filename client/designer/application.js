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
    };

    $scope.editWorkflow = function (workflowId) {
        DesignApplication.update({
            id: $scope.application._id
        }, $scope.application).$promise.then(function (res) {
            SessionService.init();
            SessionService.location('/workflow_edit/' + workflowId + '?application_id=' + $scope.application._id);
        }).catch(function (res) {
            $scope.application = res.application;
            updateErrorAlert();
        });
    }

    $scope.newWorkflow = function () {
        $mdDialog.show(
            $mdDialog.prompt()
            .parent(angular.element(document.body))
            .clickOutsideToClose(true)
            .title($scope.sessionData.appData.new_workflow)
            .textContent($scope.sessionData.appData.new_workflow_name)
            .initialValue('My Workflow')
            .ok($scope.sessionData.appData.ok)
            .cancel($scope.sessionData.appData.cancel)
        ).then(function (result) {
            var name = {};
            name[$scope.sessionData.userData.properties.language] = result;
            var newWorkflow = new DesignWorkflow({
                name: name,
                icon: 'clear'
            });
            newWorkflow.$save(function () {
                newWorkflow.translated_name = result;
                $scope.application.workflows.push(newWorkflow);
                DesignApplication.update({
                    id: $scope.application._id
                }, $scope.application).$promise.then(function (res) {
                    SessionService.init();
                    SessionService.location('/workflow_edit/' + newWorkflow._id + '?application_id=' + $scope.application._id);
                }).catch(function (res) {
                    $scope.application = res.application;
                    updateErrorAlert();
                });
            });
        });
    }

    $scope.save = function () {
        DesignApplication.update({
            id: $scope.application._id
        }, $scope.application).$promise.then(function (res) {
            SessionService.init();
            SessionService.location('/designer');
        }).catch(function (res) {
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
        document.getElementById('file_upload').textContent = $scope.sessionData.appData.uploading_in_progress + ' 1/1';
        var file = new Files({
            name: files[0].name,
            type: files[0].type
        });
        file.$save().then(function (res) {
            $scope.application.file = {
                _id: res.file._id,
                name: res.file.name,
                type: res.file.type
            };
            $scope.uploadFile(files[0], res.signedRequest, res.url);
        });
    }
    $scope.removeFile = function (fileId) {
        Files.remove({
                id: fileId
            }).$promise
            .then(function (res) {
                $scope.application.file = null;
            })
            .catch(function (res) {
                /* show error*/
            })
    }
}]);
