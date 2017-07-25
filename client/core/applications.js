app1.controller('ApplicationsCtrl', ['$scope', 'SessionService', '$location', function ($scope, SessionService, $location) {
	$scope.sessionData = SessionService.getSessionData();
	$scope.sessionData.applicationName = $scope.sessionData.appData.home;
	SessionService.setSessionData($scope.sessionData);

	$scope.$watch(function () {
		return SessionService.getSessionData();
	}, function (newValue, oldValue) {
		if (newValue != oldValue) {
			$scope.sessionData = newValue;
			$scope.sessionData.applicationName = $scope.sessionData.appData.home;
			SessionService.setSessionData($scope.sessionData);
		}
	});
	$scope.open = function (application) {
		if (application.type == 'url') {
			SessionService.location('/url/' + application._id + '?iframe_url=' + application.url);
		} else if (application.type == 'file') {
			SessionService.location('/file/' + application._id + '?iframe_file=' + application.file);
		} else {
			SessionService.location('/workflows/' + application._id);
		}
	}
}]);
