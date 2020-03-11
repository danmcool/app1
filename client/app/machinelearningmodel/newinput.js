app1.controller('NewInputFieldCtrl', ['$scope', '$mdDialog', 'SessionService', 'datamodel_keys', function ($scope, $mdDialog, SessionService, datamodel_keys) {
    $scope.sessionData = SessionService.getSessionData();
    $scope.$watch(function () {
        return SessionService.getSessionData();
    }, function (newValue, oldValue) {
        if (newValue != oldValue) {
            $scope.sessionData = newValue;
        }
    });

    $scope.datamodel_keys = datamodel_keys;
    $scope.new_selected_field = {};

    $scope.hide = function () {
        $mdDialog.hide();
    };

    $scope.cancel = function () {
        $mdDialog.cancel();
    };

    $scope.answer = function () {
        $mdDialog.hide($scope.new_selected_field);
    };
}]);
