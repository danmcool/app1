app1.controller('ApplicationsCtrl', function($scope, SessionService, $location) {
    $scope.sessionData = SessionService.getSessionData();
    if ($scope.sessionData.applications) {
        for (var i = 0; i < $scope.sessionData.applications.length; i++) {
            $scope.sessionData.applications[i].translated_name = SessionService.translate($scope.sessionData.applications[i].name);
            $scope.sessionData.applications[i].translated_description = SessionService.translate($scope.sessionData.applications[i].description);
        }
        $scope.sessionData.applicationName = $scope.sessionData.appData.home;
        SessionService.setSessionData($scope.sessionData);
    }

    $scope.$watch(function() {
        return SessionService.getSessionData();
    }, function(newValue, oldValue) {
        if (newValue != oldValue) {
            $scope.sessionData = newValue;
            var apps = $scope.sessionData.applications;
            if (apps) {
                for (var i = 0; i < apps.length; i++) {
                    apps[i].translated_name = SessionService.translate(apps[i].name);
                    apps[i].translated_description = SessionService.translate(apps[i].description);
                }
                $scope.sessionData.applicationName = $scope.sessionData.appData.home;
                SessionService.setSessionData($scope.sessionData);
            }
        }
    });
    $scope.open = function(application_id) {
        $location.url("/workflows/" + application_id);
    }
});
