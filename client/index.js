var app1 = angular.module('app1', ['ngRoute', 'ngResource', 'ngMaterial', 'ngMessages', 'infinite-scroll']).config(['$mdThemingProvider', function ($mdThemingProvider) {
	$mdThemingProvider.theme('default')
		.primaryPalette('blue-grey')
		.accentPalette('amber');
	$mdThemingProvider.theme('user1')
		.primaryPalette('purple')
		.accentPalette('green');
	$mdThemingProvider.theme('user2')
		.primaryPalette('pink')
		.accentPalette('orange');
	$mdThemingProvider.theme('user3')
		.primaryPalette('blue')
		.accentPalette('light-blue');
	$mdThemingProvider.alwaysWatchTheme(true);
	$mdThemingProvider.generateThemesOnDemand(false);
}]).factory('Applications', ['$resource',
    function ($resource) {
		return $resource('/client/application/:id', null, {
			'update': {
				method: 'PUT'
			}
		});
    }
]).factory('User', ['$resource',
    function ($resource) {
		return $resource('/client/user/:id', null, {
			'update': {
				method: 'PUT'
			}
		});
    }
]).factory('Password', ['$resource',
    function ($resource) {
		return $resource('/authentication/password', null, {
			'update': {
				method: 'PUT'
			}
		});
    }
]).factory('Company', ['$resource',
    function ($resource) {
		return $resource('/client/company/:id', null, {
			'update': {
				method: 'PUT'
			}
		});
    }
]).factory('Login', ['$resource',
    function ($resource) {
		return $resource('/authentication/login', null, {
			'update': {
				method: 'PUT'
			}
		});
    }
]).factory('UserStatus', ['$resource',
    function ($resource) {
		return $resource('/authentication/status', null, {
			'update': {
				method: 'PUT'
			}
		});
    }
]).factory('Logout', ['$resource',
    function ($resource) {
		return $resource('/authentication/logout', null, {
			'update': {
				method: 'PUT'
			}
		});
    }
]).factory('Register', ['$resource',
    function ($resource) {
		return $resource('/authentication/register', null, {
			'update': {
				method: 'PUT'
			}
		});
    }
]).factory('Notify', ['$resource',
    function ($resource) {
		return $resource('/client/notify/:user_id', null, {
			'update': {
				method: 'PUT'
			}
		});
    }
]).factory('Forms', ['$resource',
    function ($resource) {
		return $resource('/client/form/:id', null, {
			'update': {
				method: 'PUT'
			}
		});
    }
]).factory('Value', ['$resource',
    function ($resource) {
		return $resource('/client/value/:id', null, {
			'update': {
				method: 'PUT'
			}
		});
    }
]).factory('Share', ['$resource',
    function ($resource) {
		return $resource('/client/share', null, {
			'update': {
				method: 'PUT'
			}
		});
    }
]).factory('Calendar', ['$resource',
    function ($resource) {
		return $resource('/client/calendar', null, {
			'update': {
				method: 'PUT'
			}
		});
    }
]).factory('DataModels', ['$resource',
    function ($resource) {
		return $resource('/client/datamodel/:id', null, {
			'update': {
				method: 'PUT'
			}
		});
    }
]).factory('Files', ['$resource',
    function ($resource) {
		return $resource('/file/:id', null, {
			'update': {
				method: 'PUT'
			}
		});
    }
]).factory('Datas', ['$resource',
    function ($resource) {
		return $resource('/data/:datamodel_id/:entry_id', {
			datamodel_id: '@datamodel_id',
			entry_id: '@entry_id'
		}, {
			'update': {
				method: 'PUT'
			}
		});
    }
]).factory('SessionService', ['AppTranslationService', '$location', '$resource', 'Login', 'Logout', 'UserStatus', 'Applications', function SessionService(AppTranslationService, $location, $resource, Login, Logout, UserStatus, Applications) {
	var sessionData = {
		userData: {
			properties: {
				theme: 'default',
				language: 'en'
			}
		},
		applicationName: 'App1',
		appData: {}
	};
	var translate = function (text) {
		if (!text) return 'xxxxx';
		var translated_text = text[sessionData.userData.properties.language];
		if (translated_text) return translated_text;
		else return text['en'];
	}
	var translateInternal = function (text, language) {
		if (!text) return 'xxxxx';
		var translated_text = text[language];
		if (translated_text) return translated_text;
		else return text['en'];
	}
	var setSessionData = function (newData) {
		if (newData.applications) {
			for (var i = 0; i < newData.applications.length; i++) {
				newData.applications[i].translated_name = translateInternal(newData.applications[i].name, newData.userData.properties.language);
				newData.applications[i].translated_description = translateInternal(newData.applications[i].description, newData.userData.properties.language);
			}
		}
		sessionData = newData;
	}
	var getSessionData = function () {
		return sessionData;
	}

	var initSessionData = function (userResult, gotoApps) {
		var language = window.navigator.userLanguage || window.navigator.language;
		//alert(language);
		sessionData = {};
		sessionData.token = userResult.token;
		sessionData.userData = userResult.user;
		sessionData.userData.title = (userResult.user.firstname ? userResult.user.firstname : '') + ' ' + (userResult.user.lastname ? userResult.user.lastname : '') + ' @ ' + (userResult.user.company.name ? userResult.user.company.name : '');
		sessionData.userData.name = (userResult.user.firstname ? userResult.user.firstname : '') + ' ' + (userResult.user.lastname ? userResult.user.lastname : '');
		sessionData.appData = AppTranslationService.translate(sessionData.userData.properties.language);
		Applications.query().$promise.then(function (appResult) {
			sessionData.applications = appResult;
			var apps = sessionData.applications;
			for (var i = 0; i < apps.length; i++) {
				apps[i].translated_name = translate(apps[i].name);
				apps[i].translated_description = translate(apps[i].description);
			}
			if (gotoApps) {
				sessionData.applicationName = sessionData.appData.home;
				$location.url('/applications');
			} else
			if ($location.path() == '/') {
				$location.url('/applications');
			}
		}).catch(function (error) {
			// shows an error loading applications
		});
	}
	var init = function () {
		UserStatus.get().$promise.then(function (userResult) {
			initSessionData(userResult, false);
		}).catch(function (error) {
			sessionData.appData = AppTranslationService.translate(sessionData.userData.properties.language);
			$location.url('/');
		});
	}
	var login = function (user, password) {
		var loginObject = new Login({
			user: user,
			password: password
		});
		loginObject.$save(function (userResult) {
			initSessionData(userResult, true);
		}).catch(function (error) {
			sessionData.appData = AppTranslationService.translate(sessionData.userData.properties.language);
			$location.url('/');
		});
	}
	var logout = function () {
		Logout.get();
		sessionData = {
			userData: {
				properties: {
					theme: 'default',
					language: 'en'
				}
			},
			applicationName: 'App1'
		};
		sessionData.appData = AppTranslationService.translate(sessionData.userData.properties.language);
		$location.url('/');
	}
	return {
		setSessionData: setSessionData,
		getSessionData: getSessionData,
		translate: translate,
		init: init,
		login: login,
		logout: logout
	}
}]).factory('MapService', function MapService() {
	var maps = {};

	var initMap = function initMap(mapId) {
		maps[mapId] = new google.maps.Map(document.getElementById(mapId), {
			zoom: 2,
			scrollwheel: false,
			navigationControl: false,
			mapTypeControl: false,
			scaleControl: false,
			draggable: false,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		});
	}

	var geocodeAddress = function geocodeAddress(mapId, address) {
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode({
			'address': address
		}, function (results, status) {
			if (status === 'OK') {
				maps[mapId].setCenter(results[0].geometry.location);
				maps[mapId].setZoom(14);
				var marker = new google.maps.Marker({
					map: maps[mapId],
					position: results[0].geometry.location
				});
			} else {
				//alert('Geocode was not successful for the following reason: ' + status);
			}
		});
	}
	return {
		geocodeAddress: geocodeAddress,
		initMap: initMap
	}
}).controller('AppCtrl', ['$scope', '$timeout', '$mdSidenav', 'SessionService', function ($scope, $timeout, $mdSidenav, SessionService) {
	$scope.sessionData = SessionService.getSessionData();

	$scope.$watch(function () {
		return SessionService.getSessionData();
	}, function (newValue, oldValue) {
		if (newValue != oldValue) $scope.sessionData = newValue;
	});

	SessionService.init();

	$scope.closeLeft = function () {
		$mdSidenav('left').close();
	};
	$scope.closeRight = function () {
		$mdSidenav('right').close();
	};

	$scope.logout = function () {
		$mdSidenav('right').close();
		SessionService.logout();
	};

	$scope.notifyForm = function () {

	}

	$scope.toggleLeft = buildDelayedToggler('left');
	$scope.toggleRight = buildDelayedToggler('right');

	function debounce(func, wait, context) {
		var timer;

		return function debounced() {
			var context = $scope,
				args = Array.prototype.slice.call(arguments);
			$timeout.cancel(timer);
			timer = $timeout(function () {
				timer = undefined;
				func.apply(context, args);
			}, wait || 10);
		};
	}

	function buildDelayedToggler(navID) {
		return debounce(function () {
			$mdSidenav(navID).toggle();
		}, 200);
	}
}]).config(['$routeProvider', function ($routeProvider) {
	$routeProvider
		.when('/form/:id/:entry_id', {
			templateUrl: 'core/forms.html',
			controller: 'FormDetailsCtrl'
		})
		.when('/workflows/:application_id', {
			templateUrl: 'core/workflows.html',
			controller: 'WorkflowsCtrl'
		})
		.when('/welcome', {
			templateUrl: 'core/welcome.html',
			controller: 'WelcomeCtrl'
		})
		.when('/register', {
			templateUrl: 'core/register.html',
			controller: 'RegisterCtrl'
		})
		.when('/login', {
			templateUrl: 'core/login.html',
			controller: 'LoginCtrl'
		})
		.when('/user', {
			templateUrl: 'core/user.html',
			controller: 'UserCtrl'
		})
		.when('/company', {
			templateUrl: 'core/company.html',
			controller: 'CompanyCtrl'
		})
		.when('/applications', {
			templateUrl: 'core/applications.html',
			controller: 'ApplicationsCtrl'
		})
		.when('/designer', {
			templateUrl: 'designer/designer.html',
			controller: 'DesignerCtrl'
		})
		.when('/application_edit/:id', {
			templateUrl: 'designer/application.html',
			controller: 'ApplicationEditCtrl'
		})
		.when('/application_share/:id', {
			templateUrl: 'designer/share.html',
			controller: 'ApplicationShareCtrl'
		})
		.when('/workflow_edit/:id', {
			templateUrl: 'designer/workflow.html',
			controller: 'WorkflowEditCtrl'
		})
		.when('/form_edit/:id', {
			templateUrl: 'designer/form.html',
			controller: 'FormEditCtrl'
		})
		.otherwise({
			redirectTo: '/',
			templateUrl: 'core/welcome.html',
			controller: 'WelcomeCtrl'
		});
}]);
