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

    $scope.datamodels = [];
    $scope.display_type = {
        list: {
            en: 'List',
            fr: 'Liste'
        },
        item: {
            en: 'Detail List',
            fr: 'Liste de détails'
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
        image: {
            en: 'Image',
            fr: 'Image'
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
        appointment: {
            en: 'Appointment',
            fr: 'Rendez-vous'
        },
        appointment_properties: {
            en: 'Appointment Configuration',
            fr: 'Configuration rendez-vous'
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
        },
        calculation: {
            en: 'Formula',
            fr: 'Formule'
        }
    }

    var keysOfDisplayType = Object.keys($scope.display_type);
    $scope.display_types = [];
    for (var i = 0; i < keysOfDisplayType.length; i++) {
        $scope.display_types.push({
            translated_name: SessionService.translate($scope.display_type[keysOfDisplayType[i]]),
            type: keysOfDisplayType[i]
        });
    }
    var keysOfTitleDisplayType = Object.keys($scope.title_display_type);
    $scope.title_display_types = [];
    for (var j = 0; j < keysOfTitleDisplayType.length; j++) {
        $scope.title_display_types.push({
            translated_name: SessionService.translate($scope.title_display_type[keysOfTitleDisplayType[j]]),
            type: keysOfTitleDisplayType[j]
        });
    }

    $scope.list_action_type = {
        modify_list: {
            en: 'Modify',
            fr: 'Modifier'
        },
        delete_list: {
            en: 'Delete',
            fr: 'Supprimer'
        },
        link_list: {
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

    var initDatamodelKeysRef = function () {
        $scope.ref_datamodel_keys = [];
        $scope.ref_datamodel = {};
        if ($scope.field.display == 'item' || $scope.field.display == 'reference') {
            if ($scope.field && $scope.field.projectionid) {
                var datamodelref_id = $scope.form.datamodel.projection[$scope.field.projectionid].ref_id;
                for (var i = 0; i < $scope.datamodels.length; i++) {
                    if ($scope.datamodels[i]._id == datamodelref_id) {
                        $scope.ref_datamodel = $scope.datamodels[i];
                        var datamodelkeys = Object.keys($scope.datamodels[i].projection);
                        for (var j = 0; j < datamodelkeys.length; j++) {
                            $scope.ref_datamodel_keys.push({
                                translated_name: SessionService.translate($scope.datamodels[i].projection[datamodelkeys[j]].name),
                                full_path: $scope.datamodels[i].projection[datamodelkeys[j]].full_path,
                                id: datamodelkeys[j]
                            });
                        }
                        break;
                    }
                }
            }
        }
    }

    DesignForm.get({
        id: $routeParams.id
    }, function (resultForm, err) {
        $scope.form = resultForm;
        $scope.form.translated_name = SessionService.translate($scope.form.name);
        $scope.field = $scope.form.display[$scope.section_index].blocks[$scope.block_index].fields[$scope.field_index];
        $scope.datamodel_keys = [];
        if ($scope.form.datamodel) {
            var datamodelkeys = Object.keys($scope.form.datamodel.projection);
            for (var i = 0; i < datamodelkeys.length; i++) {
                $scope.datamodel_keys.push({
                    translated_name: SessionService.translate($scope.form.datamodel.projection[datamodelkeys[i]].name),
                    full_path: $scope.form.datamodel.projection[datamodelkeys[i]].full_path,
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

    DesignDataModel.query({
        skip: 0,
        limit: 500,
    }, function (datamodels) {
        initDatamodelKeysRef();
        $scope.datamodels = datamodels;
    });

    $scope.changeFieldDisplay = function (field) {
        initDatamodelKeysRef();
    }

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

    $scope.addActionList = function (field) {
        $mdDialog.show(
            $mdDialog.prompt()
            .parent(angular.element(document.body))
            .clickOutsideToClose(true)
            .title($scope.sessionData.appData.new_action)
            .initialValue('My Action')
            .ok($scope.sessionData.appData.ok)
            .cancel($scope.sessionData.appData.cancel)
        ).then(function (result) {
            if (!field.item_actions) {
                field.item_actions = [];
            }
            var name = {};
            name[$scope.sessionData.userData.properties.language] = result;
            field.item_actions.push({
                name: name,
                translated_name: result
            });
        });
    }

    $scope.save = function () {
        if ($scope.field.projectionid) {
            $scope.field.full_path = ($scope.form.datamodel.projection[$scope.field.projectionid].path == '' ? $scope.form.datamodel.projection[$scope.field.projectionid].technical_name : $scope.form.datamodel.projection[$scope.field.projectionid].path + '.' + $scope.form.datamodel.projection[$scope.field.projectionid].technical_name);
        }
        if ($scope.field.title) {
            if ($scope.field.display == 'item') {
                $scope.field.title_full_path = ($scope.datamodel_ref.projection[$scope.field.title].path == '' ? $scope.datamodel_ref.projection[$scope.field.title].technical_name : $scope.datamodel_ref.projection[$scope.field.title].path + '.' + $scope.datamodel_ref.projection[$scope.field.title].technical_name);
            } else {
                $scope.field.title_full_path = ($scope.form.datamodel.projection[$scope.field.title].path == '' ? $scope.form.datamodel.projection[$scope.field.title].technical_name : $scope.form.datamodel.projection[$scope.field.title].path + '.' + $scope.form.datamodel.projection[$scope.field.title].technical_name);
            }
        }
        if ($scope.field.subtitle) {
            if ($scope.field.display == 'item') {
                $scope.field.subtitle_full_path = ($scope.datamodel_ref.projection[$scope.field.subtitle].path == '' ? $scope.datamodel_ref.projection[$scope.field.subtitle].technical_name : $scope.datamodel_ref.projection[$scope.field.subtitle].path + '.' + $scope.datamodel_ref.projection[$scope.field.subtitle].technical_name);
            } else {
                $scope.field.subtitle_full_path = ($scope.form.datamodel.projection[$scope.field.subtitle].path == '' ? $scope.form.datamodel.projection[$scope.field.subtitle].technical_name : $scope.form.datamodel.projection[$scope.field.subtitle].path + '.' + $scope.form.datamodel.projection[$scope.field.subtitle].technical_name);
            }
        }
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
