app1.controller('WorkflowEditCtrl', function($scope, SessionService, DesignWorkflow, DesignForm, $location, $routeParams, $mdDialog) {
    $scope.sessionData = SessionService.getSessionData();
    $scope.$watch(function() {
        return SessionService.getSessionData();
    }, function(newValue, oldValue) {
        if (newValue != oldValue) {
            $scope.sessionData = newValue;
        }
    });

    DesignWorkflow.get({
        id: $routeParams.id
    }, function(resultWorkflow, err) {
        for (var i = 0; i < resultWorkflow.forms.length; i++) {
            resultWorkflow.forms[i].translated_name = SessionService.translate(resultWorkflow.forms[i].name);
            resultWorkflow.forms[i].translated_description = SessionService.translate(resultWorkflow.forms[i].description);
        }
        $scope.workflow = resultWorkflow;
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

    $scope.editForm = function(formId) {
        DesignWorkflow.update({
            id: $scope.workflow._id
        }, $scope.workflow).$promise.then(function(res) {
            SessionService.init();
            $location.url('/form_edit/' + formId + '?application_id=' + $routeParams.application_id + '&workflow_id=' + $scope.workflow._id);
        }).catch(function(res) {
            $scope.application = res.application;
            updateErrorAlert();
        });
    }

    $scope.newForm = function() {
        $mdDialog.show(
            $mdDialog.prompt()
            .parent(angular.element(document.body))
            .clickOutsideToClose(true)
            .title($scope.sessionData.appData.new_workflow)
            .textContent($scope.sessionData.appData.new_workflow_name)
            .initialValue('My Form')
            .ok($scope.sessionData.appData.ok)
            .cancel($scope.sessionData.appData.cancel)
        ).then(function(result) {
            var newForm = new DesignForm({
                name: {
                    en: result
                }
            });
            newForm.$save(function() {
                newForm.translated_name = newForm.name.en;
                $scope.workflow.forms.push(newForm);
            });
        });
    }

    $scope.save = function() {
        DesignWorkflow.update({
            id: $scope.workflow._id
        }, $scope.workflow).$promise.then(function(res) {
            SessionService.init();
            $location.url('/application_edit/' + $routeParams.application_id);
        }).catch(function(res) {
            $scope.application = res.application;
            updateErrorAlert();
        });
    }
});
