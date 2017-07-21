app1.controller('WorkflowsCtrl', ['$scope', '$routeParams', '$location', 'SessionService', function ($scope, $routeParams, $location, SessionService) {
	$scope.sessionData = SessionService.getSessionData();

	var initWorkflows = function () {
		if ($routeParams.application_id == 'undefined') {
			$location.url('/applications');
		} else {
			$scope.sessionData.application_id = $routeParams.application_id;
			if ($scope.sessionData.applications) {
				var apps = $scope.sessionData.applications;
				for (var i = 0; i < apps.length; i++) {
					apps[i].translated_name = SessionService.translate(apps[i].name);
					apps[i].translated_description = SessionService.translate(apps[i].description);
					if (apps[i]._id == $routeParams.application_id) {
						$scope.workflows = apps[i].workflows;
						$scope.sessionData.applicationName = apps[i].translated_name;
						break;
					}
				}
				for (var i = 0; i < $scope.workflows.length; i++) {
					$scope.workflows[i].translated_name = SessionService.translate($scope.workflows[i].name);
					$scope.workflows[i].translated_description = SessionService.translate($scope.workflows[i].description);
				}
				$scope.sessionData.showShareForm = false;
				SessionService.setSessionData($scope.sessionData);
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
			$location.url('/url/' + $routeParams.application_id + '?iframe_url=' + workflow.url + '&workflow_id=' + workflow._id);
		} else if (workflow.type == 'file') {
			$location.url('/file/' + $routeParams.application_id + '?iframe_file=' + workflow.file + '&workflow_id=' + workflow._id);
		} else {
			$location.url('/form/' + workflow.startup_form + '/0?application_id=' + $routeParams.application_id);
		}
	}

	initWorkflows();
}]);
