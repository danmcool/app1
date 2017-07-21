app1.controller('FileCtrl', ['$scope', '$routeParams', '$location', 'SessionService', 'FileUrl', function ($scope, $routeParams, $location, SessionService, FileUrl) {
	$scope.sessionData = SessionService.getSessionData();
	$scope.workflow = false;
	$scope.workflow_translated_name = null;

	var initFile = function () {
		if ($routeParams.iframe_file == 'undefined' || $routeParams.application_id == 'undefined') {
			$location.url('/applications');
		} else {
			$scope.sessionData.application_id = $routeParams.application_id;
			if ($scope.sessionData.applications) {
				var apps = $scope.sessionData.applications;
				for (var i = 0; i < apps.length; i++) {
					apps[i].translated_name = SessionService.translate(apps[i].name);
					apps[i].translated_description = SessionService.translate(apps[i].description);
					if (apps[i]._id == $routeParams.application_id) {
						$scope.sessionData.applicationName = apps[i].translated_name;
						if ($routeParams.workflow_id) {
							for (var j = 0; j < apps[i].workflows.length; j++) {
								if (apps[i].workflows[j]._id == $routeParams.workflow_id) {
									$scope.workflow_translated_name = SessionService.translate(apps[i].workflows[j].name);
								}
							}
						}
						break;
					}
				}
				SessionService.setSessionData($scope.sessionData);
			}
			if ($routeParams.workflow_id) {
				$scope.workflow = true;
			}
			FileUrl.get({
				id: $routeParams.iframe_file
			}, function (file) {
				document.getElementById('iframe_file').src = 'https://docs.google.com/viewer?url=' +
					encodeURIComponent(file.url).replace(/'/g, "%27").replace(/"/g, "%22") + '&embedded=true';
			});
		}
	}

	$scope.$watch(function () {
		return SessionService.getSessionData().applications;
	}, function (newValue, oldValue) {
		if (newValue != oldValue) {
			$scope.sessionData = SessionService.getSessionData();
			initFile();
		}
	});

	$scope.home = function () {
		$location.url('/workflows/' + $routeParams.application_id);
	}

	initFile();
}]);
