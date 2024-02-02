var app1 = angular.module('app1', ['ngRoute', 'ngResource', 'ngMaterial', 'ngMessages', 'materialCalendar', 'infinite-scroll', 'materialCarousel', 'materialCalendar']).config(['$mdThemingProvider', function ($mdThemingProvider) {
    $mdThemingProvider.theme('default').primaryPalette('blue').accentPalette('light-blue');
    $mdThemingProvider.theme('user1').primaryPalette('purple').accentPalette('green');
    $mdThemingProvider.theme('user2').primaryPalette('pink').accentPalette('orange');
    $mdThemingProvider.theme('user3').primaryPalette('blue-grey').accentPalette('amber');
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
]).factory('Event', ['$resource',
    function ($resource) {
        return $resource('/client/event/:datamodel_id/:id', null, {
            'update': {
                method: 'PUT'
            }
        });
    }
]).factory('Reservation', ['$resource',
    function ($resource) {
        return $resource('/client/reservation/:datamodel_id/:id', null, {
            'update': {
                method: 'PUT'
            }
        });
    }
]).factory('Files', ['$resource',
    function ($resource) {
        return $resource('/client/file/:id', null, {
            'update': {
                method: 'PUT'
            }
        });
    }
]).factory('FileUrl', ['$resource',
    function ($resource) {
        return $resource('/client/file/url/:id', null, {
            'update': {
                method: 'PUT'
            }
        });
    }
]).factory('RunMachineLearningModel', ['$resource',
    function ($resource) {
        return $resource('/client/model_run/:datamodel_id/:data_id/:mlmodel_id', null, {
            'update': {
                method: 'PUT'
            }
        });
    }
]).factory('Datas', ['$resource',
    function ($resource) {
        return $resource('/client/data/:datamodel_id/:entry_id', {
            datamodel_id: '@datamodel_id',
            entry_id: '@entry_id'
        }, {
            'update': {
                method: 'PUT'
            }
        });
    }
]).factory('SessionService', ['AppTranslationService', '$location', '$resource', '$window', '$mdDateLocale', 'Login', 'Logout', 'UserStatus', 'Applications', 'User', function SessionService(AppTranslationService, $location, $resource, $window, $mdDateLocale, Login, Logout, UserStatus, Applications, User) {
    var sessionData = {
        userData: {
            properties: {
                theme: 'default',
                uiLanguage: 'auto'
            }
        },
        applicationName: 'App1',
        appData: {},
    };
    $mdDateLocale.formatDate = function(date) {
        return new Date(date).toLocaleDateString(sessionData.userData.properties.correctedLanguage);
    };
var translate = function (text) {
        if (!text) return 'xxxxx';
        var translated_text = text[sessionData.userData.properties.correctedLanguage];
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
                if (newData.applications[i].remote) {
                    newData.applications[i].translated_name = translateInternal(newData.applications[i].name, newData.userData.properties.correctedLanguage) + ' (' + newData.applications[i].company_name + ')';
                } else {
                    newData.applications[i].translated_name = translateInternal(newData.applications[i].name, newData.userData.properties.correctedLanguage);
                }
                newData.applications[i].translated_description = translateInternal(newData.applications[i].description, newData.userData.properties.correctedLanguage);
            }
        }
        sessionData = newData;
    }
    var getSessionData = function () {
        return sessionData;
    }
    var computeLanguage = function (properties, window) {
        if (properties.uiLanguage && properties.uiLanguage == 'auto') {
            var language = window.navigator.userLanguage || window.navigator.language;
            if (!language) {
                language = 'en';
            } else {
                language = (language.indexOf('en') == 0 ? 'en' : language.indexOf('fr') == 0 ? 'fr' : 'en');
            }
        } else {
            language = properties.uiLanguage;
        }
        return language;
    }
    var initSessionData = function (userResult, gotoApps) {
        sessionData = {};
        sessionData.token = userResult.token;
        sessionData.userData = userResult.user;
        sessionData.userData.properties.correctedLanguage = computeLanguage(sessionData.userData.properties, $window);
        sessionData.userData.title = (userResult.user.firstname ? userResult.user.firstname : '') + ' ' + (userResult.user.lastname ? userResult.user.lastname : '') + (userResult.user.company.name ? ' @ ' + userResult.user.company.name : '');
        sessionData.userData.name = (userResult.user.firstname ? userResult.user.firstname : '') + ' ' + (userResult.user.lastname ? userResult.user.lastname : '');
        sessionData.appData = AppTranslationService.translate(sessionData.userData.properties.correctedLanguage);
        Applications.query({
            skip: 0,
            limit: 500,
        }, function (appResult) {
            sessionData.applications = appResult;
            var apps = sessionData.applications;
            var saveUserData = false;
            if (!sessionData.userData.properties.app_score) {
                sessionData.userData.properties.app_score = {};
                saveUserData = true;
            }
            for (var i = 0; i < apps.length; i++) {
                if (apps[i].remote) {
                    apps[i].translated_name = translate(apps[i].name) + ' (' + apps[i].company_name + ')';
                } else {
                    apps[i].translated_name = translate(apps[i].name);
                }
                apps[i].translated_description = translate(apps[i].description);
                if (!sessionData.userData.properties.app_score[apps[i]._id]) {
                    sessionData.userData.properties.app_score[apps[i]._id] = 75.00;
                    saveUserData = true;
                }
            }
            apps.sort(function (app_1, app_2) {
                return sessionData.userData.properties.app_score[app_2._id] - sessionData.userData.properties.app_score[app_1._id];
            });
            if (saveUserData) {
                User.update({
                    id: sessionData.userData._id
                }, {
                    properties: sessionData.userData.properties
                });
            }
            if (gotoApps) {
                sessionData.applicationName = sessionData.appData.home;
                location('/applications');
            } else if ($location.path() == '/') {
                location('/applications');
            }
        }, function (error) {
            // shows an error loading applications
        });
    }
    var init = function () {
        sessionData.userData.properties.correctedLanguage = computeLanguage(sessionData.userData.properties, $window);
        UserStatus.get(function (userResult) {
            if ($location.path() == '/login') {
                initSessionData(userResult, true);
            } else {
                initSessionData(userResult, false);
            }
        }, function (error) {
            sessionData.appData = AppTranslationService.translate(sessionData.userData.properties.correctedLanguage);
            location('/login', false);
        });
    }
    var openApp = function (appId) {
        if (sessionData.userData.profile.type == 'public') return;
        for (var i = 0; i < sessionData.applications.length; i++) {
            sessionData.userData.properties.app_score[sessionData.applications[i]._id] *= 0.99;
        }
        sessionData.userData.properties.app_score[appId] = Math.min(100.00, sessionData.userData.properties.app_score[appId] * 1.02);
        sessionData.applications.sort(function (app_1, app_2) {
            return sessionData.userData.properties.app_score[app_2._id] - sessionData.userData.properties.app_score[app_1._id];
        });
        User.update({
            id: sessionData.userData._id
        }, {
            properties: sessionData.userData.properties
        });
    }
    var login = function (user, password) {
        var loginObject = new Login({
            user: user,
            password: password
        });
        loginObject.$save(function (userResult) {
            initSessionData(userResult, true);
        }, function (error) {
            sessionData.appData = AppTranslationService.translate(sessionData.userData.properties.correctedLanguage);
            location('/', false);
        });
    }
    var logout = function () {
        Logout.get();
        sessionData = {
            userData: {
                properties: {
                    theme: 'default',
                    uiLanguage: 'auto'
                }
            },
            applicationName: 'App1'
        }
        sessionData.userData.properties.correctedLanguage = computeLanguage(sessionData.userData.properties, $window);
        sessionData.appData = AppTranslationService.translate(sessionData.userData.properties.correctedLanguage);
        location('/', false);
    }
    var location = function (url, noScroll) {
        $location.url(url);
        if (noScroll) {} else {
            $window.scrollTo(0, 0);
        }
    }
    var locationBack = function (noScroll) {
        $window.history.back();
        if (noScroll) {} else {
            $window.scrollTo(0, 0);
        }
    }
    return {
        setSessionData: setSessionData,
        getSessionData: getSessionData,
        translate: translate,
        init: init,
        openApp: openApp,
        login: login,
        logout: logout,
        location: location,
        locationBack: locationBack,
        computeLanguage: computeLanguage
    }
}]).factory('MapService', function MapService() {
    var maps = [];

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
                /*var marker = new google.maps.Marker({
                    map: maps[mapId],
                    position: results[0].geometry.location
                });*/
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
    SessionService.init();

    $scope.sessionData = SessionService.getSessionData();

    $scope.$watch(function () {
        return SessionService.getSessionData();
    }, function (newValue, oldValue) {
        if (newValue != oldValue) $scope.sessionData = newValue;
    });

    $scope.closeLeft = function () {
        $mdSidenav('left').close();
    }
    $scope.closeRight = function () {
        $mdSidenav('right').close();
    }

    $scope.logout = function () {
        $mdSidenav('right').close();
        SessionService.logout();
    }

    $scope.open = function (application) {
        //SessionService.openApp(application._id);
        if (application.type == 'url') {
            SessionService.location('/url/' + application._id + '?iframe_url=' + application.url);
        } else if (application.type == 'file') {
            SessionService.location('/file/' + application._id + '?iframe_file=' + application.file);
        } else {
            if (application.remote) {
                SessionService.location('/workflows/' + application._id + '?pid=' + application.pid);
            } else {
                SessionService.location('/workflows/' + application._id);
            }
        }
        $scope.closeLeft();
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
        .when('/url/:application_id', {
            templateUrl: 'core/url.html',
            controller: 'UrlCtrl'
        })
        .when('/file/:application_id', {
            templateUrl: 'core/file.html',
            controller: 'FileCtrl'
        })
        .when('/login', {
            templateUrl: 'core/login.html',
            controller: 'LoginCtrl'
        })
        .when('/register', {
            templateUrl: 'core/register.html',
            controller: 'RegisterCtrl'
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
        .when('/application_security/:id', {
            templateUrl: 'designer/applicationsecurity.html',
            controller: 'ApplicationSecurityCtrl'
        })
        .when('/application_profile/:id', {
            templateUrl: 'designer/applicationprofile.html',
            controller: 'ApplicationProfileCtrl'
        })
        .when('/application_users/:id', {
            templateUrl: 'designer/applicationusers.html',
            controller: 'ApplicationUsersCtrl'
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
        .when('/form_display_edit/:id', {
            templateUrl: 'designer/display.html',
            controller: 'FormDisplayEditCtrl'
        })
        .when('/form_action_edit/:id', {
            templateUrl: 'designer/action.html',
            controller: 'FormActionEditCtrl'
        })
        .when('/form_value_edit/:id', {
            templateUrl: 'designer/value.html',
            controller: 'FormValueEditCtrl'
        })
        .when('/datamodel', {
            templateUrl: 'datamodel/datamodel.html',
            controller: 'DatamodelCtrl'
        })
        .when('/datamodel/:id', {
            templateUrl: 'datamodel/datamodeledit.html',
            controller: 'DatamodelEditCtrl'
        })
        .when('/machinelearningmodel', {
            templateUrl: 'machinelearningmodel/machinelearningmodel.html',
            controller: 'MachineLearningModelCtrl'
        })
        .when('/machinelearningmodel/:id', {
            templateUrl: 'machinelearningmodel/machinelearningmodeledit.html',
            controller: 'MachineLearningModelEditCtrl'
        })
        .otherwise({
            redirectTo: '/login',
            templateUrl: 'core/login.html',
            controller: 'LoginCtrl'
        });
}]);
