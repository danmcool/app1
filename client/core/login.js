app1.controller('LoginCtrl',
    function($scope, $location, Login, Applications, SessionService) {
        $scope.sessionData = {};
        $scope.login = function(user, password, code) {
            var loginObject = new Login({
                user: user,
                password: password,
                _company_code: code
            });
            loginObject.$save(function(userResult) {
                $scope.sessionData.userData = userResult.user;
                $scope.sessionData.userData.title = userResult.user.firstname + " " + userResult.user.lastname + " @ " + userResult.user.company.name;
                $scope.sessionData.userData.name = userResult.user.firstname + " " + userResult.user.lastname;
                $scope.sessionData.dynamicTheme = $scope.sessionData.userData.properties.theme;
                Applications.query().$promise.then(function(applicationsResult) {
                    $scope.sessionData.applications = applicationsResult;
                    SessionService.setSessionData($scope.sessionData);
                    $location.url('/applications');
                });
            });
        };
    });
