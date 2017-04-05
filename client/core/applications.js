app1.controller('ApplicationsCtrl', function($scope, SessionService, $location) {
    $scope.sessionData = SessionService.getSessionData();
    $scope.sessionData.applicationName = $scope.sessionData.appData.home;
    SessionService.setSessionData($scope.sessionData);

    $scope.$watch(function() {
        return SessionService.getSessionData();
    }, function(newValue, oldValue) {
        if (newValue != oldValue) {
            $scope.sessionData = newValue;
            $scope.sessionData.applicationName = $scope.sessionData.appData.home;
            SessionService.setSessionData($scope.sessionData);
        }
    });
    $scope.open = function(application_id) {
        $location.url('/workflows/' + application_id);
    }
});
