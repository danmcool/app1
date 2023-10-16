app1.controller('NewOutputFieldCtrl', ['$scope', '$mdDialog', 'SessionService', 'datamodel_keys', function ($scope, $mdDialog, SessionService, datamodel_keys) {
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
    $scope.show_values = false;

    $scope.hide = function () {
        $mdDialog.hide();
    };

    $scope.cancel = function () {
        $mdDialog.cancel();
    };

    $scope.changeField = function () {
        if ($scope.new_selected_field.id) $scope.show_values = true;
        else $scope.show_values = false;
    }

    $scope.answer = function () {
        $scope.new_selected_field.values = $scope.field_values;
        $mdDialog.hide($scope.new_selected_field);
    };
}]);
