app1.controller('ApplicationsCtrl', ['$scope', 'SessionService', '$location', function ($scope, SessionService, $location) {
    $scope.sessionData = SessionService.getSessionData();
    $scope.$watch(function () { return SessionService.getSessionData(); }, function (newValue, oldValue) {
        if (newValue !== oldValue) $scope.sessionData = newValue;
    });
	  $scope.open = function(application_id) {
		  $location.url("/workflows/"+application_id);
	  }
	}]);
