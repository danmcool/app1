var home = angular.module('home', ['ngRoute', 'ngResource', 'ngMaterial', 'ngMessages', 'ngCookies', 'materialCarousel']).config(['$mdThemingProvider', function ($mdThemingProvider) {
    $mdThemingProvider.theme('home')
        .primaryPalette('grey')
        .accentPalette('amber');
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
}]).factory('Register', ['$resource',
    function ($resource) {
        return $resource('/authentication/register', null, {
            'update': {
                method: 'PUT'
            }
        });
    }
]).factory('SessionService', ['AppTranslationService', '$location', '$resource', '$window', '$cookies', '$mdDialog', function SessionService(AppTranslationService, $location, $resource, $window, $cookies, $mdDialog) {
    var sessionData = {
        userData: {
            properties: {
                theme: 'home',
                uiLanguage: 'auto'
            }
        },
        applicationName: 'App1',
        appData: {}
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
                return 'en';
            } else {
                return (language.indexOf('en') == 0 ? 'en' : language.indexOf('fr') == 0 ? 'fr' : 'en');
            }
        } else {
            return properties.uiLanguage;
        }
    }
    var initSessionData = function (userResult, gotoApps) {
        sessionData = {};
        sessionData.token = userResult.token;
        sessionData.userData = userResult.user;
        sessionData.userData.properties.correctedLanguage = computeLanguage(sessionData.userData.properties, $window);
        sessionData.userData.title = (userResult.user.firstname ? userResult.user.firstname : '') + ' ' + (userResult.user.lastname ? userResult.user.lastname : '') + (userResult.user.company.name ? ' @ ' + userResult.user.company.name : '');
        sessionData.userData.name = (userResult.user.firstname ? userResult.user.firstname : '') + ' ' + (userResult.user.lastname ? userResult.user.lastname : '');
        sessionData.appData = AppTranslationService.translate(sessionData.userData.properties.correctedLanguage);
    }
    var init = function () {
        sessionData.userData.properties.correctedLanguage = computeLanguage(sessionData.userData.properties, $window);
        sessionData.appData = AppTranslationService.translate(sessionData.userData.properties.correctedLanguage);
        var favoriteCookie = $cookies.get('app1_eu_cookies');
        if (!favoriteCookie) {
            $mdDialog.show(
                $mdDialog.alert()
                .parent(angular.element(document.body))
                .clickOutsideToClose(true)
                .title(sessionData.appData.cookie_policy)
                .textContent(sessionData.appData.cookie_policy_content)
                .ok(sessionData.appData.ok)
            ).then(function () {
                $cookies.put('app1_eu_cookies', 'OK');
            });
        }
    }
    var login = function (user, password) {
        location('/#login');
    }
    var location = function (url, noScroll) {
        $location.url(url);
        if (noScroll) {} else {
            $window.scrollTo(0, 0);
        }
    }
    return {
        setSessionData: setSessionData,
        getSessionData: getSessionData,
        translate: translate,
        init: init,
        login: login,
        location: location,
        computeLanguage: computeLanguage
    }
}]).controller('HomeCtrl', ['$scope', '$timeout', '$mdSidenav', 'SessionService', function ($scope, $timeout, $mdSidenav, SessionService) {
    SessionService.init();

    $scope.sessionData = SessionService.getSessionData();

    $scope.$watch(function () {
        return SessionService.getSessionData();
    }, function (newValue, oldValue) {
        if (newValue != oldValue) $scope.sessionData = newValue;
    });

    $scope.closeRight = function () {
        $mdSidenav('right').close();
    }

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

    $scope.scroll = function (elementId) {
        document.querySelector(elementId).scrollIntoView({
            behavior: 'smooth'
        });
    }
}]).config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/welcome', {
            templateUrl: 'welcome.html',
            controller: 'WelcomeCtrl'
        })
        .when('/register', {
            templateUrl: 'register.html',
            controller: 'RegisterCtrl'
        })
        .otherwise({
            redirectTo: '/',
            templateUrl: 'welcome.html',
            controller: 'WelcomeCtrl'
        });
}]);
