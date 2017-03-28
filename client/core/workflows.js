app1.controller('WorkflowsCtrl',
    function($scope, $routeParams, $location, SessionService) {
        $scope.sessionData = SessionService.getSessionData();

        var initWorkflows = function() {
            if ($routeParams.application_id == 'undefined') {
                $location.url('/applications');
            } else {
                $scope.sessionData.application_id = $routeParams.application_id;
                if ($scope.sessionData.applications) {
                    var apps = $scope.sessionData.applications;
                    for (var i = 0; i < apps.length; i++) {
                        apps[i].translated_name = SessionService.translate(apps[i].name);
                        apps[i].translated_description = SessionService.translate(apps[i].description);
                        if (apps[i]._id == $routeParams.application_id) {
                            $scope.workflows = apps[i].workflows;
                            $scope.sessionData.applicationName = apps[i].translated_name;
                            break;
                        }
                    }
                    for (var i = 0; i < $scope.workflows.length; i++) {
                        $scope.workflows[i].translated_name = SessionService.translate($scope.workflows[i].name);
                        $scope.workflows[i].translated_description = SessionService.translate($scope.workflows[i].description);
                    }
                    SessionService.setSessionData($scope.sessionData);
                }
            }
        }

        $scope.$watch(function() {
            return SessionService.getSessionData().applications;
        }, function(newValue, oldValue) {
            if (newValue != oldValue) {
                $scope.sessionData = SessionService.getSessionData();
                initWorkflows();
            }
        });

        $scope.open = function(formId) {
            $location.url('/form/' + formId + '/0');
        }

        initWorkflows();
    });
