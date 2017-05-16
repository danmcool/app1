app1.factory('DesignApplication', ['$resource',
    function($resource) {
        return $resource('/client/design/application/:id', null, {
            'update': {
                method: 'PUT'
            }
        });
    }
]).factory('DesignWorkflow', ['$resource',
    function($resource) {
        return $resource('/client/design/workflow/:id', null, {
            'update': {
                method: 'PUT'
            }
        });
    }
]).factory('DesignForm', ['$resource',
    function($resource) {
        return $resource('/client/design/form/:id', null, {
            'update': {
                method: 'PUT'
            }
        });
    }
]).controller('DesignerCtrl', function($scope, SessionService, DesignApplication, Company, $mdDialog, $location) {
    $scope.sessionData = SessionService.getSessionData();
    $scope.applications = [];

    $scope.$watch(function() {
        return SessionService.getSessionData();
    }, function(newValue, oldValue) {
        if (newValue != oldValue) {
            $scope.sessionData = newValue;
            $scope.sessionData.applicationName = $scope.sessionData.appData.app_designer;
            $scope.sessionData.showShareForm = false;
            SessionService.setSessionData($scope.sessionData);
        }
    });

    DesignApplication.query(function(apps) {
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
            }
            $scope.applications = apps;
        }
        $scope.sessionData.applicationName = $scope.sessionData.appData.app_designer;
        $scope.sessionData.showShareForm = false;
        SessionService.setSessionData($scope.sessionData);
    });

    $scope.newApplication = function() {
        $mdDialog.show(
            $mdDialog.prompt()
            .parent(angular.element(document.body))
            .clickOutsideToClose(true)
            .title($scope.sessionData.appData.new_app)
            .textContent($scope.sessionData.appData.new_app_name)
            .initialValue('My App')
            .ok($scope.sessionData.appData.ok)
            .cancel($scope.sessionData.appData.cancel)
        ).then(function(result) {
            var newApp = new DesignApplication({
                name: {
                    en: result
                }
            });
            newApp.$save(function() {
                newApp.translated_name = newApp.name.en;
                $scope.applications.push(newApp);
            });
        });
    }

    $scope.delete = function(app) {
        $mdDialog.show(
            $mdDialog.confirm()
            .parent(angular.element(document.body))
            .clickOutsideToClose(true)
            .title($scope.sessionData.appData.confirmation)
            .textContent($scope.sessionData.appData.removal_confirmation)
            .ok($scope.sessionData.appData.ok)
            .cancel($scope.sessionData.appData.cancel)
        ).then(function() {
            DesignApplication.remove({
                id: app._id
            }).$promise.then(function(res) {
                if (!app.enabled) {
                    for (var i = 0; i < $scope.applications.length; i++) {
                        if ($scope.applications[i]._id == app._id) {
                            $scope.applications.splice(i, 1);
                            break;
                        }
                    }
                } else {
                    var enabledApps = $scope.sessionData.userData.company.applications;
                    for (var i = 0; i < enabledApps.length; i++) {
                        if (app._id == enabledApps[i]) {
                            enabledApps.splice(i, 1);
                            break;
                        }
                    }
                    for (var i = 0; i < $scope.applications.length; i++) {
                        if (app._id == $scope.applications[i]._id) {
                            $scope.applications.splice(i, 1);
                            break;
                        }
                    }
                    Company.update({
                        id: $scope.sessionData.userData.company._id
                    }, {
                        _id: $scope.sessionData.userData.company._id,
                        applications: enabledApps
                    }).$promise.then(function(res) {
                        SessionService.init();
                    });
                }
            });
        });
    }

    $scope.updateCompanyApps = function(app) {
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
        Company.update({
            id: $scope.sessionData.userData.company._id
        }, {
            _id: $scope.sessionData.userData.company._id,
            applications: enabledApps
        }).$promise.then(function(res) {
            SessionService.init();
        });
    }

    $scope.edit = function(applicationId) {
        $location.url('/application_edit/' + applicationId);
    }
});
