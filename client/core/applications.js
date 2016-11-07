app1.controller('ApplicationsCtrl', function($scope, SessionService, $location) {
    $scope.sessionData = SessionService.getSessionData();
    $scope.$watch(function() {
        return SessionService.getSessionData();
    }, function(newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.sessionData = newValue;
            for (application in $scope.sessionData.applications) {
                $scope.sessionData.applications[application].translated_name = SessionService.translate($scope.sessionData.applications[application].name);
                $scope.sessionData.applications[application].translated_description = SessionService.translate($scope.sessionData.applications[application].description);
            }
        }
    });
    $scope.open = function(application_id) {
        $location.url("/workflows/" + application_id);
    }
});
