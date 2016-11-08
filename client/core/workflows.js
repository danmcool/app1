app1.controller('WorkflowsCtrl',
    function($scope, $routeParams, $location, SessionService) {
        $scope.sessionData = SessionService.getSessionData();
        $scope.sessionData.application_id = $routeParams.application_id;
        var apps = $scope.sessionData.applications;
        for (var i = 0; i < apps.length; i++) {
            if (apps[i]._id == $routeParams.application_id) {
                $scope.workflows = apps[i].workflows;
                $scope.sessionData.applicationName = apps[i].translated_name;
                break;
            }
        }
        SessionService.setSessionData($scope.sessionData);

        for (var i = 0; i < $scope.workflows.length; i++) {
            $scope.workflows[i].translated_name = SessionService.translate($scope.workflows[i].name);
            $scope.workflows[i].translated_description = SessionService.translate($scope.workflows[i].description);
        }

        $scope.open = function(href) {
            $location.url("/form/" + href + "/0");
        }
    }
);
