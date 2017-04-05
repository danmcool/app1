app1.controller('LoginCtrl',
    function($scope, $location, Login, Applications, SessionService, AppTranslationService) {
        $scope.sessionData = SessionService.getSessionData();
        $scope.sessionData.applicationName = 'App1';
        SessionService.setSessionData($scope.sessionData);

        $scope.login = function(user, password) {
            SessionService.login(user, password);
        };
    });
