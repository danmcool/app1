app1.controller('FormDisplayEditCtrl', ['$scope', '$routeParams', '$mdDialog', 'SessionService', 'DesignForm', 'DesignDataModel', 'DesignWorkflow', function ($scope, $routeParams, $mdDialog, SessionService, DesignForm, DesignDataModel, DesignWorkflow) {
    $scope.sessionData = SessionService.getSessionData();
    $scope.$watch(function () {
        return SessionService.getSessionData();
    }, function (newValue, oldValue) {
        if (newValue != oldValue) {
            $scope.sessionData = newValue;
        }
    });
    $scope.section_index = $routeParams.section;
    $scope.block_index = $routeParams.block;
    $scope.field_index = $routeParams.field;

    $scope.display_type = {
        list: {
            en: 'List',
            fr: 'Liste'
        },
        item: {
            en: 'Detail List',
            fr: 'Liste des détails'
        },
        shorttext: {
            en: 'Text',
            fr: 'Texte'
        },
        number: {
            en: 'Number',
            fr: 'Nombre'
        },
        currency: {
            en: 'Amount',
            fr: 'Montant'
        },
        editor: {
            en: 'Text Editor',
            fr: 'Editeur texte'
        },
        feed: {
            en: 'Discussion Feed',
            fr: 'Fil de discussion'
        },
        file: {
            en: 'File',
            fr: 'Fichier'
        },
        selection: {
            en: 'Selection',
            fr: 'Selection'
        },
        check: {
            en: 'Check',
            fr: 'Contrôle'
        },
        calendar: {
            en: 'Calendar',
            fr: 'Calendrier'
        },
        calculation: {
            en: 'Formula',
            fr: 'Formule'
        },
        email: {
            en: 'Email',
            fr: 'Courriel'
        },
        address: {
            en: 'Address',
            fr: 'Adresse'
        }
    }
    $scope.title_display_type = {
        text: {
            en: 'Text',
            fr: 'Texte'
        },
        value: {
            en: 'Value',
            fr: 'Valeur'
        },
        currency: {
            en: 'Amount',
            fr: 'Montant'
        }
    }

    var keysOfDisplayType = Object.keys($scope.display_type);
    $scope.display_types = [];
    for (i = 0; i < keysOfDisplayType.length; i++) {
        $scope.display_types.push({
            translated_name: SessionService.translate($scope.display_type[keysOfDisplayType[i]]),
            type: keysOfDisplayType[i]
        });
    }
    var keysOfTitleDisplayType = Object.keys($scope.title_display_type);
    $scope.title_display_types = [];
    for (i = 0; i < keysOfTitleDisplayType.length; i++) {
        $scope.title_display_types.push({
            translated_name: SessionService.translate($scope.title_display_type[keysOfTitleDisplayType[i]]),
            type: keysOfTitleDisplayType[i]
        });
    }

    $scope.list_action_type = {
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
        }
    }

    $scope.item_action_type = {
        modify_item: {
            en: 'Modify',
            fr: 'Modifier'
        },
        delete_item: {
            en: 'Delete',
            fr: 'Supprimer'
        },
        link_item: {
            en: 'Link',
            fr: 'Lien'
        },
        move_item: {
            en: 'Move Item',
            fr: 'Deplacer element'
        }
    }

    var keysOfListActionType = Object.keys($scope.list_action_type);
    $scope.list_action_types = [];
    for (i = 0; i < keysOfListActionType.length; i++) {
        $scope.list_action_types.push({
            translated_name: SessionService.translate($scope.list_action_type[keysOfListActionType[i]]),
            type: keysOfListActionType[i]
        });
    }
    var keysOfItemActionType = Object.keys($scope.item_action_type);
    $scope.item_action_types = [];
    for (i = 0; i < keysOfItemActionType.length; i++) {
        $scope.item_action_types.push({
            translated_name: SessionService.translate($scope.item_action_type[keysOfItemActionType[i]]),
            type: keysOfItemActionType[i]
        });
    }

    DesignForm.get({
        id: $routeParams.id
    }, function (resultForm, err) {
        $scope.form = resultForm;
        $scope.form.translated_name = SessionService.translate($scope.form.name);
        $scope.field = $scope.form.display[$scope.section_index].blocks[$scope.block_index].fields[$scope.field_index];
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
