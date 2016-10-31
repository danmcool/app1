app1.controller('FormDetailsCtrl', function ($scope, $routeParams, Forms, DataModels, Files, Datas, Values, SessionService, $location, $mdDialog) {
    $scope.data = {};
    $scope.skip = 0;
    $scope.limit = 10;
    $scope.datas = [];
    $scope.stopScroll = false;
    $scope.tempStopScroll = false;
    $scope.files = [];
    $scope.getNextData = function () {
        if ($scope.stopScroll) return;
        if ($scope.tempStopScroll) return;
        if (!$scope.form.datamodel_id) return;
        var localLimit = $scope.limit;
        var localSkip = $scope.skip;
        $scope.skip += $scope.limit;
        $scope.tempStopScroll = true;
        Datas.query({
                datamodel_id: $scope.form.datamodel_id,
                search_criteria: $scope.form.search_criteria,
                skip: localSkip,
                limit: localLimit,
                sort_by: $scope.form.sort_by
            })
            .$promise.then(function (items) {
                if (items.length < $scope.limit) $scope.stopScroll = true;
                for (var i = 0; i < items.length; i++) {
                    $scope.datas.push(items[i]);
                }
                $scope.tempStopScroll = false;
            });
    }
    $scope.form = Forms.get({
        id: $routeParams.id
    }, function (form, $resource) {
        $scope.datamodel = DataModels.get({
            id: form.datamodel_id
        });
        if (form.type == "form") {
            if ($routeParams.entry_id == '0') {
                $scope.data = new Datas({
                    datamodel_id: form.datamodel_id
                });
            } else {
                $scope.data = Datas.get({
                    datamodel_id: form.datamodel_id,
                    entry_id: $routeParams.entry_id
                });
            }
        }
        for (var field in form.display) {
            if (form.display[field].display == "selection") {
                Values.get({
                    id: form.display[field].listofvalues
                }, function (listofvalues) {
                    for (current_field in $scope.form.display) {
                        if ($scope.form.display[current_field].listofvalues == listofvalues._id)
                            $scope.form.display[current_field].values = listofvalues.values;
                    }
                })
            }
        }
        var keysOfParameters = Object.keys($routeParams);
        if (!form.search_criteria) form.search_criteria = "";
        for (i = 0, l = keysOfParameters.length; i < l; i++) {
            form.search_criteria = form.search_criteria.replace('@' + keysOfParameters[i], $routeParams[
                keysOfParameters[i]]);
        }
        if (form.type == "list") {
            $scope.getNextData();
        }
    });
    var gotoNextForm = function (formula, next_form_id, data) {
        if (next_form_id == "home") {
            $location.url("/workflows/" + SessionService.getSessionData().application_id);
        } else {
            var formUrl = (data._id ? data._id : '0');
            formUrl = formUrl + '?skip=0&limit=10';
            if (formula) {
                keys = Object.keys(formula);
                for (i = 0, l = keys.length; i < l; i++) {
                    formUrl = formUrl + '&' + keys[i] + '=' + data[formula[keys[i]]];
                }
            }
            $location.url('/form/' + next_form_id + '/' + formUrl);
        }
    }
    var uploadFile = function (file, signedRequest, url) {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', signedRequest);
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    document.getElementById('preview').src = url;
                    document.getElementById('avatar-url').value = url;
                } else {
                    alert('Could not upload file.');
                }
            }
        };
        xhr.send(file);
    }
    var updateComponents = function (form, data) {
        if ($scope.files.length > 0) {
            for (var i = 0; i < $scope.files.length; i++) {
                var currentFileData = $scope.files[i];
                var file = new Files({
                    "name": currentFileData.name,
                    "type": currentFileData.type
                });
                file.$save().then(function (res) {
                    for (var j = 0; j < $scope.files.length; j++) {
                        if ($scope.files[j].name == res.file.name) {
                            //data.files.push({"name":res.file.name,"type":res.file.type,"id":res.file._id,"url":res.url});
                            uploadFile($scope.files[j], res.signedRequest, res.url);
                        }
                    }
                });
            }
        }
        for (field in form.display) {
            if (form.display[field].display == "feed") {
                var field_name = form.display[field].name;
                if (form.newvalues[field_name] && form.newvalues[field_name].length > 0) {
                    if (!data[field_name]) {
                        data[field_name] = [];
                    }
                    data[field_name].push({
                        "text": form.newvalues[field_name],
                        "from": SessionService.getSessionData().userData.name,
                        "date": Date.now()
                    });
                }
            }
        }
    }
    $scope.changeFiles = function (object) {
        //$scope.dynamicForm.$setValidity({"Attachments": true});
        $scope.files = [];
        for (i = 0; i < object.files.length; i++) {
            $scope.files.push(object.files[i]);
        }
    }
    $scope.create = function (formula, next_form_id, data) {
        updateComponents($scope.form, data);
        $scope.data.$save().then(function (res) {
                gotoNextForm(formula, next_form_id, data);
            })
            .catch(function (res) {
                $scope.data = res.data;
            });
    }
    $scope.modify = function (formula, next_form_id, data) {
        updateComponents($scope.form, data);
        Datas.update({
                datamodel_id: $scope.form.datamodel_id,
                entry_id: data._id
            }, data)
            .$promise.then(function (res) {
                gotoNextForm(formula, next_form_id, data);
            })
            .catch(function (res) {
                $scope.data = res.data;
                $mdDialog.show(
                    $mdDialog.alert()
                    .parent(angular.element(document.body))
                    .clickOutsideToClose(true)
                    .title('New version of document')
                    .textContent(
                        'The underlying data of this document has been modified by another user, please revise the content and save again!'
                    )
                    .ariaLabel('Alert Dialog Demo')
                    .ok('Got it!')
                );
            });
    }
    $scope.delete = function (formula, next_form_id, data) {
        Datas.remove({
                datamodel_id: $scope.form.datamodel_id,
                entry_id: data._id
            }).$promise
            .then(function (res) {
                gotoNextForm(formula, next_form_id, data);
            })
            .catch(function (res) {
                /* show error*/
            })
            .finally(function () {
                console.log("always called");
            });
    }
    $scope.link = function (formula, next_form_id, data) {
        gotoNextForm(formula, next_form_id, data);
    }
});
