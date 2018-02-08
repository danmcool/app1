app1.controller('ApplicationSecurityCtrl', ['$scope', 'SessionService', 'DesignApplication', 'DesignWorkflow', 'DesignForm', 'Files', '$location', '$routeParams', '$mdDialog', function ($scope, SessionService, DesignApplication, DesignWorkflow, DesignForm, Files, $location, $routeParams, $mdDialog) {
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
        if (resultApp.profiles) {
            for (var i = 0; i < resultApp.profiles.length; i++) {
                resultApp.profiles[i].translated_name = SessionService.translate(resultApp.profiles[i].name);
                resultApp.profiles[i].translated_description = SessionService.translate(resultApp.profiles[i].description);
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

    $scope.editProfile = function (profileId) {
        DesignApplication.update({
            id: $scope.application._id
        }, $scope.application, function (res) {
            SessionService.init();
            SessionService.location('/profile_edit/' + profileId + '?application_id=' + $scope.application._id);
        }, function (res) {
            $scope.application = res.application;
            updateErrorAlert();
        });
    }

    $scope.newProfile = function () {
        var name = {};
        name[$scope.sessionData.userData.properties.language] = '';
        var newProfile = new DesignProfile({
            name: name
        });
        newProfile.$save(function () {
            newProfile.translated_name = newProfile.name.en;
            $scope.application.profiles.push(newProfile);
            DesignApplication.update({
                id: $scope.application._id
            }, $scope.application, function (res) {
                //SessionService.init();
                //SessionService.location('/form_edit/' + newForm._id + '?application_id=' + $routeParams.application_id + '&workflow_id=' + $scope.workflow._id);
            }, function (res) {
                $scope.application = res.application;
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
        DesignApplication.update({
            id: $scope.application._id
        }, $scope.application, function (res) {
            SessionService.init();
            SessionService.location('/application_edit/' + $routeParams.id);
        }, function (res) {
            $scope.application = res.application;
            updateErrorAlert();
        });
    }

}]);
