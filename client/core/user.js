app1.controller('UserCtrl', ['$scope', '$location', 'SessionService', 'AppTranslationService', 'User', 'Password', function ($scope, $location, SessionService, AppTranslationService, User, Password) {
	$scope.password = {
		current: '',
		new: '',
		repeat: ''
	};

	$scope.sessionData = SessionService.getSessionData();
	$scope.sessionData.applicationName = 'App1';
	SessionService.setSessionData($scope.sessionData);

	$scope.$watch(function () {
		return SessionService.getSessionData();
	}, function (newValue, oldValue) {
		if (newValue != oldValue) {
			$scope.sessionData = newValue;
			$scope.sessionData.applicationName = 'App1';
			SessionService.setSessionData($scope.sessionData);
		}
	});

	$scope.saveUserData = function () {
		$scope.sessionData.appData = AppTranslationService.translate($scope.sessionData.userData.properties.language);
		SessionService.setSessionData($scope.sessionData);
		User.update({
			id: $scope.sessionData.userData._id
		}, {
			"properties": $scope.sessionData.userData.properties
		});
		SessionService.location('/applications');
	}
	$scope.changeUserPassword = function () {
		Password.update({
			old: $scope.password.old,
			new: $scope.password.new
		});
		SessionService.location('/applications');
	}
	$scope.validatePassword = function () {
		if ($scope.password.new == $scope.password.repeat) {
			$scope.userPasswordForm.password_repeat.$setValidity('userPasswordForm.password_repeat.$error.match', true);
		} else {
			$scope.userPasswordForm.password_repeat.$setValidity('userPasswordForm.password_repeat.$error.match', false);
		}
	}
}]);
