app1.controller('CompanyCtrl', function($scope, $location, SessionService, AppTranslationService, Company) {
    $scope.sessionData = SessionService.getSessionData();
    $scope.$watch(function() {
        return SessionService.getSessionData();
    }, function(newValue, oldValue) {
        if (newValue != oldValue) {
            $scope.sessionData = newValue;
            if ($scope.sessionData.userData.company) {
                $scope.company = Company.get({
                    id: $scope.sessionData.userData.company._id
                });
            }
        }
    });
    if ($scope.sessionData.userData.company) {
        $scope.company = Company.get({
            id: $scope.sessionData.userData.company._id
        });
    }
    $scope.saveCompanyData = function() {
        SessionService.setSessionData($scope.sessionData);
        Company.update({
            id: $scope.company._id
        }, $scope.company).$promise.then(function() {
            SessionService.init();
            $location.url('/applications');
        });
    }
});
