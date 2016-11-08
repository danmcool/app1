app1.controller('FormDetailsCtrl', function($scope, $routeParams, $location, $mdDialog, Forms, DataModels, Files, Datas, SessionService, MapService) {
    $scope.data = {};
    $scope.form = {};
    $scope.skip = 0;
    $scope.limit = 10;
    $scope.datas = [];
    $scope.stopScroll = false;
    $scope.tempStopScroll = false;
    $scope.files = [];
    $scope.getNextData = function() {
        if ($scope.stopScroll) return;
        if ($scope.tempStopScroll) return;
        if (!$scope.form.datamodel) return;
        var localLimit = $scope.limit;
        var localSkip = $scope.skip;
        $scope.skip += $scope.limit;
        $scope.tempStopScroll = true;
        Datas.query({
            datamodel_id: $scope.form.datamodel._id,
            search_criteria: $scope.form.search_criteria,
            skip: localSkip,
            limit: localLimit,
            sort_by: $scope.form.sort_by
        }).$promise.then(function(items) {
            if (items.length < $scope.limit) $scope.stopScroll = true;
            for (var i = 0; i < items.length; i++) {
                $scope.datas.push(items[i]);
            }
            $scope.tempStopScroll = false;
        });
    }
    $scope.initText = function() {
        $scope.form.title = SessionService.translate($scope.form.name);
        if ($scope.form.actions) {
            for (var i = 0; i < $scope.form.actions.length; i++) {
                $scope.form.actions[i].translated_name = SessionService.translate($scope.form.actions[i].name);
            }
        }
        if ($scope.form.item_actions) {
            for (var i = 0; i < $scope.form.item_actions.length; i++) {
                $scope.form.item_actions[i].translated_name = SessionService.translate($scope.form.item_actions[i].name);
            }
        }
        if ($scope.form.display) {
            for (var i = 0; i < $scope.form.display.length; i++) {
                if ($scope.form.display[i].text) {
                    $scope.form.display[i].translated_name = SessionService.translate($scope.form.display[i].text);
                } else {
                    $scope.form.display[i].translated_name = SessionService.translate($scope.form.datamodel.translation[$scope.form.display[i].name]);
                }
                if ($scope.form.display[i].previous) {
                    $scope.form.display[i].translated_previous = SessionService.translate($scope.form.display[i].previous);
                }
            }
        }
    }
    $scope.initComponents = function() {
        for (var i = 0; i < $scope.form.display.length; i++) {
            if ($scope.form.display[i].display == "selection") {
                for (var j = 0; j < $scope.form.values.length; j++) {
                    if ($scope.form.display[i].listofvalues == $scope.form.values[j]._id) {
                        $scope.form.display[i].values = [];
                        for (k = 0; k < $scope.form.values[j].values.length; k++) {
                            $scope.form.display[i].values.push(SessionService.translate($scope.form.values[j].values[k]));
                        }
                        break;
                    }
                }
            } else if ($scope.form.display[i].display == "address") {
                MapService.initMap();
                var field_name = $scope.form.display[i].name;
                MapService.geocodeAddress(data[field_name].address_line1 + ',' + data[field_name].address_line2 + ',' + data[field_name].address_city + ',' + data[field_name].address_state + ',' + data[field_name].address_postal_code + ',' + data[field_name].address_country);
            }
        }
    }
    Forms.get({
        id: $routeParams.id
    }, function(form, $resource) {
        $scope.form = form;
        $scope.initText();
        if (form.type == "form") {
            if ($routeParams.entry_id == '0') {
                $scope.data = new Datas({
                    datamodel_id: form.datamodel._id
                });
                $scope.initComponents();
            } else {
                Datas.get({
                    datamodel_id: form.datamodel._id,
                    entry_id: $routeParams.entry_id
                }).$promise.then(function(data) {
                    $scope.data = data;
                    $scope.initComponents();
                });
            }
        } else if (form.type == "list") {
            if (!$scope.form.search_criteria) form.search_criteria = "";
            var keysOfParameters = Object.keys($routeParams);
            for (i = 0, l = keysOfParameters.length; i < l; i++) {
                $scope.form.search_criteria = form.search_criteria.replace('@' + keysOfParameters[i], $routeParams[
                    keysOfParameters[i]]);
            }
            $scope.getNextData();
        }
    });
    var gotoNextForm = function(formula, next_form_id, data) {
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
    var uploadFile = function(file, signedRequest, url) {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', signedRequest);
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    //document.getElementById('preview').src = url;
                    //document.getElementById('avatar-url').value = url;
                } else {
                    alert('Could not upload file.');
                }
            }
        };
        xhr.send(file);
    }
    var updateComponents = function(form, data) {
        if ($scope.files.length > 0) {
            for (var i = 0; i < $scope.files.length; i++) {
                var currentFileData = $scope.files[i];
                var file = new Files({
                    "name": currentFileData.name,
                    "type": currentFileData.type
                });
                file.$save().then(function(res) {
                    for (var j = 0; j < $scope.files.length; j++) {
                        if ($scope.files[j].name == res.file.name) {
                            //data.files.push({"name":res.file.name,"type":res.file.type,"id":res.file._id,"url":res.url});
                            uploadFile($scope.files[j], res.signedRequest, res.url);
                        }
                    }
                });
            }
        }
        for (var i = 0; i < form.display.length; i++) {
            if (form.display[i].display == "feed") {
                var field_name = form.display[i].name;
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
    $scope.changeFiles = function(object) {
        //$scope.dynamicForm.$setValidity({"Attachments": true});
        $scope.files = [];
        for (i = 0; i < object.files.length; i++) {
            $scope.files.push(object.files[i]);
        }
    }
    $scope.create = function(formula, next_form_id, data) {
        updateComponents($scope.form, data);
        $scope.data.$save().then(function(res) {
            gotoNextForm(formula, next_form_id, data);
        })
            .catch(function(res) {
                $scope.data = res.data;
            });
    }
    $scope.modify = function(formula, next_form_id, data) {
        updateComponents($scope.form, data);
        Datas.update({
            datamodel_id: $scope.form.datamodel._id,
            entry_id: data._id
        }, data).$promise.then(function(res) {
            gotoNextForm(formula, next_form_id, data);
        })
            .catch(function(res) {
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
    $scope.delete = function(formula, next_form_id, data) {
        Datas.remove({
            datamodel_id: $scope.form.datamodel._id,
            entry_id: data._id
        }).$promise
            .then(function(res) {
                gotoNextForm(formula, next_form_id, data);
            })
            .catch(function(res) {
                /* show error*/
            })
            .finally(function() {
                console.log("always called");
            });
    }
    $scope.link = function(formula, next_form_id, data) {
        gotoNextForm(formula, next_form_id, data);
    }
});
