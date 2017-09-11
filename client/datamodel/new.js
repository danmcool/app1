app1.controller('NewFieldCtrl', ['$scope', '$mdDialog', 'SessionService', 'field_types', function ($scope, $mdDialog, SessionService) {
    $scope.sessionData = SessionService.getSessionData();
    $scope.$watch(function () {
        return SessionService.getSessionData();
    }, function (newValue, oldValue) {
        if (newValue != oldValue) {
            $scope.sessionData = newValue;
        }
    });


    $scope.field_type = {
        text: {
            en: 'Text',
            fr: 'Texte'
        },
        number: {
            en: 'Number',
            fr: 'Nombre'
        },
        boolean: {
            en: 'Boolean',
            fr: 'Boolean'
        },
        date: {
            en: 'Date',
            fr: 'Date'
        },
        currency: {
            en: 'Amount',
            fr: 'Montant'
        },
        reference: {
            en: 'Detail',
            fr: 'Détail'
        },
        item: {
            en: 'Detail List',
            fr: 'Liste de détails'
        },
        feed: {
            en: 'Discussion Feed',
            fr: 'Fil de discussion'
        },
        address: {
            en: 'Address',
            fr: 'Adresse'
        },
        node: {
            en: 'Node',
            fr: 'Noeud'
        }
    }
    var keysOfFieldType = Object.keys($scope.field_type);
    $scope.field_types = [];
    for (i = 0; i < keysOfFieldType.length; i++) {
        $scope.field_type[keysOfFieldType[i]].translated_name = SessionService.translate($scope.field_type[keysOfFieldType[i]]);
        $scope.field_types.push({
            translated_name: $scope.field_type[keysOfFieldType[i]].translated_name,
            type: keysOfFieldType[i]
        });
    }

    $scope.field = {};

    $scope.hide = function () {
        $mdDialog.hide();
    };

    $scope.cancel = function () {
        $mdDialog.cancel();
    };

    $scope.answer = function () {
        $mdDialog.hide($scope.field);
    };
}]);
