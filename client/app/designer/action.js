app1.controller('FormActionEditCtrl', ['$scope', '$routeParams', '$mdDialog', 'SessionService', 'DesignForm', 'DesignDataModel', 'DesignWorkflow', 'DesignApplication', function ($scope, $routeParams, $mdDialog, SessionService, DesignForm, DesignDataModel, DesignWorkflow, DesignApplication) {
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
        subscribe: {
            en: 'Add user to list',
            fr: 'Ajouter l`utilisateur a une liste'
        },
        unsubscribe: {
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
        },
        add_event: {
            en: 'Add Event',
            fr: 'Ajouter événement'
        },
        remove_event: {
            en: 'Remove Event',
            fr: 'Supprimer événement'
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

    $scope.datamodels = [];
    $scope.notifyuser_type = {
        current: {
            en: 'Current User',
            fr: 'Utilisateur courant'
        },
        owner: {
            en: 'Object Creator',
            fr: 'Createur de l\'objet'
        },
        item: {
            en: 'Selection User',
            fr: 'Utilisateur de la selection'
        },
        none: {
            en: 'None',
            fr: 'Aucun'
        }
    }
    var keysOfNotifyUserType = Object.keys($scope.notifyuser_type);
    $scope.notifyuser_types = [];
    for (i = 0; i < keysOfNotifyUserType.length; i++) {
        $scope.notifyuser_types.push({
            translated_name: SessionService.translate($scope.notifyuser_type[keysOfNotifyUserType[i]]),
            id: keysOfNotifyUserType[i]
        });
    }

    DesignForm.get({
        id: $routeParams.id
    }, function (resultForm, err) {
        var i;
        DesignDataModel.query({
            skip: 0,
            limit: 500,
        }, function (datamodels) {
            for (i = 0; i < datamodels.length; i++) {
                datamodels[i].translated_name = SessionService.translate(datamodels[i].name);
            }
            $scope.datamodels = datamodels;
            $scope.updateReservationDatamodel();
        });
        $scope.form = resultForm;
        $scope.action = $scope.form.actions[$routeParams.action];
        if (!$scope.action.formula) {
            $scope.action.formula = [];
        }
        $scope.datamodel_keys = [];
        if ($scope.form.datamodel) {
            var datamodelKeys = Object.keys($scope.form.datamodel.projection);
            for (i = 0; i < datamodelKeys.length; i++) {
                $scope.datamodel_keys.push({
                    full_path: $scope.form.datamodel.projection[datamodelKeys[i]].full_path,
                    translated_name: SessionService.translate($scope.form.datamodel.projection[datamodelKeys[i]].name),
                    id: datamodelKeys[i]
                });
            }
        }
        if ($scope.form.actions) {
            for (i = 0; i < $scope.form.actions.length; i++) {
                $scope.form.actions[i].translated_name = SessionService.translate($scope.form.actions[i].name);
            }
        }
        if ($scope.form.values) {
            for (i = 0; i < $scope.form.values.length; i++) {
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
                fr: 'Accueil de l\'application'
            }
        }
        form_home.translated_name = SessionService.translate(form_home.name);
        $scope.forms.push(form_home);
        var form_back = {
            _id: 'back',
            name: {
                en: 'Back',
                fr: 'Retour'
            }
        }
        form_back.translated_name = SessionService.translate(form_back.name);
        $scope.forms.push(form_back);
    });

    DesignApplication.get({
        id: $routeParams.application_id
    }, function (resultApp, err) {
        if (resultApp.profiles) {
            for (var i = 0; i < resultApp.profiles.length; i++) {
                resultApp.profiles[i].translated_name = SessionService.translate(resultApp.profiles[i].name);
                resultApp.profiles[i].translated_description = SessionService.translate(resultApp.profiles[i].description);
            }
        }
        $scope.application = resultApp;
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
        if ($scope.form.actions) {
            for (var i = 0; i < $scope.form.actions.length; i++) {
                delete $scope.form.actions[i]['translated_name'];
            }
        }
        if ($scope.form.values) {
            for (var j = 0; j < $scope.form.values.length; j++) {
                delete $scope.form.values[j]['translated_name'];
            }
        }
        DesignForm.update({
            id: $scope.form._id
        }, $scope.form, function (res) {
            SessionService.init();
            SessionService.location('/form_edit/' + $scope.form._id + '?application_id=' + $routeParams.application_id + '&workflow_id=' + $routeParams.workflow_id);
        }, function (res) {
            updateErrorAlert();
        });
    }

    $scope.toggleInFormula = function (item) {
        var idx = $scope.action.formula.indexOf(item.id);
        if (idx > -1) {
            $scope.action.formula.splice(idx, 1);
        } else {
            $scope.action.formula.push(item.id);
        }
    }

    $scope.existsInFormula = function (item) {
        return $scope.action.formula.indexOf(item.id) > -1;
    }

    $scope.updateReservationDatamodel = function () {
        $scope.reservation_datamodel_keys = [];
        var i;
        if ($scope.action.reservation_datamodel) {
            var reservationDatamodel;
            for (i = 0; i < $scope.datamodels.length; i++) {
                if ($scope.datamodels[i]._id == $scope.action.reservation_datamodel) {
                    reservationDatamodel = $scope.datamodels[i];
                    break;
                }
            }
            var reservationDatamodelKeys = Object.keys(reservationDatamodel.projection);
            for (i = 0; i < reservationDatamodelKeys.length; i++) {
                $scope.reservation_datamodel_keys.push({
                    full_path: reservationDatamodel.projection[reservationDatamodelKeys[i]].full_path,
                    translated_name: SessionService.translate(reservationDatamodel.projection[reservationDatamodelKeys[i]].name),
                    id: reservationDatamodelKeys[i]
                });
            }
        }
    }

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
