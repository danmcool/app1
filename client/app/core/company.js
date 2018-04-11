app1.controller('CompanyCtrl', ['$scope', '$location', 'SessionService', 'AppTranslationService', 'Company', function ($scope, $location, SessionService, AppTranslationService, Company) {
    ga('send', 'pageview', '/app/company');

    $scope.sessionData = SessionService.getSessionData();
    $scope.sessionData.applicationName = 'App1';
    SessionService.setSessionData($scope.sessionData);

    $scope.$watch(function () {
        return SessionService.getSessionData();
    }, function (newValue, oldValue) {
        if (newValue != oldValue) {
            $scope.sessionData = newValue;
            if ($scope.sessionData.userData.company) {
                $scope.company = Company.get({
                    id: $scope.sessionData.userData.company._id
                });
            }
            $scope.sessionData.applicationName = 'App1';
            SessionService.setSessionData($scope.sessionData);
        }
    });
    if ($scope.sessionData.userData.company) {
        $scope.company = Company.get({
            id: $scope.sessionData.userData.company._id
        });
    }
    $scope.saveCompanyData = function () {
        SessionService.setSessionData($scope.sessionData);
        Company.update({
            id: $scope.company._id
        }, $scope.company, function () {
            SessionService.init();
            SessionService.location('/applications');
        });
    }
}]);
