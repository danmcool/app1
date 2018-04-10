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

    $scope.title_ref = {
        show: false
    }
    $scope.subtitle_ref = {
        show: false
    }
    $scope.selection_ref = {
        show: false
    }

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
        }
    }
    $scope.selection_display_type = {
        property: {
            en: 'Property',
            fr: 'Proprieté'
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
    var keysOfSelectionDisplayType = Object.keys($scope.selection_display_type);
    $scope.selection_display_types = [];
    for (var k = 0; k < keysOfSelectionDisplayType.length; k++) {
        $scope.selection_display_types.push({
            translated_name: SessionService.translate($scope.selection_display_type[keysOfSelectionDisplayType[k]]),
            type: keysOfSelectionDisplayType[k]
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

    var initDatamodel = function (datamodelref_id, ref_datamodel, ref_datamodel_keys) {
        for (var i = 0; i < $scope.datamodels.length; i++) {
            $scope.datamodels.translated_name = SessionService.translate($scope.datamodels[i].name);
            if ($scope.datamodels[i]._id == datamodelref_id) {
                ref_datamodel = $scope.datamodels[i];
                var datamodelkeys = Object.keys($scope.datamodels[i].projection);
                for (var j = 0; j < datamodelkeys.length; j++) {
                    ref_datamodel_keys.push({
                        translated_name: SessionService.translate($scope.datamodels[i].projection[datamodelkeys[j]].name),
                        full_path: $scope.datamodels[i].projection[datamodelkeys[j]].full_path,
                        id: datamodelkeys[j]
                    });
                }
                break;
            }
        }
    }
    var initDatamodelKeysRef = function () {
        $scope.ref_datamodel_selection_keys = [];
        $scope.ref_datamodel_selection = {};
        $scope.ref_datamodel_title_keys = [];
        $scope.ref_datamodel_title = {};
        $scope.ref_datamodel_subtitle_keys = [];
        $scope.ref_datamodel_subtitle = {};
        if ($scope.field.display == 'item' || $scope.field.display == 'reference' || $scope.field.display == 'selection') {
            if ($scope.field && $scope.field.projectionid) {
                var datamodelref_id = $scope.form.datamodel.projection[$scope.field.projectionid].ref_id;
                if (datamodelref_id) {
                    $scope.selection_ref.show = true;
                }
                initDatamodel(datamodelref_id, $scope.ref_datamodel_selection, $scope.ref_datamodel_selection_keys);
            }
        } else if ($scope.field.display == 'list') {
            if ($scope.field) {
                if ($scope.field.title) {
                    var datamodelref_id = $scope.form.datamodel.projection[$scope.field.title].ref_id;
                    if (datamodelref_id) {
                        $scope.title_ref.show = true;
                    }
                    initDatamodel(datamodelref_id, $scope.ref_datamodel_title, $scope.ref_datamodel_title_keys);
                }
                if ($scope.field.subtitle) {
                    var datamodelref_id = $scope.form.datamodel.projection[$scope.field.subtitle].ref_id;
                    if (datamodelref_id) {
                        $scope.subtitle_ref.show = true;
                    }
                    initDatamodel(datamodelref_id, $scope.ref_datamodel_subtitle, $scope.ref_datamodel_subtitle_keys);
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
        DesignDataModel.query({
            skip: 0,
            limit: 500,
        }, function (datamodels) {
            $scope.datamodels = datamodels;
            initDatamodelKeysRef();
        });
        $scope.changeValues($scope.field.listofvalues, $scope.selection_ref);
        $scope.changeValues($scope.field.title_listofvalues, $scope.title_ref);
        $scope.changeValues($scope.field.subtitle_listofvalues, $scope.subtitle_ref);
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
            for (var k = 0; k < $scope.form.actions.length; k++) {
                $scope.form.actions[k].translated_name = SessionService.translate($scope.form.actions[k].name);
            }
        }
        if ($scope.form.values) {
            for (var j = 0; j < $scope.form.values.length; j++) {
                $scope.form.values[j].translated_name = SessionService.translate($scope.form.values[j].name);
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

    $scope.changeFieldDisplay = function (field) {
        initDatamodelKeysRef();
    }

    $scope.changeValues = function (listofvalues, reference) {
        reference.show = false;
        if ($scope.form.values) {
            for (var l = 0; l < $scope.form.values.length; l++) {
                if ($scope.form.values[l]._id == listofvalues && $scope.form.values[l].type != 'list') {
                    reference.show = true;
                    break;
                }
            }
        }
    }

    $scope.changeSelectionRefDataModel = function (field) {
        for (var i = 0; i < $scope.ref_datamodel_selection_keys.length; i++) {
            if ($scope.ref_datamodel_selection_keys[i].id == field.selection_id) {
                field.selection_full_path = $scope.ref_datamodel_selection_keys[i].full_path;
                break;
            }
        }
    }

    $scope.changeTitleRefDataModel = function (field) {
        for (var i = 0; i < $scope.ref_datamodel_title_keys.length; i++) {
            if ($scope.ref_datamodel_title_keys[i].id == field.title) {
                field.title_full_path = $scope.ref_datamodel_title_keys[i].full_path;
                break;
            }
        }
    }

    $scope.changeSubtitleRefDataModel = function (field) {
        for (var i = 0; i < $scope.ref_datamodel_subtitle_keys.length; i++) {
            if ($scope.ref_datamodel_subtitle_keys[i].id == field.subtitle) {
                field.subtitle_full_path = $scope.ref_datamodel_subtitle_keys[i].full_path;
                break;
            }
        }
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
            .cancel($scope.sessionData.appData.cancel)).then(
            function (result) {
                if (!field.item_actions) {
                    field.item_actions = [];
                }
                var name = {};
                name[$scope.sessionData.userData.properties.correctedLanguage] = result;
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
                if ($scope.ref_datamodel_selection.projection[$scope.field.title]) {
                    $scope.field.title_full_path = ($scope.ref_datamodel_selection.projection[$scope.field.title].path == '' ? $scope.ref_datamodel_selection.projection[$scope.field.title].technical_name : $scope.ref_datamodel_selection.projection[$scope.field.title].path + '.' + $scope.ref_datamodel_selection.projection[$scope.field.title].technical_name);
                }
            } else if ($scope.field.display == 'list' && $scope.field.title_display == 'value' && $scope.field.title_display_text == 'property') {
                if ($scope.ref_datamodel_title.projection && $scope.ref_datamodel_title.projection[$scope.field.title]) {
                    $scope.field.title_full_path = ($scope.ref_datamodel_title.projection[$scope.field.title].path == '' ? $scope.ref_datamodel_title.projection[$scope.field.title].technical_name : $scope.ref_datamodel_title.projection[$scope.field.title].path + '.' + $scope.ref_datamodel_title.projection[$scope.field.title].technical_name);
                }
            } else if ($scope.form.datamodel.projection && $scope.form.datamodel.projection[$scope.field.title]) {
                $scope.field.title_full_path = ($scope.form.datamodel.projection[$scope.field.title].path == '' ? $scope.form.datamodel.projection[$scope.field.title].technical_name : $scope.form.datamodel.projection[$scope.field.title].path + '.' + $scope.form.datamodel.projection[$scope.field.title].technical_name);
            }
        }
        if ($scope.field.subtitle) {
            if ($scope.field.display == 'item') {
                if ($scope.ref_datamodel_selection.projection[$scope.field.subtitle]) {
                    $scope.field.subtitle_full_path = ($scope.ref_datamodel_selection.projection[$scope.field.subtitle].path == '' ? $scope.ref_datamodel_selection.projection[$scope.field.subtitle].technical_name : $scope.ref_datamodel_selection.projection[$scope.field.subtitle].path + '.' + $scope.ref_datamodel_selection.projection[$scope.field.subtitle].technical_name);
                }
            } else if ($scope.field.display == 'list' && $scope.field.subtitle_display == 'value' && $scope.field.subtitle_display_text == 'property') {
                if ($scope.ref_datamodel_subtitle.projection && $scope.ref_datamodel_subtitle.projection[$scope.field.subtitle]) {
                    $scope.field.subtitle_full_path = ($scope.ref_datamodel_subtitle.projection[$scope.field.subtitle].path == '' ? $scope.ref_datamodel_subtitle.projection[$scope.field.subtitle].technical_name : $scope.ref_datamodel_subtitle.projection[$scope.field.subtitle].path + '.' + $scope.ref_datamodel_subtitle.projection[$scope.field.subtitle].technical_name);
                }
            } else if ($scope.form.datamodel.projection && $scope.form.datamodel.projection[$scope.field.subtitle]) {
                $scope.field.subtitle_full_path = ($scope.form.datamodel.projection[$scope.field.subtitle].path == '' ? $scope.form.datamodel.projection[$scope.field.subtitle].technical_name : $scope.form.datamodel.projection[$scope.field.subtitle].path + '.' + $scope.form.datamodel.projection[$scope.field.subtitle].technical_name);
            }
        }
        if ($scope.field.date) {
            if ($scope.field.display == 'item') {
                if ($scope.ref_datamodel_selection.projection[$scope.field.date]) {
                    $scope.field.date_full_path = ($scope.ref_datamodel_selection.projection[$scope.field.date].path == '' ? $scope.ref_datamodel_selection.projection[$scope.field.date].technical_name : $scope.ref_datamodel_selection.projection[$scope.field.date].path + '.' + $scope.ref_datamodel_selection.projection[$scope.field.date].technical_name);
                }
            } else if ($scope.form.datamodel.projection[$scope.field.date]) {
                $scope.field.date_full_path = ($scope.form.datamodel.projection[$scope.field.date].path == '' ? $scope.form.datamodel.projection[$scope.field.date].technical_name : $scope.form.datamodel.projection[$scope.field.date].path + '.' + $scope.form.datamodel.projection[$scope.field.date].technical_name);
            }
        }
        delete $scope.form['translated_name'];
        if ($scope.form.actions) {
            for (var l = 0; l < $scope.form.actions.length; l++) {
                delete $scope.form.actions[l]['translated_name'];
            }
        }
        if ($scope.form.values) {
            for (var m = 0; m < $scope.form.values.length; m++) {
                delete $scope.form.values[m]['translated_name'];
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
