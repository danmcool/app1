app1.controller('FormDisplayEditCtrl', ['$scope', '$routeParams', '$mdDialog', 'SessionService', 'DesignForm', 'DesignDataModel', function ($scope, $routeParams, $mdDialog, SessionService, DesignForm, DesignDataModel) {
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
    var keysOfText = Object.keys($scope.display_type);
    $scope.display_types = [];
    for (i = 0; i < keysOfText.length; i++) {
        $scope.display_types.push({
            translated_name: SessionService.translate($scope.display_type[keysOfText[i]]),
            type: keysOfText[i]
        });
    }

    DesignForm.get({
        id: $routeParams.id
    }, function (resultForm, err) {
        $scope.form = resultForm;
        $scope.form.translated_name = SessionService.translate($scope.form.name);
        $scope.field = $scope.form.display[$scope.section_index].blocks[$scope.block_index].fields[$scope.field_index];
        $scope.datamodel_keys = [];
        var datamodelkeys = Object.keys($scope.form.datamodel.translation);
        for (var i = 0; i < datamodelkeys.length; i++) {
            $scope.datamodel_keys.push({
                translated_name: SessionService.translate($scope.form.datamodel.translation[datamodelkeys[i]]),
                id: datamodelkeys[i]
            });
        }
        for (var i = 0; i < $scope.form.actions.length; i++) {
            $scope.form.actions[i].translated_name = SessionService.translate($scope.form.actions[i].name);
        }
        for (var i = 0; i < $scope.form.values.length; i++) {
            $scope.form.values[i].translated_name = SessionService.translate($scope.form.values[i].name);
        }
        $scope.sessionData.applicationName = $scope.sessionData.appData.app_designer;
        SessionService.setSessionData($scope.sessionData);
    })

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
            SessionService.location('/form_edit/' + formId + '?application_id=' + $routeParams.application_id + '&workflow_id=' + $scope.workflow._id);
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
