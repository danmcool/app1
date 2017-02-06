app1.controller('CompanyCtrl',
    function($scope, $location, Company, SessionService, AppTranslationService) {
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
            }, $scope.company);
            $location.url('/applications');
        }
    });
