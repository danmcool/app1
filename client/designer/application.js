app1.controller('ApplicationEditCtrl', function($scope, SessionService, DesignApplication, DesignWorkflow, $location, $routeParams, $mdDialog) {
    $scope.sessionData = SessionService.getSessionData();
    $scope.$watch(function() {
        return SessionService.getSessionData();
    }, function(newValue, oldValue) {
        if (newValue != oldValue) {
            $scope.sessionData = newValue;
        }
    });

    DesignApplication.get({
        id: $routeParams.id
    }, function(resultApp, err) {
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

    $scope.editText = function(object, property, multipleLines) {
        $mdDialog.show({
            templateUrl: 'designer/text.html',
            controller: 'TextCtrl',
            locals: {
                text: object[property],
                multipleLines: multipleLines
            },
            parent: angular.element(document.body),
            clickOutsideToClose: true
        }).then(function(result) {
            object[property] = result;
        });
    };

    $scope.editWorkflow = function(workflowId) {
        DesignApplication.update({
            id: $scope.application._id
        }, $scope.application).$promise.then(function(res) {
            SessionService.init();
            $location.url('/workflow_edit/' + workflowId + '?application_id=' + $scope.application._id);
        }).catch(function(res) {
            $scope.application = res.application;
            updateErrorAlert();
        });
    }

    $scope.newWorkflow = function() {
        $mdDialog.show(
            $mdDialog.prompt()
            .parent(angular.element(document.body))
            .clickOutsideToClose(true)
            .title($scope.sessionData.appData.new_workflow)
            .textContent($scope.sessionData.appData.new_workflow_name)
            .initialValue('My Workflow')
            .ok($scope.sessionData.appData.ok)
            .cancel($scope.sessionData.appData.cancel)
        ).then(function(result) {
            var newWorkflow = new DesignWorkflow({
                name: {
                    en: result
                }
            });
            newWorkflow.$save(function() {
                newWorkflow.translated_name = newWorkflow.name.en;
                $scope.application.workflows.push(newWorkflow);
            });
        });
    }

    $scope.save = function() {
        DesignApplication.update({
            id: $scope.application._id
        }, $scope.application).$promise.then(function(res) {
            SessionService.init();
            $location.url('/designer');
        }).catch(function(res) {
            $scope.application = res.application;
            updateErrorAlert();
        });
    }

});
