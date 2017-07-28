app1.controller('FormDisplayEditCtrl', ['$scope', '$routeParams', 'SessionService', 'DesignForm', 'DesignDataModel', function ($scope, $routeParams, SessionService, DesignForm, DesignDataModel) {
    $scope.sessionData = SessionService.getSessionData();
    $scope.$watch(function () {
        return SessionService.getSessionData();
    }, function (newValue, oldValue) {
        if (newValue != oldValue) {
            $scope.sessionData = newValue;
        }
    });
    $scope.section_index = $routeParams.section;
    $scope.block_index = $routeParams.block;
    $scope.field_index = $routeParams.field;

    DesignForm.get({
        id: $routeParams.id
    }, function (resultForm, err) {
        $scope.form = resultForm;
        $scope.form.translated_name = SessionService.translate($scope.form.name);
        $scope.field = $scope.form.display[$scope.section_index].blocks[$scope.block_index].fields[$scope.field_index];
        $scope.datamodel_keys = [];
        var datamodelkeys = Object.keys($scope.form.datamodel.translation);
        for (var i = 0; i < datamodelkeys.length; i++) {
            $scope.datamodel_keys.push({
                translated_name: SessionService.translate($scope.form.datamodel.translation[datamodelkeys[i]]),
                id: datamodelkeys[i]
            });
        }
        for (var i = 0; i < $scope.form.actions.length; i++) {
            $scope.form.actions[i].translated_name = SessionService.translate($scope.form.actions[i].name);
        }
        for (var i = 0; i < $scope.form.values.length; i++) {
            $scope.form.values[i].translated_name = SessionService.translate($scope.form.values[i].name);
        }
        $scope.sessionData.applicationName = $scope.sessionData.appData.app_designer;
        SessionService.setSessionData($scope.sessionData);
    });
}]);
