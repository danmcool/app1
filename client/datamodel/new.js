app1.controller('NewFieldCtrl', ['$scope', '$mdDialog', 'SessionService', 'field_types', function ($scope, $mdDialog, SessionService, field_types) {
    $scope.sessionData = SessionService.getSessionData();
    $scope.$watch(function () {
        return SessionService.getSessionData();
    }, function (newValue, oldValue) {
        if (newValue != oldValue) {
            $scope.sessionData = newValue;
        }
    });

    $scope.field_types = field_types;
    $scope.field = {};

    $scope.hide = function () {
        $mdDialog.hide();
    };

    $scope.cancel = function () {
        $mdDialog.cancel();
    };

    $scope.answer = function () {
        $mdDialog.hide($scope.field);
    };
}]);
