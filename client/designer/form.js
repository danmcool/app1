app1.controller('FormEditCtrl', ['$scope', '$resource', '$location', '$routeParams', '$mdDialog', 'SessionService', 'DesignForm', 'DataModels', function ($scope, $resource, $location, $routeParams, $mdDialog, SessionService, DesignForm, DataModels) {
	$scope.sessionData = SessionService.getSessionData();
	$scope.$watch(function () {
		return SessionService.getSessionData();
	}, function (newValue, oldValue) {
		if (newValue != oldValue) {
			$scope.sessionData = newValue;
		}
	});

	DesignForm.get({
		id: $routeParams.id
	}, function (resultForm, err) {
		//for (var i = 0; i < resultForm.actions.length; i++) {
		//    resultForm.actions[i].translated_name = SessionService.translate(resultForm.actions[i].name);
		//    resultForm.actions[i].translated_description = SessionService.translate(resultForm.actions[i].description);
		//}
		$scope.form = resultForm;
		$scope.sessionData.applicationName = $scope.sessionData.appData.app_designer;
		SessionService.setSessionData($scope.sessionData);
	});

	$scope.editText = function (object, property, multipleLines) {
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
	};

	$scope.editAction = function (formId) {
		$location.url('/form_edit/' + formId);
	}

	$scope.newAction = function () {
		$mdDialog.show(
			$mdDialog.prompt()
			.parent(angular.element(document.body))
			.clickOutsideToClose(true)
			.title($scope.sessionData.appData.new_workflow)
			.textContent($scope.sessionData.appData.new_workflow_name)
			.initialValue('My Form')
			.ok($scope.sessionData.appData.ok)
			.cancel($scope.sessionData.appData.cancel)
		).then(function (result) {
			var newWorkflow = new DesignWorkflow({
				name: {
					en: result
				}
			});
			newWorkflow.$save(function () {
				newWorkflow.translated_name = newWorkflow.name.en;
				$scope.application.workflows.push(newWorkflow);
			});
		});
	}

	$scope.newSection = function () {
		$mdDialog.show(
			$mdDialog.prompt()
			.parent(angular.element(document.body))
			.clickOutsideToClose(true)
			.title($scope.sessionData.appData.new_field)
			.textContent($scope.sessionData.appData.new_field_name)
			.initialValue('New Field')
			.ok($scope.sessionData.appData.ok)
			.cancel($scope.sessionData.appData.cancel)
		).then(function (result) {
			if (!$scope.form.display) {
				$scope.form.display = [];
			}
			$scope.form.display.push({
				'blocks': [{
					'fields': [{
						'name': result
                    }]
                }]
			});
		});
	}

	$scope.newBlock = function (blocks) {
		$mdDialog.show(
			$mdDialog.prompt()
			.parent(angular.element(document.body))
			.clickOutsideToClose(true)
			.title($scope.sessionData.appData.new_field)
			.textContent($scope.sessionData.appData.new_field_name)
			.initialValue('New Field')
			.ok($scope.sessionData.appData.ok)
			.cancel($scope.sessionData.appData.cancel)
		).then(function (result) {
			if (!$scope.form.display) {
				$scope.form.display = [];
			}
			blocks.push({
				'fields': [{
					'name': result
                }]
			});
		});
	}

	$scope.newField = function (fields) {
		$mdDialog.show(
			$mdDialog.prompt()
			.parent(angular.element(document.body))
			.clickOutsideToClose(true)
			.title($scope.sessionData.appData.new_field)
			.textContent($scope.sessionData.appData.new_field_name)
			.initialValue('New Field')
			.ok($scope.sessionData.appData.ok)
			.cancel($scope.sessionData.appData.cancel)
		).then(function (result) {
			if (!$scope.form.display) {
				$scope.form.display = [];
			}
			fields.push({
				'name': result
			});
		});
	}

	$scope.save = function () {
		DesignForm.update({
			id: $scope.form._id
		}, $scope.form).$promise.then(function (res) {
			SessionService.init();
			$location.url('/workflow_edit/' + $routeParams.workflow_id + '?application_id=' + $routeParams.application_id);
		}).catch(function (res) {
			$scope.application = res.application;
			updateErrorAlert();
		});
	}

	$scope.onDragEnter = function (event) {
		element.classList.add('dash_line');
	}

	function onDragLeave(event) {
		element.classList.remove('dash_line'); // this / e.target is previous target element.
	}

}]);
