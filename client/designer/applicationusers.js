app1.controller('ApplicationUsersCtrl', ['$scope', 'SessionService', 'DesignApplication', 'DesignWorkflow', 'DesignForm', 'User', '$location', '$routeParams', '$mdDialog', function ($scope, SessionService, DesignApplication, DesignWorkflow, DesignForm, User, $location, $routeParams, $mdDialog) {
    $scope.sessionData = SessionService.getSessionData();
    $scope.$watch(function () {
        return SessionService.getSessionData();
    }, function (newValue, oldValue) {
        if (newValue != oldValue) {
            $scope.sessionData = newValue;
        }
    });

    $scope.search_text = '';
    $scope.skip = 0;
    $scope.limit = 10;
    $scope.users = [];
    $scope.stopScroll = false;
    $scope.tempStopScroll = false;
    $scope.selected_profile = null;

    $scope.getNextUsers = function () {
        if ($scope.stopScroll) return;
        if ($scope.tempStopScroll) return;
        if (!$scope.selected_profile) return;
        var localLimit = $scope.limit;
        var localSkip = $scope.skip;
        $scope.skip += $scope.limit;
        $scope.tempStopScroll = true;
        User.query({
            search_text: $scope.search_text,
            skip: localSkip,
            limit: localLimit,
            sort_by: {
                lastname: 'ascending',
                firstname: 'ascending'
            }
        }).$promise.then(function (users) {
            if (users.length < $scope.limit) $scope.stopScroll = true;
            for (var i = 0; i < users.length; i++) {
                $scope.users.push(users[i]);
            }
            $scope.tempStopScroll = false;
        });
    }

    $scope.search = function (search_text) {
        if (!search_text) {
            search_text = ''
        };
        $scope.search_text = search_text;
        $scope.skip = 0;
        $scope.limit = 10;
        $scope.stopScroll = false;
        $scope.tempStopScroll = false;
        $scope.users = [];
        $scope.getNextUsers();
    }

    DesignApplication.get({
        id: $routeParams.id
    }, function (resultApp, err) {
        if (resultApp.profiles) {
            for (var i = 0; i < resultApp.profiles.length; i++) {
                resultApp.profiles[i].translated_name = SessionService.translate(resultApp.profiles[i].name);
                resultApp.profiles[i].translated_description = SessionService.translate(resultApp.profiles[i].description);
            }
            if (resultApp.profiles.length > 0) {
                $scope.selected_profile = resultApp.profiles[0]._id;
            }
        }
        $scope.application = resultApp;
        $scope.sessionData.applicationName = $scope.sessionData.appData.app_designer;
        SessionService.setSessionData($scope.sessionData);
        $scope.getNextUsers();
    });


    $scope.removeUserProfile = function (user) {
        if (!user.remote_profiles) {
            user.remote_profiles = [];
        }
        for (var i = 0; i < user.remote_profiles.length; i++) {
            if (user.remote_profiles[i] == $scope.selected_profile) {
                user.remote_profiles.splice(i, 1);
                break;
            }
        }
        User.update({
            id: user._id
        }, {
            remote_profiles: user.remote_profiles
        });
    }

    $scope.addUserProfile = function (user) {
        if (!user.remote_profiles) {
            user.remote_profiles = [];
        }
        user.remote_profiles.push($scope.selected_profile);
        User.update({
            id: user._id
        }, {
            remote_profiles: user.remote_profiles
        });
    }

    $scope.save = function () {
        SessionService.init();
        SessionService.location('/designer');
    }

    $scope.changeProfile = function () {
        $scope.skip = 0;
        $scope.limit = 10;
        $scope.users = [];
        $scope.stopScroll = false;
        $scope.tempStopScroll = false;
        $scope.getNextUsers();
    }
}]);
