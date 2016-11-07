angular.module('app1_admin', ['ngRoute', 'ngResource', 'ngMaterial'])
    .directive('jsonText', function() {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, element, attr, ngModel) {
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
    })
    .factory('Workflows', ['$resource',
        function($resource) {
            return $resource('/api/workflow/:id', null, {
                'update': {
                    method: 'PUT'
                }
            });
        }
    ])
    .factory('Applications', ['$resource',
        function($resource) {
            return $resource('/api/application/:id', null, {
                'update': {
                    method: 'PUT'
                }
            });
        }
    ])
    .factory('Forms', ['$resource',
        function($resource) {
            return $resource('/api/form/:id', null, {
                'update': {
                    method: 'PUT'
                }
            });
        }
    ])
    .factory('Values', ['$resource',
        function($resource) {
            return $resource('/api/value/:id', null, {
                'update': {
                    method: 'PUT'
                }
            });
        }
    ])
    .factory('UserProfiles', ['$resource',
        function($resource) {
            return $resource('/api/userprofile/:id', null, {
                'update': {
                    method: 'PUT'
                }
            });
        }
    ])
    .factory('Companies', ['$resource',
        function($resource) {
            return $resource('/api/company/:id', null, {
                'update': {
                    method: 'PUT'
                }
            });
        }
    ])
    .factory('Users', ['$resource',
        function($resource) {
            return $resource('/api/user/:id', null, {
                'update': {
                    method: 'PUT'
                }
            });
        }
    ])
    .factory('Files', ['$resource',
        function($resource) {
            return $resource('/file/:id', null, {
                'update': {
                    method: 'PUT'
                }
            });
        }
    ])
    .factory('DataModels', ['$resource',
        function($resource) {
            return $resource('/api/datamodel/:id', null, {
                'update': {
                    method: 'PUT'
                }
            });
        }
    ])
    .controller('WorkflowsCtrl', ['$scope', 'Workflows',
        function($scope, Workflows) {
            $scope.workflows = Workflows.query({
                skip: 0,
                limit: 100
            });
            $scope.save = function() {
                if (!$scope.newWorkflow || $scope.newWorkflow.length < 1) return;
                var workflow = new Workflows({
                    name: {
                        en: $scope.newWorkflow
                    }
                });
                workflow.$save(function() {
                    $scope.workflows.push(workflow);
                    $scope.newWorkflow = '';
                });
            }
            $scope.remove = function(index) {
                var workflow = $scope.workflows[index];
                Workflows.remove({
                    id: workflow._id
                }, function() {
                    $scope.workflows.splice(index, 1);
                });
            }
        }
    ])
    .controller('ApplicationsCtrl', ['$scope', 'Applications',
        function($scope, Applications) {
            $scope.applications = Applications.query({
                skip: 0,
                limit: 100
            });
            $scope.save = function() {
                if (!$scope.newApplication || $scope.newApplication.length < 1) return;
                var application = new Applications({
                    name: {
                        en: $scope.newApplication
                    }
                });
                application.$save(function() {
                    $scope.applications.push(application);
                    $scope.newApplication = '';
                });
            }
            $scope.remove = function(index) {
                var application = $scope.applications[index];
                Applications.remove({
                    id: application._id
                }, function() {
                    $scope.applications.splice(index, 1);
                });
            }
        }
    ])
    .controller('FormsCtrl', ['$scope', 'Forms',
        function($scope, Forms) {
            $scope.forms = Forms.query({
                skip: 0,
                limit: 100
            });
            $scope.save = function() {
                if (!$scope.newForm || $scope.newForm.length < 1) return;
                var form = new Forms({
                    name: {
                        en: $scope.newForm
                    }
                });
                form.$save(function() {
                    $scope.forms.push(form);
                    $scope.newForm = '';
                });
            }
            $scope.remove = function(index) {
                var form = $scope.forms[index];
                Forms.remove({
                    id: form._id
                }, function() {
                    $scope.forms.splice(index, 1);
                });
            }
        }
    ])
    .controller('ValuesCtrl', ['$scope', 'Values',
        function($scope, Values) {
            $scope.values = Values.query({
                skip: 0,
                limit: 100
            });
            $scope.save = function() {
                if (!$scope.newValue || $scope.newValue.length < 1) return;
                var value = new Values({
                    name: {
                        en: $scope.newValue
                    }
                });
                value.$save(function() {
                    $scope.values.push(value);
                    $scope.newValue = '';
                });
            }
            $scope.remove = function(index) {
                var value = $scope.values[index];
                Values.remove({
                    id: value._id
                }, function() {
                    $scope.values.splice(index, 1);
                });
            }
        }
    ])
    .controller('UserProfilesCtrl', ['$scope', 'UserProfiles',
        function($scope, UserProfiles) {
            $scope.userprofiles = UserProfiles.query({
                skip: 0,
                limit: 100
            });
            $scope.save = function() {
                if (!$scope.newUserProfile || $scope.newUserProfile.length < 1) return;
                var userprofile = new UserProfiles({
                    name: {
                        en: $scope.newUserProfile
                    }
                });
                userprofile.$save(function() {
                    $scope.userprofiles.push(userprofile);
                    $scope.newUserProfile = '';
                });
            }
            $scope.remove = function(index) {
                var userprofile = $scope.userprofiles[index];
                UserProfiles.remove({
                    id: userprofile._id
                }, function() {
                    $scope.userprofiles.splice(index, 1);
                });
            }
        }
    ])
    .controller('CompaniesCtrl', ['$scope', 'Companies',
        function($scope, Companies) {
            $scope.companies = Companies.query({
                skip: 0,
                limit: 100
            });
            $scope.save = function() {
                if (!$scope.newCompany || $scope.newCompany.length < 1) return;
                var company = new Companies({
                    name: $scope.newCompany
                });
                company.$save(function() {
                    $scope.companies.push(company);
                    $scope.newCompany = '';
                });
            }
            $scope.remove = function(index) {
                var company = $scope.companies[index];
                Companies.remove({
                    id: company._id
                }, function() {
                    $scope.companies.splice(index, 1);
                });
            }
        }
    ])
    .controller('UsersCtrl', ['$scope', 'Users',
        function($scope, Users) {
            $scope.users = Users.query({
                skip: 0,
                limit: 100
            });
            $scope.save = function() {
                if (!$scope.newUser || $scope.newUser.length < 1) return;
                var user = new Users({
                    user: $scope.newUser
                });
                user.$save(function() {
                    $scope.users.push(user);
                    $scope.newUser = '';
                });
            }
            $scope.remove = function(index) {
                var user = $scope.users[index];
                Users.remove({
                    id: user._id
                }, function() {
                    $scope.users.splice(index, 1);
                });
            }
        }
    ])
    .controller('FilesCtrl', ['$scope', 'Files',
        function($scope, Files) {
            $scope.files = Files.query({
                skip: 0,
                limit: 100
            });
            $scope.save = function() {
                if (!$scope.newFile || $scope.newFile.length < 1) return;
                var file = new Files({
                    file: $scope.newFile
                });
                file.$save(function() {
                    $scope.files.push(file);
                    $scope.newFile = '';
                });
            }
            $scope.remove = function(index) {
                var user = $scope.files[index];
                Files.remove({
                    id: file._id
                }, function() {
                    $scope.files.splice(index, 1);
                });
            }
        }
    ])
    .controller('DataModelsCtrl', ['$scope', 'DataModels',
        function($scope, DataModels) {
            $scope.datamodels = DataModels.query({
                skip: 0,
                limit: 100
            });
            $scope.save = function() {
                if (!$scope.newDataModel || $scope.newDataModel.length < 1) return;
                var datamodel = new DataModels({
                    name: {
                        en: $scope.newDataModel
                    }
                });
                datamodel.$save(function() {
                    $scope.datamodels.push(datamodel);
                    $scope.newDataModel = '';
                });
            }
            $scope.remove = function(index) {
                var datamodel = $scope.datamodels[index];
                DataModels.remove({
                    id: datamodel._id
                }, function() {
                    $scope.datamodels.splice(index, 1);
                });
            }
        }
    ])
    .controller('WorkflowDetailsCtrl', ['$scope', '$routeParams', 'Workflows', '$location',
        function($scope,
            $routeParams, Workflows, $location) {
            $scope.workflow = Workflows.get({
                id: $routeParams.id
            });
            $scope.update = function() {
                Workflows.update({
                    id: $scope.workflow._id
                }, $scope.workflow, function() {
                    $location.url('/workflows');
                });
            }
        }
    ])
    .controller('ApplicationDetailsCtrl', ['$scope', '$routeParams', 'Applications', '$location',
        function($scope,
            $routeParams, Applications, $location) {
            $scope.application = Applications.get({
                id: $routeParams.id
            });
            $scope.update = function() {
                Applications.update({
                    id: $scope.application._id
                }, $scope.application, function() {
                    $location.url('/applications');
                });
            }
        }
    ])
    .controller('DataModelDetailsCtrl', ['$scope', '$routeParams', 'DataModels', '$location',
        function($scope,
            $routeParams, DataModels, $location) {
            $scope.datamodel = DataModels.get({
                id: $routeParams.id
            });
            $scope.update = function() {
                DataModels.update({
                    id: $scope.datamodel._id
                }, $scope.datamodel, function() {
                    $location.url('/datamodels');
                });
            }
        }
    ])
    .controller('FormDetailsCtrl', ['$scope', '$routeParams', 'Forms', '$location',
        function($scope, $routeParams,
            Forms, $location) {
            $scope.form = Forms.get({
                id: $routeParams.id
            });
            $scope.update = function() {
                Forms.update({
                    id: $scope.form._id
                }, $scope.form, function() {
                    $location.url('/forms');
                });
            }
        }
    ])
    .controller('ValueDetailsCtrl', ['$scope', '$routeParams', 'Values', '$location',
        function($scope, $routeParams,
            Values, $location) {
            $scope.value = Values.get({
                id: $routeParams.id
            });
            $scope.update = function() {
                Values.update({
                    id: $scope.value._id
                }, $scope.value, function() {
                    $location.url('/values');
                });
            }
        }
    ])
    .controller('UserProfileDetailsCtrl', ['$scope', '$routeParams', 'UserProfiles', '$location',
        function($scope,
            $routeParams, UserProfiles, $location) {
            $scope.userprofile = UserProfiles.get({
                id: $routeParams.id
            });
            $scope.update = function() {
                UserProfiles.update({
                    id: $scope.userprofile._id
                }, $scope.userprofile, function() {
                    $location.url('/userprofiles');
                });
            }
        }
    ])
    .controller('CompanyDetailsCtrl', ['$scope', '$routeParams', 'Companies', '$location',
        function($scope,
            $routeParams, Companies, $location) {
            $scope.company = Companies.get({
                id: $routeParams.id
            });
            $scope.update = function() {
                Companies.update({
                    id: $scope.company._id
                }, $scope.company, function() {
                    $location.url('/companies');
                });
            }
        }
    ])
    .controller('UserDetailsCtrl', ['$scope', '$routeParams', 'Users', '$location',
        function($scope, $routeParams,
            Users, $location) {
            $scope.user = Users.get({
                id: $routeParams.id
            });
            $scope.update = function() {
                Users.update({
                    id: $scope.user._id
                }, $scope.user, function() {
                    $location.url('/users');
                });
            }
        }
    ])
    .controller('FileDetailsCtrl', ['$scope', '$routeParams', 'Files', '$location',
        function($scope, $routeParams,
            Files, $location) {
            $scope.file = Files.get({
                id: $routeParams.id
            });
            $scope.update = function() {
                Files.update({
                    id: $scope.file._id
                }, $scope.file, function() {
                    $location.url('/files');
                });
            }
        }
    ])
    .controller('LeftCtrl', function($scope, $timeout, $mdSidenav, $log) {
        $scope.close = function() {
            $mdSidenav('left').close();
        };
    })
    .controller('AppCtrl', function($scope, $timeout, $mdSidenav, $log) {
        $scope.toggleLeft = buildDelayedToggler('left');

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
                $mdSidenav(navID).toggle().then(function() {
                    $log.debug("toggle " + navID + " is done");
                });
            }, 200);
        }
    })
//---------------
// Routes
//---------------
.config(['$routeProvider',
    function($routeProvider) {
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
            .otherwise({
                redirectTo: '/',
                templateUrl: 'welcome.html'
            });
    }
]);
