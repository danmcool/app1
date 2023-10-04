app1.controller('ApplicationSecurityCtrl', ['$scope', 'SessionService', 'DesignApplication', 'DesignWorkflow', 'DesignForm', 'DesignProfile', 'Files', '$location', '$routeParams', '$mdDialog', function ($scope, SessionService, DesignApplication, DesignWorkflow, DesignForm, DesignProfile, Files, $location, $routeParams, $mdDialog) {
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
            SessionService.location('/application_profile/' + profileId + '?application_id=' + $scope.application._id);
        }, function (res) {
            $scope.application = res.application;
            updateErrorAlert();
        });
    }

    $scope.newProfile = function () {
        $mdDialog.show({
            templateUrl: 'designer/newprofile.html',
            controller: 'NewProfileCtrl',
            parent: angular.element(document.body),
            clickOutsideToClose: true
        }).then(function (result) {
            var profile = {
                applications: {}
            };
            profile.applications[$scope.application._id] = {
                workflows: {}
            };
            for (var i = 0; i < $scope.application.workflows.length; i++) {
                profile.applications[$scope.application._id].workflows[$scope.application.workflows[i]._id] = false;
            }
            var name = {};
            name[$scope.sessionData.userData.properties.correctedLanguage] = result.name;
            var newProfile = new DesignProfile({
                name: name,
                type: 'application',
                profile: profile,
                properties: {
                    user: result.public ? 'public' : ''
                }
            });
            newProfile.$save(function () {
                $scope.application.profiles.push(newProfile);
                DesignApplication.update({
                    id: $scope.application._id
                }, $scope.application, function (res) {
                    SessionService.init();
                    SessionService.location('/application_profile/' + newProfile._id + '?application_id=' + $routeParams.id);
                }, function (res) {
                    $scope.application = res.application;
                    updateErrorAlert();
                });
            });
        });
    }

    $scope.deleteProfile = function (profileId) {
        $mdDialog.show(
            $mdDialog.confirm()
            .parent(angular.element(document.body))
            .clickOutsideToClose(true)
            .title($scope.sessionData.appData.confirmation)
            .textContent($scope.sessionData.appData.removal_confirmation)
            .ok($scope.sessionData.appData.ok)
            .cancel($scope.sessionData.appData.cancel)).then(
            function () {
                DesignProfile.remove({
                    id: profileId
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
