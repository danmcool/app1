app1.controller('FormActionEditCtrl', ['$scope', '$routeParams', '$mdDialog', 'SessionService', 'DesignForm', 'DesignDataModel', 'DesignWorkflow', function ($scope, $routeParams, $mdDialog, SessionService, DesignForm, DesignDataModel, DesignWorkflow) {
    $scope.sessionData = SessionService.getSessionData();
    $scope.$watch(function () {
        return SessionService.getSessionData();
    }, function (newValue, oldValue) {
        if (newValue != oldValue) {
            $scope.sessionData = newValue;
        }
    });

    $scope.action_type = {
        create: {
            en: 'Create',
            fr: 'Creer'
        },
        modify: {
            en: 'Modify',
            fr: 'Modifier'
        },
        delete: {
            en: 'Delete',
            fr: 'Supprimer'
        },
        link: {
            en: 'Link',
            fr: 'Lien'
        },
        link_empty: {
            en: 'Empty link',
            fr: 'Lien vide'
        },
        associate: {
            en: 'Add user to list',
            fr: 'Ajouter l`utilisateur a une liste'
        },
        dissociate: {
            en: 'Remove user from list',
            fr: 'Supprimer l`utilisateur de la liste'
        },
        new_item: {
            en: 'Add new element',
            fr: 'Ajouter un nouvel element'
        },
        download: {
            en: 'Download data',
            fr: 'Telecharger les donnees'
        },
        share: {
            en: 'Share',
            fr: 'Partager'
        },
        calendar: {
            en: 'Send calendar',
            fr: 'Envoyer calendrier'
        }
    }

    var keysOfActionType = Object.keys($scope.action_type);
    $scope.action_types = [];
    for (i = 0; i < keysOfActionType.length; i++) {
        $scope.action_types.push({
            translated_name: SessionService.translate($scope.action_type[keysOfActionType[i]]),
            type: keysOfActionType[i]
        });
    }

    DesignForm.get({
        id: $routeParams.id
    }, function (resultForm, err) {
        $scope.form = resultForm;
        $scope.action = $scope.form.actions[$routeParams.action];
        $scope.datamodel_keys = [];
        if ($scope.form.datamodel) {
            var datamodelkeys = Object.keys($scope.form.datamodel.translation);
            for (var i = 0; i < datamodelkeys.length; i++) {
                $scope.datamodel_keys.push({
                    translated_name: SessionService.translate($scope.form.datamodel.translation[datamodelkeys[i]]),
                    id: datamodelkeys[i]
                });
            }
        }
        if ($scope.form.actions) {
            for (var i = 0; i < $scope.form.actions.length; i++) {
                $scope.form.actions[i].translated_name = SessionService.translate($scope.form.actions[i].name);
            }
        }
        if ($scope.form.values) {
            for (var i = 0; i < $scope.form.values.length; i++) {
                $scope.form.values[i].translated_name = SessionService.translate($scope.form.values[i].name);
            }
        }
        $scope.action = $scope.form.actions[$routeParams.action];
        $scope.sessionData.applicationName = $scope.sessionData.appData.app_designer;
        SessionService.setSessionData($scope.sessionData);
    })

    DesignWorkflow.get({
        id: $routeParams.workflow_id
    }, function (resultWorkflow, err) {
        for (var i = 0; i < resultWorkflow.forms.length; i++) {
            resultWorkflow.forms[i].translated_name = SessionService.translate(resultWorkflow.forms[i].name);
            resultWorkflow.forms[i].translated_description = SessionService.translate(resultWorkflow.forms[i].description);
        }
        $scope.forms = resultWorkflow.forms;
        var form_home = {
            _id: 'home',
            name: {
                en: 'Application Home',
                fr: 'Accueil de l`application'
            }
        };
        form_home.translated_name = SessionService.translate(form_home.name);
        $scope.forms.push(form_home);
    });

    $scope.editText = function (object, property, multipleLines) {
        if (!object[property]) object[property] = {};
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

    $scope.save = function () {
        DesignForm.update({
            id: $scope.form._id
        }, $scope.form).$promise.then(function (res) {
            SessionService.init();
            SessionService.location('/form_edit/' + $scope.form._id + '?application_id=' + $routeParams.application_id + '&workflow_id=' + $routeParams.workflow_id);
        }).catch(function (res) {
            updateErrorAlert();
        });
    }

    $scope.toggle = function (item, list) {
        var idx = list.indexOf(item);
        if (idx > -1) {
            list.splice(idx, 1);
        } else {
            list.push(item);
        }
    };

    $scope.exists = function (item, list) {
        return list.indexOf(item) > -1;
    };

    var updateErrorAlert = function () {
        $mdDialog.show(
            $mdDialog.alert()
            .parent(angular.element(document.body))
            .clickOutsideToClose(true)
            .title($scope.sessionData.appData.new_document_version)
            .textContent($scope.sessionData.appData.already_modified_document)
            .ok($scope.sessionData.appData.ok)
        );
    }
}]);
