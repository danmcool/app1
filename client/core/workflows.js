app1.controller('WorkflowsCtrl', ['$scope', '$routeParams', 'Workflows', '$location', 'SessionService',
  function ($scope, $routeParams, Workflows, $location, SessionService) {
	  $scope.workflows = Workflows.query({application_id:$routeParams.application_id});
    $scope.sessionData = SessionService.getSessionData();
    $scope.sessionData.application_id = $routeParams.application_id;
    SessionService.setSessionData($scope.sessionData);

	  $scope.open = function(href) {
		$location.url("/form/"+href+"/0");
	  }
	}]);
