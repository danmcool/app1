app1.factory('DesignApplication', ['$resource',
    function($resource) {
        return $resource('/client/design/application/:id', null, {
            'update': {
                method: 'PUT'
            }
        });
    }
]).controller('ApplicationEditCtrl', function($scope, SessionService, DesignApplication, $location, $routeParams) {
    $scope.sessionData = SessionService.getSessionData();
    $scope.$watch(function() {
        return SessionService.getSessionData();
    }, function(newValue, oldValue) {
        if (newValue != oldValue) {
            $scope.sessionData = newValue;
        }
    });

    DesignApplication.get({
        id: $routeParams.id
    }, function(result, err) {
        for (var i = 0; i < result.workflows.length; i++) {
            result.workflows[i].translated_name = SessionService.translate(result.workflows[i].name);
            result.workflows[i].translated_description = SessionService.translate(result.workflows[i].description);
        }
        $scope.application = result;
    });

    $scope.open = function(application_id) {
        $location.url('/workflows/' + application_id);
    }
});
