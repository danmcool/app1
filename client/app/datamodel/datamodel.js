app1.controller('DatamodelCtrl', ['$scope', 'SessionService', 'DesignDataModel', '$location', '$routeParams', '$mdDialog', function ($scope, SessionService, DesignDataModel, $location, $routeParams, $mdDialog) {
    $scope.sessionData = SessionService.getSessionData();
    $scope.$watch(function () {
        return SessionService.getSessionData();
    }, function (newValue, oldValue) {
        if (newValue != oldValue) {
            $scope.sessionData = newValue;
        }
    });

    $scope.sessionData.applicationName = $scope.sessionData.appData.datamodel_designer;
    SessionService.setSessionData($scope.sessionData);

    $scope.datamodels = [];
    $scope.skip = 0;
    $scope.limit = 10;
    $scope.stopScroll = false;

    $scope.getNextDatamodels = function () {
        if ($scope.stopScroll) return;
        if ($scope.tempStopScroll) return;
        var localLimit = $scope.limit;
        var localSkip = $scope.skip;
        $scope.skip += $scope.limit;
        $scope.tempStopScroll = true;
        DesignDataModel.query({
            skip: localSkip,
            limit: localLimit,
        }, function (datamodelsResult) {
            if (datamodelsResult.length < $scope.limit) {
                $scope.stopScroll = true;
            }
            if (datamodelsResult && datamodelsResult.length > 0) {
                for (var i = 0; i < datamodelsResult.length; i++) {
                    datamodelsResult[i].translated_name = SessionService.translate(datamodelsResult[i].name);
                    datamodelsResult[i].translated_description = SessionService.translate(datamodelsResult[i].description);
                    $scope.datamodels.push(datamodelsResult[i]);
                }
            }
            $scope.tempStopScroll = false;
        });
    }

    $scope.getNextDatamodels();

    $scope.editDatamodel = function (datamodelId) {
        SessionService.location('/datamodel/' + datamodelId);
    }

    $scope.deleteDatamodel = function (datamodelId) {
        SessionService.location('/datamodel/' + datamodelId);
    }

    $scope.newDatamodel = function () {
        $mdDialog.show(
            $mdDialog.prompt()
            .parent(angular.element(document.body))
            .clickOutsideToClose(true)
            .title($scope.sessionData.appData.new_datamodel_name)
            .initialValue('My Datamodel')
            .ok($scope.sessionData.appData.ok)
            .cancel($scope.sessionData.appData.cancel)).then(
            function (result) {
                var name = {};
                name[$scope.sessionData.userData.properties.correctedLanguage] = result;
                var newDatamodel = new DesignDataModel({
                    name: name
                });
                newDatamodel.$save(function () {
                    SessionService.location('/datamodel/' + newDatamodel._id);
                });
            });
    }
}]);
