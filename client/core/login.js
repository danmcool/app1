app1.controller('LoginCtrl',
    function($scope, $location, Login, Applications, SessionService, AppTranslationService) {
        $scope.sessionData = SessionService.getSessionData();
        $scope.sessionData.applicationName = 'App1';
        SessionService.setSessionData($scope.sessionData);

        $scope.login = function(user, password) {
            var loginObject = new Login({
                user: user,
                password: password
            });
            loginObject.$save(function(userResult) {
                $scope.sessionData = {};
                $scope.sessionData.token = userResult.token;
                $scope.sessionData.userData = userResult.user;
                $scope.sessionData.userData.title = (userResult.user.firstname ? userResult.user.firstname : '') + ' ' + (userResult.user.lastname ? userResult.user.lastname : '') + ' @ ' + (userResult.user.company.name ? userResult.user.company.name : '');
                $scope.sessionData.userData.name = (userResult.user.firstname ? userResult.user.firstname : '') + ' ' + (userResult.user.lastname ? userResult.user.lastname : '');
                $scope.sessionData.appData = AppTranslationService.translate($scope.sessionData.userData.properties.language);
                Applications.query().$promise.then(function(applicationsResult) {
                    $scope.sessionData.applications = applicationsResult;
                    $scope.sessionData.applicationName = $scope.sessionData.appData.home;
                    SessionService.setSessionData($scope.sessionData);
                    $location.url('/applications');
                });
            });
        };
    });
