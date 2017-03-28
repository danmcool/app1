app1.factory('DesignForm', ['$resource',
    function($resource) {
        return $resource('/client/design/workflow/:id', null, {
            'update': {
                method: 'PUT'
            }
        });
    }
]).controller('FormEditCtrl', function($scope, SessionService, DesignForm, $location, $routeParams, $mdDialog) {
    $scope.sessionData = SessionService.getSessionData();
    $scope.$watch(function() {
        return SessionService.getSessionData();
    }, function(newValue, oldValue) {
        if (newValue != oldValue) {
            $scope.sessionData = newValue;
        }
    });

    DesignForm.get({
        id: $routeParams.id
    }, function(resultForm, err) {
        //for (var i = 0; i < resultForm.actions.length; i++) {
        //    resultForm.actions[i].translated_name = SessionService.translate(resultForm.actions[i].name);
        //    resultForm.actions[i].translated_description = SessionService.translate(resultForm.actions[i].description);
        //}
        $scope.form = resultForm;
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

    $scope.editAction = function(formId) {
        $location.url('/form_edit/' + formId);
    }

    $scope.newAction = function() {
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

    $scope.newSection = function() {
        $mdDialog.show(
            $mdDialog.prompt()
            .parent(angular.element(document.body))
            .clickOutsideToClose(true)
            .title($scope.sessionData.appData.new_field)
            .textContent($scope.sessionData.appData.new_field_name)
            .initialValue('New Field')
            .ok($scope.sessionData.appData.ok)
            .cancel($scope.sessionData.appData.cancel)
        ).then(function(result) {
            if (!$scope.form.display) {
                $scope.form.display = [];
            }
            $scope.form.display.push({'blocks':[{'fields':[{'name':result}]}]});
        });
    }

    $scope.newBlock = function(blocks) {
        $mdDialog.show(
            $mdDialog.prompt()
            .parent(angular.element(document.body))
            .clickOutsideToClose(true)
            .title($scope.sessionData.appData.new_field)
            .textContent($scope.sessionData.appData.new_field_name)
            .initialValue('New Field')
            .ok($scope.sessionData.appData.ok)
            .cancel($scope.sessionData.appData.cancel)
        ).then(function(result) {
            if (!$scope.form.display) {
                $scope.form.display = [];
            }
            blocks.push({'fields':[{'name':result}]});
        });
    }

    $scope.newField = function(fields) {
        $mdDialog.show(
            $mdDialog.prompt()
            .parent(angular.element(document.body))
            .clickOutsideToClose(true)
            .title($scope.sessionData.appData.new_field)
            .textContent($scope.sessionData.appData.new_field_name)
            .initialValue('New Field')
            .ok($scope.sessionData.appData.ok)
            .cancel($scope.sessionData.appData.cancel)
        ).then(function(result) {
            if (!$scope.form.display) {
                $scope.form.display = [];
            }
            fields.push({'name':result});
        });
    }

    $scope.save = function() {
        DesignWorkflow.update({
            id: $scope.workflow._id
        }, $scope.workflow).$promise.then(function(res) {
            SessionService.init();
            $location.url('/designer');
        }).catch(function(res) {
            $scope.application = res.application;
            updateErrorAlert();
        });
    }
});
