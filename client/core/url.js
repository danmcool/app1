app1.controller('UrlCtrl', ['$scope', '$routeParams', '$location', 'SessionService', function ($scope, $routeParams, $location, SessionService) {
	$scope.sessionData = SessionService.getSessionData();

	var initUrl = function () {
		if ($routeParams.url_iframe == 'undefined' || $routeParams.application_id == 'undefined') {
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
						break;
					}
				}
				SessionService.setSessionData($scope.sessionData);
			}
			document.getElementById('iframe_url').src = $routeParams.iframe_url;
		}
	}

	$scope.$watch(function () {
		return SessionService.getSessionData().applications;
	}, function (newValue, oldValue) {
		if (newValue != oldValue) {
			$scope.sessionData = SessionService.getSessionData();
			initUrl();
		}
	});

	initUrl();
}]);
