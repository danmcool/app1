app1.controller('LoginCtrl',
function ($scope, $location, Login, Logout, SessionService) {
    $scope.login = function (user, password, code) {
        loginObject = new Login({
            user: user,
            password: password,
            _company_code: code
        });
        loginObject.$save(function (result) {
            var sessionData.userData = result.user;
            sessionData.userData.title = result.user.firstname + " " + result.user.lastname + " @ " + result.user.company;
            sessionData.userData.name = result.user.firstname + " " + result.user.lastname;
            sessionData.dynamicTheme = 'user1';
            Applications.query().$promise.then(function (result) {
                sessionData.applications = result;
                SessionService.setSessionData(sessionData);
                $location.url('/applications');
            });
        });
    };
}]);
