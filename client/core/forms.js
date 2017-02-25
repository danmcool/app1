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
        if ($scope.form.display) {
            var display = $scope.form.display;
            for (var i = 0; i < display.length; i++) {
                if (display[i].display == 'address') {
                    display[i].address_line1_translated_name = SessionService.translate($scope.form.datamodel.translation[display[i].name].address_line1);
                    display[i].address_line2_translated_name = SessionService.translate($scope.form.datamodel.translation[display[i].name].address_line2);
                    display[i].address_city_translated_name = SessionService.translate($scope.form.datamodel.translation[display[i].name].address_city);
                    display[i].address_state_translated_name = SessionService.translate($scope.form.datamodel.translation[display[i].name].address_state);
                    display[i].address_postal_code_translated_name = SessionService.translate($scope.form.datamodel.translation[display[i].name].address_postal_code);
                    display[i].address_country_translated_name = SessionService.translate($scope.form.datamodel.translation[display[i].name].address_country);
                } else if (display[i].display == 'list') {
                    for (var j = 0; j < display[i].item_actions.length; j++) {
                        display[i].item_actions[j].translated_name = SessionService.translate(display[i].item_actions[j].name);
                    }
                }
                if (display[i].text) {
                    display[i].translated_name = SessionService.translate(display[i].text);
                } else {
                    display[i].translated_name = SessionService.translate($scope.form.datamodel.translation[display[i].name]);
                }
                if (display[i].previous) {
                    display[i].translated_previous = SessionService.translate(display[i].previous);
                }
            }
        }
    }

    var updateValues = function(formDisplay, valuesId, newValues) {
        for (var i = 0; i < formDisplay.length; i++) {
            if (formDisplay[i].listofvalues == valuesId) {
                formDisplay[i].values = [];
                formDisplay[i].values_key = {};
                for (k = 0; k < newValues.length; k++) {
                    formDisplay[i].values.push({
                        '_id': newValues[k]._id,
                        'name': SessionService.translate(newValues[k])
                    });
                    formDisplay[i].values_key[newValues[k]._id] =
                        SessionService.translate(newValues[k]);
                }
            } else if (formDisplay[i].title_listofvalues == valuesId) {
                formDisplay[i].title_values = {};
                for (k = 0; k < newValues.length; k++) {
                    formDisplay[i].title_values[newValues[k]._id] =
                        SessionService.translate(newValues[k]);
                }
            } else if (formDisplay[i].subtitle_listofvalues == valuesId) {
                formDisplay[i].subtitle_values = {};
                for (k = 0; k < newValues.length; k++) {
                    formDisplay[i].subtitle_values[newValues[k]._id] =
                        SessionService.translate(newValues[k]);
                }
            }

        }
    }
    var initComponents = function() {
        var formDisplay = $scope.form.display;
        var formValues = $scope.form.values;
        for (var j = 0; j < formValues.length; j++) {
            if (formValues[j].type == 'user') {
                Value.update({
                    id: formValues[j]._id,
                    type: formValues[j].type
                }, formValues[j].values).$promise.then(function(resValues) {
                    updateValues(formDisplay, resValues._id, resValues.values);

                });
            } else {
                updateValues(formDisplay, formValues[j]._id, formValues[j].values);
            }
        }
        for (var i = 0; i < formDisplay.length; i++) {
            if (formDisplay[i].display == 'address') {
                if (formDisplay[i].disabled) {
                    var field_name = formDisplay[i].name;
                    MapService.initMap('map' + field_name);
                    var address = $scope.data[field_name];
                    MapService.geocodeAddress('map' + field_name, (address.address_line1 ? (address.address_line1 + ',') : '') +
                        (address.address_line2 ? (address.address_line2 + ',') : '') + (address.address_city ? (address.address_city + ',') : '') + (address.address_postal_code ? (address.address_postal_code + ',') : '') + (address.address_country ? (address.address_country + ',') : ''));
                }
            } else if (formDisplay[i].display == 'calendar') {
                var field_name = formDisplay[i].name;
                if ($scope.data[field_name]) $scope.data[field_name] = new Date($scope.data[field_name]);
            } else if (formDisplay[i].display == 'calculation') {
                var data = $scope.data;
                formDisplay[i].calculation_value = eval(formDisplay[i].calculation);
            } else if (formDisplay[i].display == 'list') {
                if (!$scope.form.search_criteria) $scope.form.search_criteria = '';
                $scope.form.search_criteria = $scope.form.search_criteria.replace(/@_user_id/g, $scope.sessionData.userData._id);
                var keysOfParameters = Object.keys($routeParams);
                for (k = 0, l = keysOfParameters.length; k < l; k++) {
                    $scope.form.search_criteria = $scope.form.search_criteria.replace('@' + keysOfParameters[k], $routeParams[
                        keysOfParameters[k]]);
                }
                getNextData();
                //} else if (formDisplay[i].display == 'editor') {
                //if (formDisplay[i].disabled) {
                //    $scope.data[formDisplay[i].name] = $scope.data[formDisplay[i].name].replace(/\n/g, '<br>');
                //}
            }
        }
    }

    Forms.get({
        id: $routeParams.id
    }, function(form, $resource) {
        $scope.form = form;
        initText();
        if ($routeParams.entry_id == '0') {
            $scope.data = new Datas({
                datamodel_id: $scope.form.datamodel._id,
                _files: []
            });
            initComponents();
        } else {
            Datas.get({
                datamodel_id: $scope.form.datamodel._id,
                entry_id: $routeParams.entry_id
            }).$promise.then(function(data) {
                $scope.data = data;
                initComponents();
            });
        }
    });

    var gotoNextForm = function(formula, nextFormId, data) {
        if (nextFormId == 'home') {
            $location.url('/workflows/' + $scope.sessionData.application_id);
        } else {
            var formUrl = (data._id ? data._id : '0');
            formUrl = formUrl + '?skip=0&limit=10';
            if (formula) {
                keys = Object.keys(formula);
                for (i = 0, l = keys.length; i < l; i++) {
                    formUrl = formUrl + '&' + keys[i] + '=' + data[formula[keys[i]]];
                }
            }
            $location.url('/form/' + nextFormId + '/' + formUrl);
        }
    }

    var uploadFile = function(file, signedRequest, url) {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', signedRequest);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    $scope.currentFile++;
                    if ($scope.currentFile > $scope.filesCount) {
                        document.getElementById('file_upload').textContent = $scope.sessionData.appData.uploading_done;
                        setTimeout(function() {
                            document.getElementById('file_upload').textContent = '';
                        }, 4 * 1000);
                    } else {
                        document.getElementById('file_upload').textContent = $scope.sessionData.appData.uploading_in_progress + ' ' + $scope.currentFile + '/' + $scope.filesCount;
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
        //$scope.dynamicForm.$setValidity({'Attachments': true});
        if (!$scope.data._files) $scope.data._files = [];
        if (!$scope.files) $scope.files = [];
        $scope.filesCount = files.length;
        $scope.currentFile = 1;
        document.getElementById('file_upload').textContent = $scope.sessionData.appData.uploading_in_progress + ' ' + $scope.currentFile + '/' + $scope.filesCount;
        for (i = 0; i < $scope.filesCount; i++) {
            $scope.files.push(files[i]);
            var file = new Files({
                'name': files[i].name,
                'type': files[i].type
            });
            file.$save().then(function(res) {
                for (var j = 0; j < $scope.files.length; j++) {
                    if ($scope.files[j].name == res.file.name) {
                        $scope.data._files.push({
                            '_id': res.file._id,
                            'name': res.file.name,
                            'type': res.file.type
                        });
                        uploadFile(files[j], res.signedRequest, res.url);
                    }
                }
            });
        }
    }
    $scope.removeFile = function(fileId) {
        var files = $scope.data._files;
        for (var i = 0; i < files.length; i++) {
            if (files[i]._id == fileId) {
                files.splice(i, 1);
                Files.remove({
                    id: fileId
                }).$promise
                    .then(function(res) {})
                    .catch(function(res) {
                        /* show error*/
                    })
                break;
            }
        }
    }

    var updateComponents = function(form, setValue, data) {
        for (var i = 0; i < form.display.length; i++) {
            if (form.display[i].display == 'feed') {
                var field_name = form.display[i].name;
                if (form.newvalues[field_name] && form.newvalues[field_name].length > 0) {
                    if (!data[field_name]) {
                        data[field_name] = [];
                    }
                    data[field_name].push({
                        'text': form.newvalues[field_name],
                        'from': $scope.sessionData.userData.name,
                        'user': $scope.sessionData.userData.user,
                        'date': Date.now()
                    });
                }
            }
        }
        if (setValue) {
            data[setValue.name] = setValue.value;
        }
    }

    var updateErrorAlert = function() {
        $mdDialog.show(
            $mdDialog.alert()
            .parent(angular.element(document.body))
            .clickOutsideToClose(true)
            .title($scope.sessionData.appData.new_document_version)
            .textContent($scope.sessionData.appData.already_modified_document)
            .ok($scope.sessionData.appData.ok)
        );
    }

    $scope.create = function(formula, nextFormId, setValue, data) {
        updateComponents($scope.form, setValue, data);
        $scope.data.$save().then(function(res) {
            gotoNextForm(formula, nextFormId, data);
        }).catch(function(res) {
            $scope.data = res.data;
        });
    }
    $scope.modify = function(formula, nextFormId, setValue, data) {
        updateComponents($scope.form, setValue, data);
        Datas.update({
            datamodel_id: $scope.form.datamodel._id,
            entry_id: data._id
        }, data).$promise.then(function(res) {
            gotoNextForm(formula, nextFormId, data);
        }).catch(function(res) {
            $scope.data = res.data;
            updateErrorAlert();
        });
    }
    $scope.delete = function(formula, nextFormId, setValue, data) {
        $mdDialog.show(
            $mdDialog.confirm()
            .parent(angular.element(document.body))
            .clickOutsideToClose(true)
            .title($scope.sessionData.appData.confirmation)
            .textContent($scope.sessionData.appData.removal_confirmation)
            .ok($scope.sessionData.appData.ok)
            .cancel($scope.sessionData.appData.cancel)
        ).then(function() {
            Datas.remove({
                datamodel_id: $scope.form.datamodel._id,
                entry_id: data._id
            }).$promise
                .then(function(res) {
                    gotoNextForm(formula, nextFormId, data);
                })
                .catch(function(res) {
                    /* show error*/
                });
        });
    }
    $scope.link = function(formula, nextFormId, data) {
        gotoNextForm(formula, nextFormId, data);
    }
    $scope.associate = function(formula, nextFormId, setValue, data, actionItem, datamodel, idMap) {
        updateComponents($scope.form, setValue, data);
        if (datamodel == 'User') {
            data[actionItem].push($scope.sessionData.userData._id);
        } else {}
        Datas.update({
            datamodel_id: $scope.form.datamodel._id,
            entry_id: data._id
        }, data).$promise.then(function(res) {
            gotoNextForm(formula, nextFormId, data);
        }).catch(function(res) {
            $scope.data = res.data;
            updateErrorAlert();
        });
    }
    $scope.dissociate = function(formula, nextFormId, setValue, data, actionItem, datamodel, idMap) {
        updateComponents($scope.form, setValue, data);
        if (datamodel == 'User') {
            for (var i = data[actionItem].length - 1; i >= 0; i--) {
                if (data[actionItem][i] == $scope.sessionData.userData._id) {
                    data[actionItem].splice(i, 1);
                }
            }
        } else {}
        Datas.update({
            datamodel_id: $scope.form.datamodel._id,
            entry_id: data._id
        }, data).$promise.then(function(res) {
            gotoNextForm(formula, nextFormId, data);
        }).catch(function(res) {
            $scope.data = res.data;
            updateErrorAlert();
        });
    }
    $scope.share = function(formula, nextFormId, setValue, constraint, email_field_name, form_id, data) {
        updateComponents($scope.form, setValue, data);
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
                gotoNextForm(formula, nextFormId, data);
            })
        }).catch(function(res) {
            $scope.data = res.data;
            updateErrorAlert();
        });
    }
    $scope.calendar = function(formula, nextFormId, setValue, project_name_field, start_date_field, end_date_field, data) {
        updateComponents($scope.form, setValue, data);
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
                gotoNextForm(formula, nextFormId, data);
            })
        }).catch(function(res) {
            $scope.data = res.data;
            updateErrorAlert();
        });
    }
});
