app1.controller('ApplicationsCtrl', ['$scope', 'SessionService', '$location', function ($scope, SessionService, $location) {
    $scope.openApplication = function (application) {
        if (application.type == 'url') {
            SessionService.location('/url/' + application._id + '?iframe_url=' + application.url);
        } else if (application.type == 'file') {
            SessionService.location('/file/' + application._id + '?iframe_file=' + application.file);
        } else {
            if (application.remote) {
                SessionService.location('/workflows/' + application._id + '?pid=' + application.pid);
            } else {
                SessionService.location('/workflows/' + application._id);
            }
        }
    }

    $scope.sessionData = SessionService.getSessionData();
    if ($scope.sessionData.applications && $scope.sessionData.applications.length == 1) {
        $scope.openApplication($scope.sessionData.applications[0]);
    }
    $scope.sessionData.applicationName = $scope.sessionData.appData.home;
    SessionService.setSessionData($scope.sessionData);

    $scope.$watch(function () {
        return SessionService.getSessionData().applications;
    }, function (newValue, oldValue) {
        if (newValue != oldValue) {
            if ($scope.sessionData.applications && $scope.sessionData.applications.length == 1) {
                $scope.openApplication($scope.sessionData.applications[0]);
            } else {
                $scope.sessionData.applicationName = $scope.sessionData.appData.home;
                SessionService.setSessionData($scope.sessionData);
            }
        }
    });
}]);
