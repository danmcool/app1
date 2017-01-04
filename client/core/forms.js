app1.controller('FormDetailsCtrl', function($scope, $routeParams, $location, $mdDialog, Forms, Value, Share, Calendar, DataModels, Files, Datas, SessionService, MapService) {
    $scope.sessionData = SessionService.getSessionData();

    $scope.$watch(function() {
        return SessionService.getSessionData();
    }, function(newValue, oldValue) {
        if (newValue != oldValue) $scope.sessionData = newValue;
    });

    $scope.data = {};
    $scope.form = {};
    $scope.skip = 0;
    $scope.limit = 10;
    $scope.datas = [];
    $scope.stopScroll = false;
    $scope.tempStopScroll = false;
    $scope.files = [];
    $scope.currentFile = 0;
    $scope.filesCount = 0;

    var getNextData = function() {
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

    var initText = function() {
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
                if ($scope.form.display[i].display == "address") {
                    $scope.form.display[i].address_line1_translated_name = SessionService.translate($scope.form.datamodel.translation[$scope.form.display[i].name].address_line1);
                    $scope.form.display[i].address_line2_translated_name = SessionService.translate($scope.form.datamodel.translation[$scope.form.display[i].name].address_line2);
                    $scope.form.display[i].address_city_translated_name = SessionService.translate($scope.form.datamodel.translation[$scope.form.display[i].name].address_city);
                    $scope.form.display[i].address_state_translated_name = SessionService.translate($scope.form.datamodel.translation[$scope.form.display[i].name].address_state);
                    $scope.form.display[i].address_postal_code_translated_name = SessionService.translate($scope.form.datamodel.translation[$scope.form.display[i].name].address_postal_code);
                    $scope.form.display[i].address_country_translated_name = SessionService.translate($scope.form.datamodel.translation[$scope.form.display[i].name].address_country);
                }
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

    var initComponentsList = function() {
        if (!$scope.form.search_criteria) $scope.form.search_criteria = "";
        var keysOfParameters = Object.keys($routeParams);
        for (i = 0, l = keysOfParameters.length; i < l; i++) {
            $scope.form.search_criteria = $scope.form.search_criteria.replace('@' + keysOfParameters[i], $routeParams[
                keysOfParameters[i]]);
        }
        for (var j = 0; j < $scope.form.values.length; j++) {
            if ($scope.form.display.title_listofvalues == $scope.form.values[j]._id) {
                if ($scope.form.values[j].type == "user") {
                    Value.update({
                        id: $scope.form.values[j]._id,
                        type: $scope.form.values[j].type
                    }, $scope.form.values[j].values).$promise.then(function(res) {
                        $scope.form.display.title_values = {};
                        for (l = 0; l < res.values.length; l++) {
                            $scope.form.display.title_values[res.values[l]._id] =
                                SessionService.translate(res.values[l]);
                        }
                    });
                } else if ($scope.form.values[j].type == "query") {} else {
                    $scope.form.display.title_values = {};
                    for (k = 0; k < $scope.form.values[j].values.length; k++) {
                        $scope.form.display.title_values[$scope.form.values[j].values[k]._id] =
                            SessionService.translate($scope.form.values[j].values[k]);
                    }
                }
            } else if ($scope.form.display.subtitle_listofvalues == $scope.form.values[j]._id) {
                if ($scope.form.values[j].type == "user") {
                    Value.update({
                        id: $scope.form.values[j]._id,
                        type: $scope.form.values[j].type
                    }, $scope.form.values[j].values).$promise.then(function(res) {
                        $scope.form.display.subtitle_values = {};
                        for (l = 0; l < res.values.length; l++) {
                            $scope.form.display.subtitle_values[res.values[l]._id] =
                                SessionService.translate(res.values[l]);
                        }
                    });
                } else if ($scope.form.values[j].type == "query") {} else {
                    $scope.form.display.subtitle_values = {};
                    for (k = 0; k < $scope.form.values[j].values.length; k++) {
                        $scope.form.display.subtitle_values[$scope.form.values[j].values[k]._id] =
                            SessionService.translate($scope.form.values[j].values[k]);
                    }
                }
            }
        }
    }

    var initComponentsForm = function() {
        for (var i = 0; i < $scope.form.display.length; i++) {
            if ($scope.form.display[i].display == "selection" || $scope.form.display[i].display == "currency") {
                for (var j = 0; j < $scope.form.values.length; j++) {
                    if ($scope.form.display[i].listofvalues == $scope.form.values[j]._id) {
                        if ($scope.form.values[j].type == "user") {
                            Value.update({
                                id: $scope.form.values[j]._id,
                                type: $scope.form.values[j].type
                            }, $scope.form.values[j].values).$promise.then(function(res) {
                                for (var k = 0; k < $scope.form.display.length; k++) {
                                    if ($scope.form.display[k].listofvalues == res._id) {
                                        $scope.form.display[k].values = [];
                                        $scope.form.display[k].values_key = {};
                                        for (l = 0; l < res.values.length; l++) {
                                            $scope.form.display[k].values.push({
                                                "_id": res.values[l]._id,
                                                "name": SessionService.translate(res.values[l])
                                            });
                                            $scope.form.display[k].values_key[res.values[l]._id] =
                                                SessionService.translate(res.values[l]);
                                        }
                                    }
                                }
                            })
                        } else if ($scope.form.values[j].type == "query") {
                            $scope.form.display[i].values = [];
                            $scope.form.display[i].values_key = {};
                            for (k = 0; k < $scope.form.values[j].values.length; k++) {
                                $scope.form.display[i].values.push({
                                    "_id": $scope.form.values[j].values[k]._id,
                                    "name": SessionService.translate($scope.form.values[j].values[k])
                                });
                                $scope.form.display[i].values_key[$scope.form.values[j].values[k]._id] =
                                    SessionService.translate($scope.form.values[j].values[k]);
                            }
                        } else {
                            $scope.form.display[i].values = [];
                            $scope.form.display[i].values_key = {};
                            for (k = 0; k < $scope.form.values[j].values.length; k++) {
                                $scope.form.display[i].values.push({
                                    "_id": $scope.form.values[j].values[k]._id,
                                    "name": SessionService.translate($scope.form.values[j].values[k])
                                });
                                $scope.form.display[i].values_key[$scope.form.values[j].values[k]._id] =
                                    SessionService.translate($scope.form.values[j].values[k]);
                            }
                        }
                    }
                }
            } else if ($scope.form.display[i].display == "address") {
                if ($scope.form.display[i].disabled) {
                    var field_name = $scope.form.display[i].name;
                    MapService.initMap("map" + field_name);
                    var address = $scope.data[field_name];
                    MapService.geocodeAddress("map" + field_name, (address.address_line1 ? (address.address_line1 + ',') : '') +
                        (address.address_line2 ? (address.address_line2 + ',') : '') + (address.address_city ? (address.address_city + ',') : '') + (address.address_postal_code ? (address.address_postal_code + ',') : '') + (address.address_country ? (address.address_country + ',') : ''));
                }
            } else if ($scope.form.display[i].display == "calendar") {
                var field_name = $scope.form.display[i].name;
                if ($scope.data[field_name]) $scope.data[field_name] = new Date($scope.data[field_name]);
            }
        }
    }

    Forms.get({
        id: $routeParams.id
    }, function(form, $resource) {
        $scope.form = form;
        initText();
        if ($scope.form.type == "form") {
            if ($routeParams.entry_id == '0') {
                $scope.data = new Datas({
                    datamodel_id: $scope.form.datamodel._id,
                    _files: []
                });
                initComponentsForm();
            } else {
                Datas.get({
                    datamodel_id: $scope.form.datamodel._id,
                    entry_id: $routeParams.entry_id
                }).$promise.then(function(data) {
                    $scope.data = data;
                    initComponentsForm();
                });
            }
        } else if ($scope.form.type == "list") {
            initComponentsList();
            getNextData();
        }
    });

    var gotoNextForm = function(formula, next_form_id, data) {
        if (next_form_id == "home") {
            $location.url("/workflows/" + $scope.sessionData.application_id);
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
        xhr.onreadystatechange = function(){
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    $scope.currentFile++;
                    if ($scope.currentFile > $scope.filesCount) {
                        document.getElementById('file_upload').textContent = $scope.sessionData.appData.uploading_done;
                    } else {
                        document.getElementById('file_upload').textContent = $scope.sessionData.appData.uploading_in_progress + " " + $scope.currentFile + "/" + $scope.filesCount;
                    }
                    //document.getElementById('file_upload').src = url;
                    //document.getElementById('avatar-url').value = url;
                } else {
                    alert('Could not upload file.');
                }
            }
        };
        xhr.send(file);
    };
    $scope.changeFiles = function(files) {
        if (files.length == 0) return;
        //$scope.dynamicForm.$setValidity({"Attachments": true});
        $scope.data._files = [];
        $scope.files = [];
        $scope.filesCount = files.length;
        $scope.currentFile = 1;
        document.getElementById('file_upload').textContent = $scope.sessionData.appData.uploading_in_progress + " " + $scope.currentFile + "/" + $scope.filesCount;
        for (i = 0; i < $scope.filesCount; i++) {
            $scope.files.push(files[i]);
            var file = new Files({
                "name": files[i].name,
                "type": files[i].type
            });
            file.$save().then(function(res) {
                for (var j = 0; j < $scope.files.length; j++) {
                    if ($scope.files[j].name == res.file.name) {
                        $scope.data._files.push({
                            "_id": res.file._id
                        });
                        uploadFile(files[j], res.signedRequest, res.url);
                    }
                }
            });
        }
    }

    var updateComponents = function(form, set_value, data) {
        for (var i = 0; i < form.display.length; i++) {
            if (form.display[i].display == "feed") {
                var field_name = form.display[i].name;
                if (form.newvalues[field_name] && form.newvalues[field_name].length > 0) {
                    if (!data[field_name]) {
                        data[field_name] = [];
                    }
                    data[field_name].push({
                        "text": form.newvalues[field_name],
                        "from": $scope.sessionData.userData.name,
                        "user": $scope.sessionData.userData.user,
                        "date": Date.now()
                    });
                }
            }
        }
        if (set_value) {
            data[set_value.name] = set_value.value;
        }
    }

    $scope.create = function(formula, next_form_id, set_value, data) {
        updateComponents($scope.form, set_value, data);
        $scope.data.$save().then(function(res) {
            gotoNextForm(formula, next_form_id, data);
        }).catch(function(res) {
            $scope.data = res.data;
        });
    }
    $scope.modify = function(formula, next_form_id, set_value, data) {
        updateComponents($scope.form, set_value, data);
        Datas.update({
            datamodel_id: $scope.form.datamodel._id,
            entry_id: data._id
        }, data).$promise.then(function(res) {
            gotoNextForm(formula, next_form_id, data);
        }).catch(function(res) {
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
    $scope.share = function(formula, next_form_id, set_value, constraint, email_field_name, form_id, data) {
        updateComponents($scope.form, set_value, data);
        Datas.update({
            datamodel_id: $scope.form.datamodel._id,
            entry_id: data._id
        }, data).$promise.then(function(res) {
            Share.get({
                form_id: form_id,
                datamodel_id: $scope.form.datamodel._id,
                data_id: data._id,
                email: data[email_field_name],
                key: constraint.key,
                value: constraint.value
            }).$promise.then(function(res) {
                gotoNextForm(formula, next_form_id, data);
            })
        }).catch(function(res) {
            $scope.data = res.data;
            $mdDialog.show(
                $mdDialog.alert()
                .parent(angular.element(document.body))
                .clickOutsideToClose(true)
                .title('New version of document')
                .textContent('The underlying data of this document has been modified by another user,' +
                    ' please revise the content and save again!')
                .ariaLabel('Alert Dialog Demo')
                .ok('Got it!')
            );
        });
    }
    $scope.calendar = function(formula, next_form_id, set_value, project_name_field, start_date_field, end_date_field, data) {
        updateComponents($scope.form, set_value, data);
        Datas.update({
            datamodel_id: $scope.form.datamodel._id,
            entry_id: data._id
        }, data).$promise.then(function(res) {
            Calendar.get({
                project_name: data[project_name_field],
                start_date: data[start_date_field],
                end_date: data[end_date_field],
                user_id: data._user
            }).$promise.then(function(res) {
                gotoNextForm(formula, next_form_id, data);
            })
        }).catch(function(res) {
            $scope.data = res.data;
            $mdDialog.show(
                $mdDialog.alert()
                .parent(angular.element(document.body))
                .clickOutsideToClose(true)
                .title('New version of document')
                .textContent('The underlying data of this document has been modified by another user,' +
                    ' please revise the content and save again!')
                .ariaLabel('Alert Dialog Demo')
                .ok('Got it!')
            );
        });
    }
});
