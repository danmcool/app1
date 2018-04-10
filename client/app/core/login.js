app1.controller('LoginCtrl', ['$scope', 'Login', 'SessionService', function ($scope, Login, SessionService) {
	$scope.sessionData = SessionService.getSessionData();
	$scope.sessionData.applicationName = 'App1';
	SessionService.setSessionData($scope.sessionData);

	$scope.login = function (user, password) {
		SessionService.login(user, password);
	};
}]);
