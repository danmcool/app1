app1.controller('LoginCtrl', ['$scope', 'Login', 'SessionService', function ($scope, Login, SessionService) {
    ga('send', 'pageview', '/login');

    $scope.sessionData = SessionService.getSessionData();
    $scope.sessionData.applicationName = $scope.sessionData.appData.login_title;
    SessionService.setSessionData($scope.sessionData);

    $scope.login = function (user, password) {
        SessionService.login(user, password);
    };
}]);
