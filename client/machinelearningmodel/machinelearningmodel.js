app1.controller('MachineLearningModelCtrl', ['$scope', 'SessionService', 'DesignMachineLearningModel', '$location', '$routeParams', '$mdDialog', function ($scope, SessionService, DesignMachineLearningModel, $location, $routeParams, $mdDialog) {
    ga('send', 'pageview', '/machinelearningmodel');

    $scope.sessionData = SessionService.getSessionData();
    $scope.$watch(function () {
        return SessionService.getSessionData();
    }, function (newValue, oldValue) {
        if (newValue != oldValue) {
            $scope.sessionData = newValue;
        }
    });

    $scope.sessionData.applicationName = $scope.sessionData.appData.machinelearningmodel_designer;
    SessionService.setSessionData($scope.sessionData);

    $scope.machinelearningmodels = [];
    $scope.skip = 0;
    $scope.limit = 10;
    $scope.stopScroll = false;

    $scope.getNextMachineLearningModels = function () {
        if ($scope.stopScroll) return;
        if ($scope.tempStopScroll) return;
        var localLimit = $scope.limit;
        var localSkip = $scope.skip;
        $scope.skip += $scope.limit;
        $scope.tempStopScroll = true;
        DesignMachineLearningModel.query({
            skip: localSkip,
            limit: localLimit,
        }, function (machinelearningmodelsResult) {
            if (machinelearningmodelsResult.length < $scope.limit) {
                $scope.stopScroll = true;
            }
            if (machinelearningmodelsResult && machinelearningmodelsResult.length > 0) {
                for (var i = 0; i < machinelearningmodelsResult.length; i++) {
                    machinelearningmodelsResult[i].translated_name = SessionService.translate(machinelearningmodelsResult[i].name);
                    machinelearningmodelsResult[i].translated_description = SessionService.translate(machinelearningmodelsResult[i].description);
                    $scope.machinelearningmodels.push(machinelearningmodelsResult[i]);
                }
            }
            $scope.tempStopScroll = false;
        });
    }

    $scope.getNextMachineLearningModels();

    $scope.editMachineLearningModel = function (machinelearningmodelId) {
        SessionService.location('/machinelearningmodel/' + machinelearningmodelId);
    }

    $scope.deleteMachineLearningModel = function (machinelearningmodelId) {
        $mdDialog.show(
            $mdDialog.confirm()
            .parent(angular.element(document.body))
            .clickOutsideToClose(true)
            .title($scope.sessionData.appData.confirmation)
            .textContent($scope.sessionData.appData.removal_confirmation)
            .ok($scope.sessionData.appData.ok)
            .cancel($scope.sessionData.appData.cancel)).then(
            function () {
                DesignMachineLearningModel.remove({
                    id: machinelearningmodelId
                }, function (res) {
                    if (res) {
                        SessionService.location('/machinelearningmodel/');
                    }
                })
            });
    }

    $scope.newMachineLearningModel = function () {
        $mdDialog.show(
            $mdDialog.prompt()
            .parent(angular.element(document.body))
            .clickOutsideToClose(true)
            .title($scope.sessionData.appData.new_machinelearningmodel_name)
            .initialValue('My Machine Learning Model')
            .ok($scope.sessionData.appData.ok)
            .cancel($scope.sessionData.appData.cancel)).then(
            function (result) {
                var name = {};
                name[$scope.sessionData.userData.properties.correctedLanguage] = result;
                var newMachineLearningmodel = new DesignMachineLearningModel({
                    name: name
                });
                newMachineLearningmodel.$save(function () {
                    SessionService.location('/machinelearningmodel/' + newMachineLearningmodel._id);
                });
            });
    }
}]);
