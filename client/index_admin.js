angular.module('app1_admin', ['ngRoute', 'ngResource', 'ngMaterial']).directive('jsonText', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attr, ngModel) {
            function into(input) {
                return JSON.parse(input);
            }

            function out(data) {
                return JSON.stringify(data);
            }
            ngModel.$parsers.push(into);
            ngModel.$formatters.push(out);
        }
    };
}).factory('Workflows',
    function ($resource) {
        return $resource('/api/workflow/:id', null, {
            'update': {
                method: 'PUT'
            }
        });
    }
).factory('Applications',
    function ($resource) {
        return $resource('/api/application/:id', null, {
            'update': {
                method: 'PUT'
            }
        });
    }
).factory('Forms',
    function ($resource) {
        return $resource('/api/form/:id', null, {
            'update': {
                method: 'PUT'
            }
        });
    }
).factory('Values',
    function ($resource) {
        return $resource('/api/value/:id', null, {
            'update': {
                method: 'PUT'
            }
        });
    }
).factory('UserProfiles',
    function ($resource) {
        return $resource('/api/userprofile/:id', null, {
            'update': {
                method: 'PUT'
            }
        });
    }
).factory('Sessions',
    function ($resource) {
        return $resource('/api/session/:id', null, {
            'update': {
                method: 'PUT'
            }
        });
    }
).factory('Companies',
    function ($resource) {
        return $resource('/api/company/:id', null, {
            'update': {
                method: 'PUT'
            }
        });
    }
).factory('Users',
    function ($resource) {
        return $resource('/api/user/:id', null, {
            'update': {
                method: 'PUT'
            }
        });
    }
).factory('Files',
    function ($resource) {
        return $resource('/client/file/:id', null, {
            'update': {
                method: 'PUT'
            }
        });
    }
).factory('DataModels',
    function ($resource) {
        return $resource('/api/datamodel/:id', null, {
            'update': {
                method: 'PUT'
            }
        });
    }
).factory('Update',
    function ($resource) {
        return $resource('/api/update', null, {
            'update': {
                method: 'PUT'
            }
        });
    }
).controller('WorkflowsCtrl',
    function ($scope, Workflows, $mdDialog) {
        $scope.workflows = Workflows.query({
            skip: 0,
            limit: 1000
        });
        $scope.save = function () {
            if (!$scope.newWorkflow || $scope.newWorkflow.length < 1) return;
            var workflow = new Workflows({
                name: {
                    en: $scope.newWorkflow
                }
            });
            workflow.$save(function () {
                $scope.workflows.push(workflow);
                $scope.newWorkflow = '';
            });
        }
        $scope.remove = function (object_id, index) {
            $mdDialog.show(
                $mdDialog.confirm()
                .parent(angular.element(document.body))
                .clickOutsideToClose(true)
                .title('Remove object?')
                .ok('Yes')
                .cancel('No')).then(
                function () {
                    Workflows.remove({
                        id: object_id
                    }, function () {
                        $scope.workflows.splice(index, 1);
                    });
                });
        }
    }
).controller('ApplicationsCtrl',
    function ($scope, Applications, $mdDialog) {
        $scope.applications = Applications.query({
            skip: 0,
            limit: 1000
        });
        $scope.save = function () {
            if (!$scope.newApplication || $scope.newApplication.length < 1) return;
            var application = new Applications({
                name: {
                    en: $scope.newApplication
                }
            });
            application.$save(function () {
                $scope.applications.push(application);
                $scope.newApplication = '';
            });
        }
        $scope.remove = function (object_id, index) {
            $mdDialog.show(
                $mdDialog.confirm()
                .parent(angular.element(document.body))
                .clickOutsideToClose(true)
                .title('Remove object?')
                .ok('Yes')
                .cancel('No')).then(
                function () {
                    Applications.remove({
                        id: object_id
                    }, function () {
                        $scope.applications.splice(index, 1);
                    });
                });
        }
    }
).controller('FormsCtrl',
    function ($scope, Forms, $mdDialog) {
        $scope.forms = Forms.query({
            skip: 0,
            limit: 1000
        });
        $scope.save = function () {
            if (!$scope.newForm || $scope.newForm.length < 1) return;
            var form = new Forms({
                name: {
                    en: $scope.newForm
                }
            });
            form.$save(function () {
                $scope.forms.push(form);
                $scope.newForm = '';
            });
        }
        $scope.remove = function (object_id, index) {
            $mdDialog.show(
                $mdDialog.confirm()
                .parent(angular.element(document.body))
                .clickOutsideToClose(true)
                .title('Remove object?')
                .ok('Yes')
                .cancel('No')).then(
                function () {
                    Forms.remove({
                        id: object_id
                    }, function () {
                        $scope.forms.splice(index, 1);
                    });
                });
        }
    }
).controller('ValuesCtrl', function ($scope, Values, $mdDialog) {
    $scope.values = Values.query({
        skip: 0,
        limit: 1000
    });
    $scope.save = function () {
        if (!$scope.newValue || $scope.newValue.length < 1) return;
        var value = new Values({
            name: {
                en: $scope.newValue
            }
        });
        value.$save(function () {
            $scope.values.push(value);
            $scope.newValue = '';
        });
    }
    $scope.remove = function (object_id, index) {
        $mdDialog.show(
            $mdDialog.confirm()
            .parent(angular.element(document.body))
            .clickOutsideToClose(true)
            .title('Remove object?')
            .ok('Yes')
            .cancel('No')).then(
            function () {
                Values.remove({
                    id: object_id
                }, function () {
                    $scope.values.splice(index, 1);
                });
            });
    }
}).controller('UserProfilesCtrl',
    function ($scope, UserProfiles, $mdDialog) {
        $scope.userprofiles = UserProfiles.query({
            skip: 0,
            limit: 1000
        });
        $scope.save = function () {
            if (!$scope.newUserProfile || $scope.newUserProfile.length < 1) return;
            var userprofile = new UserProfiles({
                name: {
                    en: $scope.newUserProfile
                }
            });
            userprofile.$save(function () {
                $scope.userprofiles.push(userprofile);
                $scope.newUserProfile = '';
            });
        }
        $scope.remove = function (object_id, index) {
            $mdDialog.show(
                $mdDialog.confirm()
                .parent(angular.element(document.body))
                .clickOutsideToClose(true)
                .title('Remove object?')
                .ok('Yes')
                .cancel('No')).then(
                function () {
                    UserProfiles.remove({
                        id: object_id
                    }, function () {
                        $scope.userprofiles.splice(index, 1);
                    });
                });
        }
    }).controller('SessionsCtrl',
    function ($scope, Sessions, $mdDialog) {
        $scope.sessions = Sessions.query({
            skip: 0,
            limit: 1000
        });
        $scope.save = function () {
            if (!$scope.newSession || $scope.newSession.length < 1) return;
            var session = new Sessions({
                name: {
                    en: $scope.newSession
                }
            });
            session.$save(function () {
                $scope.sessions.push(session);
                $scope.newSession = '';
            });
        }
        $scope.remove = function (object_id, index) {
            $mdDialog.show(
                $mdDialog.confirm()
                .parent(angular.element(document.body))
                .clickOutsideToClose(true)
                .title('Remove object?')
                .ok('Yes')
                .cancel('No')).then(
                function () {
                    Sessions.remove({
                        id: object_id
                    }, function () {
                        $scope.sessions.splice(index, 1);
                    });
                });
        }
    }
).controller('CompaniesCtrl',
    function ($scope, Companies, $mdDialog) {
        $scope.companies = Companies.query({
            skip: 0,
            limit: 1000
        });
        $scope.save = function () {
            if (!$scope.newCompany || $scope.newCompany.length < 1) return;
            var company = new Companies({
                name: $scope.newCompany,
                _company_code: $scope.newCompany
            });
            company.$save(function () {
                $scope.companies.push(company);
                $scope.newCompany = '';
            });
        }
        $scope.remove = function (object_id, index) {
            $mdDialog.show(
                $mdDialog.confirm()
                .parent(angular.element(document.body))
                .clickOutsideToClose(true)
                .title('Remove object?')
                .ok('Yes')
                .cancel('No')).then(
                function () {
                    Companies.remove({
                        id: object_id
                    }, function () {
                        $scope.companies.splice(index, 1);
                    });
                });
        }
    }
).controller('UsersCtrl',
    function ($scope, Users, $mdDialog) {
        $scope.users = Users.query({
            skip: 0,
            limit: 1000
        });
        $scope.save = function () {
            if (!$scope.newUser || $scope.newUser.length < 1) return;
            var user = new Users({
                user: $scope.newUser
            });
            user.$save(function () {
                $scope.users.push(user);
                $scope.newUser = '';
            });
        }
        $scope.remove = function (object_id, index) {
            $mdDialog.show(
                $mdDialog.confirm()
                .parent(angular.element(document.body))
                .clickOutsideToClose(true)
                .title('Remove object?')
                .ok('Yes')
                .cancel('No')).then(
                function () {
                    Users.remove({
                        id: object_id
                    }, function () {
                        $scope.users.splice(index, 1);
                    });
                });
        }
    }
).controller('FilesCtrl',
    function ($scope, Files, $mdDialog) {
        $scope.files = Files.query({
            skip: 0,
            limit: 1000
        });
        $scope.save = function () {
            if (!$scope.newFile || $scope.newFile.length < 1) return;
            var file = new Files({
                file: $scope.newFile
            });
            file.$save(function () {
                $scope.files.push(file);
                $scope.newFile = '';
            });
        }
        $scope.remove = function (object_id, index) {
            $mdDialog.show(
                $mdDialog.confirm()
                .parent(angular.element(document.body))
                .clickOutsideToClose(true)
                .title('Remove object?')
                .ok('Yes')
                .cancel('No')).then(
                function () {
                    Files.remove({
                        id: object_id
                    }, function () {
                        $scope.files.splice(index, 1);
                    });
                });
        }
    }
).controller('DataModelsCtrl',
    function ($scope, DataModels, $mdDialog) {
        $scope.datamodels = DataModels.query({
            skip: 0,
            limit: 1000
        });
        $scope.save = function () {
            if (!$scope.newDataModel || $scope.newDataModel.length < 1) return;
            var datamodel = new DataModels({
                name: {
                    en: $scope.newDataModel
                }
            });
            datamodel.$save(function () {
                $scope.datamodels.push(datamodel);
                $scope.newDataModel = '';
            });
        }
        $scope.remove = function (object_id, index) {
            $mdDialog.show(
                $mdDialog.confirm()
                .parent(angular.element(document.body))
                .clickOutsideToClose(true)
                .title('Remove object?')
                .ok('Yes')
                .cancel('No')).then(
                function () {
                    DataModels.remove({
                        id: object_id
                    }, function () {
                        $scope.datamodels.splice(index, 1);
                    });
                });
        }
    }
).controller('WorkflowDetailsCtrl',
    function ($scope,
        $routeParams, Workflows, $location) {
        $scope.workflow = Workflows.get({
            id: $routeParams.id
        });
        $scope.update = function () {
            Workflows.update({
                id: $scope.workflow._id
            }, $scope.workflow, function () {
                $location.url('/workflows');
            });
        }
    }
).controller('ApplicationDetailsCtrl',
    function ($scope,
        $routeParams, Applications, $location) {
        $scope.application = Applications.get({
            id: $routeParams.id
        });
        $scope.update = function () {
            Applications.update({
                id: $scope.application._id
            }, $scope.application, function () {
                $location.url('/applications');
            });
        }
    }
).controller('DataModelDetailsCtrl',
    function ($scope,
        $routeParams, DataModels, $location) {
        $scope.datamodel = DataModels.get({
            id: $routeParams.id
        });
        $scope.update = function () {
            DataModels.update({
                id: $scope.datamodel._id
            }, $scope.datamodel, function () {
                $location.url('/datamodels');
            });
        }
    }
).controller('FormDetailsCtrl',
    function ($scope, $routeParams,
        Forms, $location) {
        $scope.form = Forms.get({
            id: $routeParams.id
        });
        $scope.update = function () {
            Forms.update({
                id: $scope.form._id
            }, $scope.form, function () {
                $location.url('/forms');
            });
        }
    }
).controller('ValueDetailsCtrl',
    function ($scope, $routeParams,
        Values, $location) {
        $scope.value = Values.get({
            id: $routeParams.id
        });
        $scope.update = function () {
            Values.update({
                id: $scope.value._id
            }, $scope.value, function () {
                $location.url('/values');
            });
        }
    }
).controller('UserProfileDetailsCtrl',
    function ($scope,
        $routeParams, UserProfiles, $location) {
        $scope.userprofile = UserProfiles.get({
            id: $routeParams.id
        });
        $scope.update = function () {
            UserProfiles.update({
                id: $scope.userprofile._id
            }, $scope.userprofile, function () {
                $location.url('/userprofiles');
            });
        }
    }
).controller('SessionDetailsCtrl',
    function ($scope,
        $routeParams, Sessions, $location) {
        $scope.session = Sessions.get({
            id: $routeParams.id
        });
        $scope.update = function () {
            Sessions.update({
                id: $scope.session._id
            }, $scope.session, function () {
                $location.url('/sessions');
            });
        }
    }
).controller('CompanyDetailsCtrl',
    function ($scope,
        $routeParams, Companies, $location) {
        $scope.company = Companies.get({
            id: $routeParams.id
        });
        $scope.update = function () {
            Companies.update({
                id: $scope.company._id
            }, $scope.company, function () {
                $location.url('/companies');
            });
        }
    }
).controller('UserDetailsCtrl',
    function ($scope, $routeParams,
        Users, $location) {
        $scope.user = Users.get({
            id: $routeParams.id
        });
        $scope.update = function () {
            Users.update({
                id: $scope.user._id
            }, $scope.user, function () {
                $location.url('/users');
            });
        }
    }
).controller('FileDetailsCtrl',
    function ($scope, $routeParams,
        Files, $location) {
        $scope.file = Files.get({
            id: $routeParams.id
        });
        $scope.update = function () {
            Files.update({
                id: $scope.file._id
            }, $scope.file, function () {
                $location.url('/files');
            });
        }
    }
).controller('UpdateCtrl',
    function ($scope,
        Update) {
        $scope.updaterepository = 'https://github.com/danmcool/app1';
        $scope.launch = function () {
            Update.update({}, {
                repository: $scope.update.repository
            }, function (result) {
                $scope.update = result;
            });
        }
    }
).controller('LeftCtrl', function ($scope, $timeout, $mdSidenav, $log) {
    $scope.close = function () {
        $mdSidenav('left').close();
    };
}).controller('AppCtrl', function ($scope, $timeout, $mdSidenav, $log) {
    $scope.toggleLeft = buildDelayedToggler('left');

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
            $mdSidenav(navID).toggle(function () {
                $log.debug('toggle ' + navID + ' is done');
            });
        }, 200);
    }
}).config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider
            .when('/about', {
                templateUrl: 'welcome.html'
            })
            .when('/datamodels', {
                templateUrl: 'datamodels.html',
                controller: 'DataModelsCtrl'
            })
            .when('/datamodels/:id', {
                templateUrl: 'datamodelDetails.html',
                controller: 'DataModelDetailsCtrl'
            })
            .when('/forms', {
                templateUrl: 'forms.html',
                controller: 'FormsCtrl'
            })
            .when('/forms/:id', {
                templateUrl: 'formDetails.html',
                controller: 'FormDetailsCtrl'
            })
            .when('/values', {
                templateUrl: 'values.html',
                controller: 'ValuesCtrl'
            })
            .when('/values/:id', {
                templateUrl: 'valueDetails.html',
                controller: 'ValueDetailsCtrl'
            })
            .when('/userprofiles', {
                templateUrl: 'userprofiles.html',
                controller: 'UserProfilesCtrl'
            })
            .when('/userprofiles/:id', {
                templateUrl: 'userprofileDetails.html',
                controller: 'UserProfileDetailsCtrl'
            })
            .when('/sessions', {
                templateUrl: 'sessions.html',
                controller: 'SessionsCtrl'
            })
            .when('/sessions/:id', {
                templateUrl: 'sessionDetails.html',
                controller: 'SessionDetailsCtrl'
            })
            .when('/companies', {
                templateUrl: 'companies.html',
                controller: 'CompaniesCtrl'
            })
            .when('/companies/:id', {
                templateUrl: 'companyDetails.html',
                controller: 'CompanyDetailsCtrl'
            })
            .when('/users', {
                templateUrl: 'users.html',
                controller: 'UsersCtrl'
            })
            .when('/users/:id', {
                templateUrl: 'userDetails.html',
                controller: 'UserDetailsCtrl'
            })
            .when('/files', {
                templateUrl: 'files.html',
                controller: 'FilesCtrl'
            })
            .when('/files/:id', {
                templateUrl: 'fileDetails.html',
                controller: 'FileDetailsCtrl'
            })
            .when('/workflows', {
                templateUrl: 'workflows.html',
                controller: 'WorkflowsCtrl'
            })
            .when('/workflows/:id', {
                templateUrl: 'workflowDetails.html',
                controller: 'WorkflowDetailsCtrl'
            })
            .when('/applications', {
                templateUrl: 'applications.html',
                controller: 'ApplicationsCtrl'
            })
            .when('/applications/:id', {
                templateUrl: 'applicationDetails.html',
                controller: 'ApplicationDetailsCtrl'
            })
            .when('/update', {
                templateUrl: 'update.html',
                controller: 'UpdateCtrl'
            })
            .otherwise({
                redirectTo: '/',
                templateUrl: 'welcome.html'
            });
    }
]);
