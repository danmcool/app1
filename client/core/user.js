app1.controller('UserCtrl', function($scope, $location, $resource, SessionService, AppTranslationService, User, Password) {
    var User = $resource('/client/user/:id', null, {
        'update': {
            method: 'PUT'
        }
    });

    $scope.password = {
        current: '',
        new: '',
        repeat: ''
    };
    $scope.sessionData = SessionService.getSessionData();
    $scope.$watch(function() {
        return SessionService.getSessionData();
    }, function(newValue, oldValue) {
        if (newValue != oldValue) {
            $scope.sessionData = newValue;
        }
    });
    $scope.saveUserData = function() {
        $scope.sessionData.appData = AppTranslationService.translate($scope.sessionData.userData.properties.language);
        SessionService.setSessionData($scope.sessionData);
        User.update({
            id: $scope.sessionData.userData._id
        }, {
            "properties": $scope.sessionData.userData.properties
        });
        $location.url('/applications');
    }
    $scope.changeUserPassword = function() {
        Password.update({
            old: $scope.password.old,
            new: $scope.password.new
        });
        $location.url('/applications');
    }
    $scope.validatePassword = function() {
        if ($scope.password.new == $scope.password.repeat) {
            $scope.userPasswordForm.password_repeat.$setValidity('userPasswordForm.password_repeat.$error.match', true);
        } else {
            $scope.userPasswordForm.password_repeat.$setValidity('userPasswordForm.password_repeat.$error.match', false);
        }
    }
});
