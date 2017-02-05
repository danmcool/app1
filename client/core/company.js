app1.controller('CompanyCtrl',
    function($scope, $location, Company, SessionService, AppTranslationService) {
        $scope.sessionData = SessionService.getSessionData();
        $scope.$watch(function() {
            return SessionService.getSessionData();
        }, function(newValue, oldValue) {
            if (newValue != oldValue) {
                $scope.sessionData = newValue;
            }
        });
        $scope.saveCompanyData = function() {
            SessionService.setSessionData($scope.sessionData);
            Company.update({
                id: $scope.sessionData.userData.company._id
            }, $scope.sessionData.userData.company);
            $location.url('/applications');
        }
    });
