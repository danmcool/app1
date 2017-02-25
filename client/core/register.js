app1.controller('RegisterCtrl', function($scope, $location, $mdDialog, Register, SessionService) {
    $scope.sessionData = SessionService.getSessionData();
    $scope.sessionData.applicationName = 'App1';
    SessionService.setSessionData($scope.sessionData);

    $scope.register = function(firstname, lastname, email, code, company_name) {
        var registerObject = new Register({
            user: email,
            code: code,
            firstname: firstname,
            lastname: lastname,
            email: email,
            company_name: company_name
        });
        registerObject.$save(function(object) {}).then(function(res) {
            $mdDialog.show(
                $mdDialog.alert()
                .parent(angular.element(document.body))
                .clickOutsideToClose(true)
                .title('Success')
                .textContent(res.msg)
                .ok('Got it!')
            ).then(function() {
                $location.url('/');
            });
        }).catch(function(res) {
            $mdDialog.show(
                $mdDialog.alert()
                .parent(angular.element(document.body))
                .clickOutsideToClose(true)
                .title('Error')
                .textContent(res.data.msg)
                .ok('Got it!')
            );
        });
    };
});
