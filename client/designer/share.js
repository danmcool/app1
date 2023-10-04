app1.controller('ApplicationShareCtrl', ['$scope', 'SessionService', 'DesignApplication', 'Share', '$location', '$routeParams', '$mdDialog', function ($scope, SessionService, DesignApplication, Share, $location, $routeParams, $mdDialog) {
    $scope.sessionData = SessionService.getSessionData();
    $scope.$watch(function () {
        return SessionService.getSessionData();
    }, function (newValue, oldValue) {
        if (newValue != oldValue) {
            $scope.sessionData = newValue;
        }
    });

    DesignApplication.get({
        id: $routeParams.id
    }, function (resultApp, err) {
        if (resultApp.workflows) {
            for (var i = 0; i < resultApp.workflows.length; i++) {
                resultApp.workflows[i].translated_name = SessionService.translate(resultApp.workflows[i].name);
                resultApp.workflows[i].translated_description = SessionService.translate(resultApp.workflows[i].description);
            }
        }
        $scope.application = resultApp;
        $scope.sessionData.applicationName = $scope.sessionData.appData.app_designer;
        SessionService.setSessionData($scope.sessionData);
    });

    $scope.save = function () {
        DesignApplication.update({
            id: $scope.application._id
        }, $scope.application, function (res) {
            SessionService.init();
            SessionService.location('/designer');
        }, function (res) {
            $scope.application = res.application;
            updateErrorAlert();
        });
    }
}]);
