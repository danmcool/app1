app1.controller('WorkflowsCtrl',
    function($scope, $routeParams, $location, SessionService) {
        var apps = SessionService.getSessionData().applications;
        for (var i = 0; i < apps.length; i++) {
            if (apps[i]._id == $routeParams.application_id) {
                $scope.workflows = apps[i].workflows;
                break;
            }
        }

        $scope.open = function(href) {
            $location.url("/form/" + href + "/0");
        }
    }
);
