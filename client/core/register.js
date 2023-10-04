home.controller('RegisterCtrl', ['$scope', '$location', '$mdDialog', 'Register', 'SessionService', function ($scope, $location, $mdDialog, Register, SessionService) {
    ga('send', 'pageview', '/register');

    $scope.sessionData = SessionService.getSessionData();
    $scope.sessionData.applicationName = 'App1';
    SessionService.setSessionData($scope.sessionData);

    $scope.register = function (firstname, lastname, email, code, company_name) {
        var registerObject = new Register({
            user: email,
            code: code,
            firstname: firstname,
            lastname: lastname,
            email: email,
            company_name: company_name
        });
        registerObject.$save(function (res) {
            $mdDialog.show(
                $mdDialog.alert()
                .parent(angular.element(document.body))
                .clickOutsideToClose(true)
                .title('Success')
                .textContent(res.msg)
                .ok('Got it!')).then(function () {
                SessionService.location('/');
            });
        }, function (error) {
            $mdDialog.show(
                $mdDialog.alert()
                .parent(angular.element(document.body))
                .clickOutsideToClose(true)
                .title('Error')
                .textContent(error.data.msg)
                .ok('Got it!'));
        });
    };
}]);
