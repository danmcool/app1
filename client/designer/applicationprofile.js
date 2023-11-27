app1.controller('ApplicationProfileCtrl', ['$scope', 'SessionService', 'DesignApplication', 'DesignWorkflow', 'DesignForm', 'DesignProfile', 'DesignDataModel', '$location', '$routeParams', '$mdDialog', function ($scope, SessionService, DesignApplication, DesignWorkflow, DesignForm, DesignProfile, DesignDataModel, $location, $routeParams, $mdDialog) {
    $scope.sessionData = SessionService.getSessionData();
    $scope.$watch(function () {
        return SessionService.getSessionData();
    }, function (newValue, oldValue) {
        if (newValue != oldValue) {
            $scope.sessionData = newValue;
        }
    });

    $scope.profile = {};
    $scope.workflows = [];
    $scope.datamodels = [];

    $scope.UserProfilePrivateDefault = {
        list: {
            _company_code: '@@company_code'
        },
        create: {
            _company_code: '@@company_code',
            _user: ['@@user']
        },
        read: {
            _company_code: '@@company_code'
        },
        update: {
            _company_code: '@@company_code'
        },
        delete: {
            _company_code: '@@company_code',
            _user: ['@@reports', '@@user']
        }
    };
    $scope.UserProfilePublicDefault = {
        list: {
            _company_code: '@@company_code',
            _user: ['@@public']
        },
        create: {
            _company_code: '@@company_code',
            _user: ['@@public']
        },
        read: {
            _company_code: '@@company_code',
            _user: ['@@public']
        },
        update: {
            _company_code: '@@company_code',
            _user: ['@@public']
        }
    };


    DesignProfile.get({
        id: $routeParams.id
    }, function (resultProfile, err) {
        if (resultProfile) {
            $scope.profile = resultProfile;
            $scope.profile.translated_name = SessionService.translate($scope.profile.name);
            $scope.public_profile = ($scope.profile.properties && $scope.profile.properties.user && ($scope.profile.properties.user == 'public')) ? true : false;
            if ($scope.profile.profile && $scope.profile.profile.datamodels) {
                $scope.selected_datamodel = Object.keys($scope.profile.profile.datamodels)[0];
                var datamodel = $scope.profile.profile.datamodels[$scope.selected_datamodel];
                $scope.rights_for_list = (datamodel.list ? true : false);
                $scope.rights_for_read = (datamodel.read ? true : false);
                $scope.rights_for_create = (datamodel.create ? true : false);
                $scope.rights_for_update = (datamodel.update ? true : false);
                $scope.rights_for_delete = (datamodel.delete ? true : false);
            }
            DesignApplication.get({
                id: $routeParams.application_id
            }, function (resultApp, err) {
                if (resultApp.workflows) {
                    for (var i = 0; i < resultApp.workflows.length; i++) {
                        resultApp.workflows[i].translated_name = SessionService.translate(resultApp.workflows[i].name);
                        resultApp.workflows[i].translated_description = SessionService.translate(resultApp.workflows[i].description);
                        if ($scope.profile.profile.applications[$routeParams.application_id].workflows[resultApp.workflows[i]._id]) {
                            resultApp.workflows[i].active = true;
                        } else {
                            resultApp.workflows[i].active = false;
                        }
                        $scope.workflows.push(resultApp.workflows[i]);
                    }
                }
            });
        }
        DesignDataModel.query({
            skip: 0,
            limit: 500,
        }, function (datamodels) {
            for (var i = 0; i < datamodels.length; i++) {
                datamodels[i].translated_name = SessionService.translate(datamodels[i].name);
            }
            $scope.datamodels = datamodels;
        });

        $scope.sessionData.applicationName = $scope.sessionData.appData.app_designer;
        SessionService.setSessionData($scope.sessionData);
    });

    $scope.updateWorkflow = function (workflowId) {
        $scope.profile.profile.applications[$routeParams.application_id].workflows[workflowId] = !$scope.profile.profile.applications[$routeParams.application_id].workflows[workflowId];
    }

    $scope.updateDatamodel = function (datamodelId) {
        if (!$scope.profile.profile.datamodels) {
            $scope.profile.profile.datamodels = {};
        }
        if (!$scope.profile.profile.datamodels[datamodelId]) {
            $scope.profile.profile.datamodels[datamodelId] = {};
        }
        var datamodel = $scope.profile.profile.datamodels[datamodelId];
        if (datamodel) {
            $scope.rights_for_list = datamodel.list ? true : false;
            $scope.rights_for_read = datamodel.read ? true : false;
            $scope.rights_for_create = datamodel.create ? true : false;
            $scope.rights_for_update = datamodel.update ? true : false;
            $scope.rights_for_delete = datamodel.delete ? true : false;
        } else {
            $scope.rights_for_list = false;
            $scope.rights_for_read = false;
            $scope.rights_for_create = false;
            $scope.rights_for_update = false;
            $scope.rights_for_delete = false;
        }
    }

    $scope.updateListSecurity = function () {
        if ($scope.rights_for_list) {
            if ($scope.public_profile) {
                $scope.profile.profile.datamodels[$scope.selected_datamodel].list = $scope.UserProfilePublicDefault['list'];
            } else {
                $scope.profile.profile.datamodels[$scope.selected_datamodel].list = $scope.UserProfilePrivateDefault['list'];
            }
        } else {
            delete $scope.profile.profile.datamodels[$scope.selected_datamodel].list;
        }
    }

    $scope.updateReadSecurity = function () {
        if ($scope.rights_for_read) {
            if ($scope.public_profile) {
                $scope.profile.profile.datamodels[$scope.selected_datamodel].read = $scope.UserProfilePublicDefault['read'];
            } else {
                $scope.profile.profile.datamodels[$scope.selected_datamodel].read = $scope.UserProfilePrivateDefault['read'];
            }
        } else {
            delete $scope.profile.profile.datamodels[$scope.selected_datamodel].read;
        }
    }

    $scope.updateCreateSecurity = function () {
        if ($scope.rights_for_create) {
            if ($scope.public_profile) {
                $scope.profile.profile.datamodels[$scope.selected_datamodel].create = $scope.UserProfilePublicDefault['create'];
            } else {
                $scope.profile.profile.datamodels[$scope.selected_datamodel].create = $scope.UserProfilePrivateDefault['create'];
            }
        } else {
            delete $scope.profile.profile.datamodels[$scope.selected_datamodel].create;
        }
    }

    $scope.updateUpdateSecurity = function () {
        if ($scope.rights_for_update) {
            if ($scope.public_profile) {
                $scope.profile.profile.datamodels[$scope.selected_datamodel].update = $scope.UserProfilePublicDefault['update'];
            } else {
                $scope.profile.profile.datamodels[$scope.selected_datamodel].update = $scope.UserProfilePrivateDefault['update'];
            }
        } else {
            delete $scope.profile.profile.datamodels[$scope.selected_datamodel].update;
        }
    }

    $scope.updateDeleteSecurity = function () {
        if ($scope.rights_for_delete) {
            if ($scope.public_profile) {
                //$scope.profile.profile.datamodels[$scope.selected_datamodel].delete = $scope.UserProfilePublicDefault['delete'];
            } else {
                $scope.profile.profile.datamodels[$scope.selected_datamodel].delete = $scope.UserProfilePrivateDefault['delete'];
            }
        } else {
            delete $scope.profile.profile.datamodels[$scope.selected_datamodel].delete;
        }
    }

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
        DesignProfile.update({
            id: $scope.profile._id
        }, $scope.profile, function (res) {
            SessionService.init();
            SessionService.location('/application_security/' + $routeParams.application_id);
        }, function (res) {
            $scope.profile = res.profile;
            updateErrorAlert();
        });
    }

    $scope.editText = function (object, property, multipleLines) {
        if (!object[property]) {
            object[property] = {};
        }
        $mdDialog.show({
            templateUrl: 'designer/text.html',
            controller: 'TextCtrl',
            locals: {
                text: object[property],
                multipleLines: multipleLines
            },
            parent: angular.element(document.body),
            clickOutsideToClose: true
        }).then(function (result) {
            object[property] = result;
        });
    }
}]);
