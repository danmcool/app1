app1.controller('UserCtrl',
    function($scope, $location, User, SessionService) {
        $scope.theme = "default";
        $scope.sessionData = SessionService.getSessionData();
        $scope.$watch(function() {
            return SessionService.getSessionData();
        }, function(newValue, oldValue) {
            if (newValue !== oldValue) {
                $scope.sessionData = newValue;
            }
        });
        $scope.saveUserData = function() {
            $scope.sessionData.userData.properties.theme = $scope.theme;
            SessionService.setSessionData($scope.sessionData);
            User.update({
                id: $scope.sessionData.userData._id
            }, {
                "_id": $scope.sessionData.userData._id,
                "properties": $scope.sessionData.userData.properties
            });
        }
    });
