app1.factory('DesignApplication', ['$resource', function ($resource) {
    return $resource('/client/design/application/:id', null, {
        'update': {
            method: 'PUT'
        }
    });
}]).factory('DesignWorkflow', ['$resource', function ($resource) {
    return $resource('/client/design/workflow/:id', null, {
        'update': {
            method: 'PUT'
        }
    });
}]).factory('DesignForm', ['$resource', function ($resource) {
    return $resource('/client/design/form/:id', null, {
        'update': {
            method: 'PUT'
        }
    });
}]).factory('DesignProfile', ['$resource', function ($resource) {
    return $resource('/client/design/profile/:id', null, {
        'update': {
            method: 'PUT'
        }
    });
}]).factory('DesignValue', ['$resource', function ($resource) {
    return $resource('/client/design/value/:id', null, {
        'update': {
            method: 'PUT'
        }
    });
}]).factory('DesignDataModel', ['$resource', function ($resource) {
    return $resource('/client/design/datamodel/:id', null, {
        'update': {
            method: 'PUT'
        }
    });
}]).factory('DesignMachineLearningModel', ['$resource', function ($resource) {
    return $resource('/client/design/machinelearningmodel/:id', null, {
        'update': {
            method: 'PUT'
        }
    });
}]).factory('TrainMachineLearningModel', ['$resource', function ($resource) {
    return $resource('/client/model_train/:datamodel_id/:mlmodel_id', null, {
        'update': {
            method: 'PUT'
        }
    });
}]).controller('DesignerCtrl', ['$scope', 'SessionService', 'DesignApplication', 'Company', 'Share', '$mdDialog', '$location', function ($scope, SessionService, DesignApplication, Company, Share, $mdDialog, $location) {
    ga('send', 'pageview', '/designer');

    $scope.sessionData = SessionService.getSessionData();
    $scope.applications = [];
    $scope.skip = 0;
    $scope.limit = 10;
    $scope.stopScroll = false;
    $scope.tempStopScroll = false;

    $scope.$watch(function () {
        return SessionService.getSessionData();
    }, function (newValue, oldValue) {
        if (newValue != oldValue) {
            $scope.sessionData = newValue;
            $scope.sessionData.applicationName = $scope.sessionData.appData.app_designer;
            SessionService.setSessionData($scope.sessionData);
        }
    });

    $scope.sessionData.applicationName = $scope.sessionData.appData.app_designer;
    SessionService.setSessionData($scope.sessionData);

    $scope.getNextApps = function () {
        if ($scope.stopScroll) return;
        if ($scope.tempStopScroll) return;
        var localLimit = $scope.limit;
        var localSkip = $scope.skip;
        $scope.skip += $scope.limit;
        $scope.tempStopScroll = true;
        DesignApplication.query({
            skip: localSkip,
            limit: localLimit,
        }, function (apps) {
            if (apps.length < $scope.limit) {
                $scope.stopScroll = true;
            }
            if (apps && apps.length > 0) {
                for (var i = 0; i < apps.length; i++) {
                    var companyApps = $scope.sessionData.userData.company.applications;
                    for (var j = 0; j < companyApps.length; j++) {
                        if (apps[i]._id == companyApps[j]) {
                            apps[i].enabled = true;
                            break;
                        }
                    }
                    apps[i].translated_name = SessionService.translate(apps[i].name);
                    apps[i].translated_description = SessionService.translate(apps[i].description);
                    $scope.applications.push(apps[i]);
                }
            }
            $scope.tempStopScroll = false;
        });
    }

    $scope.getNextApps();

    $scope.newApplication = function () {
        var name = {};
        name[$scope.sessionData.userData.properties.correctedLanguage] = '';
        var newApp = new DesignApplication({
            name: name,
            icon: 'clear'
        });
        newApp.$save(function () {
            newApp.translated_name = '';
            $scope.applications.push(newApp);
            SessionService.location('/application_edit/' + newApp._id);
        });
    }

    $scope.delete = function (app) {
        $mdDialog.show(
            $mdDialog.confirm()
            .parent(angular.element(document.body))
            .clickOutsideToClose(true)
            .title($scope.sessionData.appData.confirmation)
            .textContent($scope.sessionData.appData.removal_confirmation)
            .ok($scope.sessionData.appData.ok)
            .cancel($scope.sessionData.appData.cancel)).then(
            function () {
                DesignApplication.remove({
                    id: app._id
                }, function (res) {
                    for (var i = 0; i < $scope.applications.length; i++) {
                        if ($scope.applications[i]._id == app._id) {
                            $scope.applications.splice(i, 1);
                            break;
                        }
                    }
                    if (app.enabled) {
                        var enabledApps = $scope.sessionData.userData.company.applications;
                        for (var i = 0; i < enabledApps.length; i++) {
                            if (app._id == enabledApps[i]) {
                                enabledApps.splice(i, 1);
                                break;
                            }
                        }
                        Company.update({
                            id: $scope.sessionData.userData.company._id
                        }, {
                            _id: $scope.sessionData.userData.company._id,
                            applications: enabledApps
                        }, function (res) {
                            SessionService.init();
                        });
                    }
                });
            });
    }

    $scope.updateCompanyApps = function (app) {
        if (!app.active) return;
        var enabledApps = $scope.sessionData.userData.company.applications;
        if (app.enabled) {
            for (var i = 0; i < enabledApps.length; i++) {
                if (app._id == enabledApps[i]) {
                    enabledApps.splice(i, 1);
                    break;
                }
            }
        } else {
            enabledApps.push(app._id);
        }
        $scope.sessionData.userData.company.applications = enabledApps;
        Company.update({
            id: $scope.sessionData.userData.company._id
        }, {
            _id: $scope.sessionData.userData.company._id,
            applications: enabledApps
        }, function (res) {
            SessionService.init();
        });
    }

    $scope.edit = function (applicationId) {
        SessionService.location('/application_edit/' + applicationId);
    }

    $scope.share = function (application) {
        var publicProfileFound = false;
        for (var i = 0; i < application.profiles.length; i++) {
            if (application.profiles[i].properties && (application.profiles[i].properties.user == 'public' || application.profiles[i].properties.workflow)) {
                shareableProfileFound = true;
                Share.update({
                    app_profile_id: application.profiles[i]._id,
                    app_name: SessionService.translate(application.name),
                    profile_name: SessionService.translate(application.profiles[i].name)
                }, function (res) {
                    $mdDialog.show(
                        $mdDialog.confirm()
                        .parent(angular.element(document.body))
                        .clickOutsideToClose(true)
                        .title($scope.sessionData.appData.share_url)
                        .textContent(res.share_url)
                        .ok($scope.sessionData.appData.ok)
                    );
                });
                break;
            }
        }
        if (!shareableProfileFound) {
            $mdDialog.show(
                $mdDialog.alert()
                .parent(angular.element(document.body))
                .clickOutsideToClose(true)
                .title($scope.sessionData.appData.error)
                .textContent($scope.sessionData.appData.no_public_profile)
                .ok($scope.sessionData.appData.ok)
            );
        }
    }

    $scope.users = function (applicationId) {
        SessionService.location('/application_users/' + applicationId);
    }
}]);
