app1.controller('WorkflowsCtrl', ['$scope', '$routeParams', '$location', 'SessionService', 'Applications', function ($scope, $routeParams, $location, SessionService, Applications) {
    $scope.sessionData = SessionService.getSessionData();

    var initWorkflows = function () {
        if ($routeParams.application_id == 'undefined') {
            SessionService.location('/applications');
        } else {
            var appFound = false;
            $scope.sessionData.application_id = $routeParams.application_id;
            if ($scope.sessionData.applications) {
                var apps = $scope.sessionData.applications;
                for (var i = 0; i < apps.length; i++) {
                    if (apps[i].remote) {
                        apps[i].translated_name = SessionService.translate(apps[i].name) + ' (' + apps[i].company_name + ')';
                    } else {
                        apps[i].translated_name = SessionService.translate(apps[i].name);
                    }
                    apps[i].translated_description = SessionService.translate(apps[i].description);
                    if (apps[i]._id == $routeParams.application_id && $routeParams.pid == apps[i].pid) {
                        $scope.workflows = apps[i].workflows;
                        $scope.sessionData.applicationName = apps[i].translated_name;
                        appFound = true;
                        break;
                    }
                }
                if (appFound) {
                    for (var i = 0; i < $scope.workflows.length; i++) {
                        $scope.workflows[i].translated_name = SessionService.translate($scope.workflows[i].name);
                        $scope.workflows[i].translated_description = SessionService.translate($scope.workflows[i].description);
                    }
                    $scope.sessionData.showShareForm = false;
                    SessionService.setSessionData($scope.sessionData);
                } else {
                    if ($routeParams.test) {
                        Applications.get({
                            id: $routeParams.application_id
                        }, function (appResult) {
                            if (!$scope.sessionData.applications) {
                                $scope.sessionData.applications = [];
                            }
                            $scope.sessionData.applications.push(appResult);
                            initWorkflows();
                        });
                    }
                }
            }
        }
    }
    $scope.$watch(function () {
        return SessionService.getSessionData().applications;
    }, function (newValue, oldValue) {
        if (newValue != oldValue) {
            $scope.sessionData = SessionService.getSessionData();
            initWorkflows();
        }
    });

    $scope.open = function (workflow) {
        if (workflow.type == 'url') {
            SessionService.location('/url/' + $routeParams.application_id + '?iframe_url=' + workflow.url + '&workflow_id=' + workflow._id);
        } else if (workflow.type == 'file') {
            SessionService.location('/file/' + $routeParams.application_id + '?iframe_file=' + workflow.file + '&workflow_id=' + workflow._id);
        } else {
            if ($routeParams.pid) {
                SessionService.location('/form/' + workflow.startup_form + '/0?application_id=' + $routeParams.application_id + '&workflow_id=' + workflow._id + '&pid=' + $routeParams.pid);
            } else {
                SessionService.location('/form/' + workflow.startup_form + '/0?application_id=' + $routeParams.application_id + '&workflow_id=' + workflow._id);
            }
        }
    }

    initWorkflows();
}]);
