
var app1 = angular.module('app1', ['ngRoute', 'ngResource', 'ngMaterial', 'ngMessages', 'infinite-scroll'])
  .config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('pink')
      .accentPalette('orange');
    $mdThemingProvider.theme('user1')
      .primaryPalette('purple')
      .accentPalette('green');
    $mdThemingProvider.theme('user2')
      .primaryPalette('blue-grey')
      .accentPalette('deep-orange');
    $mdThemingProvider.alwaysWatchTheme(true);
    $mdThemingProvider.generateThemesOnDemand(false);
  })
	.factory('SessionService', function SessionService() {
	  var sessionData = {dynamicTheme:'default'};
    var setSessionData = function setSessionData(newData) { sessionData = newData; }
    var getSessionData = function getSessionData() { return sessionData; }
		return {
         setSessionData: setSessionData,
         getSessionData: getSessionData,
		  }
	 })
/*	.directive('dynamic', function ($compile) {
		return {
			replace: true,
			link: function (scope, ele, attrs) {
			  scope.$watch(attrs.dynamic, function(html) {
				if (!html) {
					return;
				}
				ele.html((typeof(html) === 'string') ? html : html.data);
				$compile(ele.contents())(scope);
			  });
			}
		};
	})
	.factory('TokenService', function TokenService(){
		var token = null;
  	    var setToken = function setToken(someToken) {
		    token = someToken;
		}
		var getToken = function getToken() {
		  return token;
		}
		var request = function request(config) {
			if (token) {
				// jqXHR.setRequestHeader('Authorization','Token token="' + app.user.api_key.access_token + '"');
				config.headers['token'] = token;
			}
			return config;
		}
		return {
			setToken: setToken,
			getToken: getToken,
			request: request
		}
	})
	.config(['$httpProvider', function($httpProvider) {
		$httpProvider.interceptors.push('TokenService');
	}])*/
  .factory('Applications', ['$resource', function($resource){
    return $resource('/api/application/:id', null, {
    'update': { method:'PUT' }
    });
  }])
  .factory('Workflows', ['$resource', function($resource){
    return $resource('/api/workflow/:id', null, {
    'update': { method:'PUT' }
    });
  }])
	.factory('Forms', ['$resource', function($resource){
	  return $resource('/api/form/:id', null, {
		'update': { method:'PUT' }
	  });
	}])
	.factory('Values', ['$resource', function($resource){
	  return $resource('/api/value/:id', null, {
		'update': { method:'PUT' }
	  });
	}])
	.factory('UserProfile', ['$resource', function($resource){
	  return $resource('/api/userprofile/:id', null, {
		'update': { method:'PUT' }
	  });
	}])
	.factory('DataModels', ['$resource', function($resource){
	  return $resource('/api/datamodel/:id', null, {
		'update': { method:'PUT' }
	  });
	}])
	.factory('Files', ['$resource', function($resource){
	  return $resource('/file/:id', null, {
		'update': { method:'PUT' }
	  });
	}])
	.factory('Datas', ['$resource', function ($resource) {
		return $resource('/data/:datamodel_id/:entry_id', {
			datamodel_id: "@datamodel_id",
			entry_id: "@entry_id"}, {'update': { method:'PUT' }
		});
	}])
	.factory('Login', ['$resource', function ($resource) {
	  return $resource('/authentication/login', null, {
		'update': { method:'PUT' }
		});
	}])
	.factory('UserStatus', ['$resource', function ($resource) {
	  return $resource('/authentication/status', null, {
		'update': { method:'PUT' }
		});
	}])
	.factory('Logout', ['$resource', function ($resource) {
	  return $resource('/authentication/logout', null, {
		'update': { method:'PUT' }
		});
	}])
	.factory('Register', ['$resource', function ($resource) {
	  return $resource('/authentication/register', null, {
		'update': { method:'PUT' }
		});
	}])
/*
    $scope.sessionData = SessionService.getSessionData();
    $scope.$watch(function () { return SessionService.getSessionData(); }, function (newValue, oldValue) {
        if (newValue !== oldValue) $scope.sessionData = newValue;
    });
  })*/
	.controller('AppCtrl', function ($scope, $timeout, $mdSidenav, $log, $mdDialog, $mdTheming, UserStatus, Logout, SessionService, Applications, $location) {
        $scope.sessionData = SessionService.getSessionData();
    $scope.$watch(function () { return SessionService.getSessionData(); }, function (newValue, oldValue) {
        if (newValue !== oldValue) $scope.sessionData = newValue;
    });

    $scope.sessionData = {};
    UserStatus.get().$promise.then(function(result) {
        $scope.sessionData.userData = result.user;
        $scope.sessionData.userData.title = result.user.firstname+" "+result.user.lastname+" @ "+result.user.company;
        $scope.sessionData.userData.name = result.user.firstname+" "+result.user.lastname;
        $scope.sessionData.dynamicTheme = 'user1';
        Applications.query().$promise.then(function(result) {
          $scope.sessionData.applications = result;
          SessionService.setSessionData($scope.sessionData);
          $location.url('/applications');
        });
      });
    $scope.closeLeft = function () {
      $mdSidenav('left').close();
    };
    $scope.closeRight = function () {
      $mdSidenav('right').close();
    };

    $scope.login = function(event) {
      $mdSidenav('right').close();
      $mdDialog.show({
      templateUrl: 'core/login.html',
      parent: angular.element(document.body)
      }).then(function(result) {
        $scope.sessionData.userData = result.user;
        $scope.sessionData.userData.title = result.user.firstname+" "+result.user.lastname+" @ "+result.user.company;
        $scope.sessionData.userData.name = result.user.firstname+" "+result.user.lastname;
        $scope.sessionData.dynamicTheme = 'user1';
        Applications.query().$promise.then(function(result) {
          $scope.sessionData.applications = result;
          SessionService.setSessionData($scope.sessionData);
          $location.url('/applications');
        });
      });
    };

    $scope.logout = function () {
      $mdSidenav('right').close();
      Logout.get();
      $scope.sessionData = {dynamicTheme:'default'};
      SessionService.setSessionData($scope.sessionData);
        dynamicTheme = 'default';
        $location.url('/');
    };

		$scope.toggleLeft = buildDelayedToggler('left');
		$scope.toggleRight = buildDelayedToggler('right');

		function debounce(func, wait, context) {
		  var timer;

		  return function debounced() {
			var context = $scope,
				args = Array.prototype.slice.call(arguments);
			$timeout.cancel(timer);
			timer = $timeout(function() {
			  timer = undefined;
			  func.apply(context, args);
			}, wait || 10);
		  };
		}

		function buildDelayedToggler(navID) {
		  return debounce(function() {
			$mdSidenav(navID).toggle();
		  }, 200);
		}
	  })

	//---------------
	// Routes
	//---------------

	.config(['$routeProvider', function ($routeProvider) {
	  $routeProvider
		.when('/form/:id/:entry_id', {
		  templateUrl: 'core/forms.html',
		  controller: 'FormDetailsCtrl'
		})
		.when('/workflows/:application_id', {
		  templateUrl: 'core/workflows.html',
		  controller: 'WorkflowsCtrl'
		})
		.when('/register', {
		  templateUrl: 'core/register.html',
		  controller: 'RegisterCtrl'
		})
		.when('/applications', {
		  templateUrl: 'core/applications.html',
		  controller: 'ApplicationsCtrl'
		})
		.otherwise({
		  redirectTo: '/',
		  templateUrl: 'core/welcome.html'
		});
	}]);
