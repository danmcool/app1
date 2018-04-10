app1.controller('NewValueCtrl', ['$scope', '$mdDialog', 'SessionService', 'DesignValue', function ($scope, $mdDialog, SessionService, DesignValue) {
    $scope.sessionData = SessionService.getSessionData();
    $scope.$watch(function () {
        return SessionService.getSessionData();
    }, function (newValue, oldValue) {
        if (newValue != oldValue) {
            $scope.sessionData = newValue;
        }
    });
    $scope.values = [];
    $scope.values.push({
        id: '',
        translated_name: $scope.sessionData.appData.new_value
    });
    $scope.value_id;

    DesignValue.query({
        skip: 0,
        limit: 500,
    }, function (values) {
        for (var i = 0; i < values.length; i++) {
            $scope.values.push({
                id: values[i]._id,
                translated_name: SessionService.translate(values[i].name)
            });
        }
    });

    $scope.hide = function () {
        $mdDialog.hide();
    };

    $scope.cancel = function () {
        $mdDialog.cancel();
    };

    $scope.answer = function (value_id) {
        $mdDialog.hide(value_id);
    };
}]);
