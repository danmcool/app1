app1.controller('LoginCtrl', ['$scope', '$location', '$mdDialog', 'Login', 'Logout', /*'TokenService',*/
  function ($scope, $location, $mdDialog, Login, Logout/*, TokenService*/) {
	$scope.close = function() {
		$mdDialog.cancel();
	};
	$scope.login = function(user, password, code) {
		loginObject = new Login({user:user, password:password, _company_code:code});
		loginObject.$save( function(object) {
			//TokenService.setToken(object.token);
			$mdDialog.hide(object);
		});
	};
}]);
