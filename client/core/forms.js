app1.controller('FormDetailsCtrl', function($scope, $routeParams, $location, $route, $mdDialog, Forms, Value, Share, Calendar, DataModels, Files, Datas, SessionService, MapService, Notify) {
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
        if ($scope.form.fields) {
            var fields = $scope.form.fields;
            for (var i = 0; i < fields.length; i++) {
                if (fields[i].display == 'address') {
                    fields[i].address_line1_translated_name = SessionService.translate($scope.form.datamodel.translation[fields[i].name].address_line1);
                    fields[i].address_line2_translated_name = SessionService.translate($scope.form.datamodel.translation[fields[i].name].address_line2);
                    fields[i].address_city_translated_name = SessionService.translate($scope.form.datamodel.translation[fields[i].name].address_city);
                    fields[i].address_state_translated_name = SessionService.translate($scope.form.datamodel.translation[fields[i].name].address_state);
                    fields[i].address_postal_code_translated_name = SessionService.translate($scope.form.datamodel.translation[fields[i].name].address_postal_code);
                    fields[i].address_country_translated_name = SessionService.translate($scope.form.datamodel.translation[fields[i].name].address_country);
                } else if (fields[i].display == 'list' || fields[i].display == 'item') {
                    if (fields[i].item_actions) {
                        for (var j = 0; j < fields[i].item_actions.length; j++) {
                            fields[i].item_actions[j].translated_name = SessionService.translate(fields[i].item_actions[j].name);
                        }
                    }
                }
                if (fields[i].text) {
                    fields[i].translated_name = SessionService.translate(fields[i].text);
                } else {
                    fields[i].translated_name = SessionService.translate($scope.form.datamodel.translation[fields[i].name]);
                }
                if (fields[i].previous) {
                    fields[i].translated_previous = SessionService.translate(fields[i].previous);
                }
            }
        }
    }

    var updateValuesForm = function(index, newValues) {
        var formFields = $scope.form.fields[index];
        formFields.values = [];
        formFields.values_key = {};
        for (k = 0; k < newValues.length; k++) {
            formFields.values.push({
                '_id': newValues[k]._id,
                'name': SessionService.translate(newValues[k])
            });
            formFields.values_key[newValues[k]._id] =
                SessionService.translate(newValues[k]);
        }
    }
    var updateValuesTitle = function(index, newValues) {
        var formFields = $scope.form.fields[index];
        formFields.title_values = {};
        for (k = 0; k < newValues.length; k++) {
            formFields.title_values[newValues[k]._id] =
                SessionService.translate(newValues[k]);
        }
    }
    var updateValuesSubTitle = function(index, newValues) {
        var formFields = $scope.form.fields[index];
        formFields.subtitle_values = {};
        for (k = 0; k < newValues.length; k++) {
            formFields.subtitle_values[newValues[k]._id] =
                SessionService.translate(newValues[k]);
        }
    }
    var updateValuesItems = function(index, newValues) {
        var formFields = $scope.form.fields[index];
        var valuesFieldName = formFields.items + '_values';
        formFields[valuesFieldName] = newValues;
        $scope.data[formFields.items] = newValues;
    }
    var initComponents = function() {
        var formFields = $scope.form.fields;
        var formValues = $scope.form.values;
        for (var i = 0; i < formFields.length; i++) {
            if (formFields[i].display == 'address') {
                if (formFields[i].disabled) {
                    var field_name = formFields[i].name;
                    MapService.initMap('map' + field_name);
                    var address = $scope.data[field_name];
                    MapService.geocodeAddress('map' + field_name, (address.address_line1 ? (address.address_line1 + ',') : '') +
                        (address.address_line2 ? (address.address_line2 + ',') : '') + (address.address_city ? (address.address_city + ',') : '') + (address.address_postal_code ? (address.address_postal_code + ',') : '') + (address.address_country ? (address.address_country + ',') : ''));
                }
            } else if (formFields[i].display == 'selection' || formFields[i].display == 'currency') {
                for (var j = 0; j < formValues.length; j++) {
                    if (formFields[i].listofvalues == formValues[j]._id) {
                        if (formValues[j].type == 'list') {
                            updateValuesForm(i, formValues[j].values);
                        } else {
                            var itemValues = formValues[j].values;
                            itemValues.index = i;
                            Value.update({
                                id: formValues[j]._id,
                                type: formValues[j].type
                            }, itemValues).$promise.then(function(resValues) {
                                updateValuesForm(resValues.index, resValues.values);
                            });
                        }
                        break;
                    }
                }
            } else if (formFields[i].display == 'calendar') {
                var field_name = formFields[i].name;
                if ($scope.data[field_name]) $scope.data[field_name] = new Date($scope.data[field_name]);
            } else if (formFields[i].display == 'calculation') {
                var data = $scope.data;
                formFields[i].calculation_value = eval(formFields[i].calculation);
            } else if (formFields[i].display == 'list') {
                for (var j = 0; j < formValues.length; j++) {
                    if (formFields[i].title_listofvalues == formValues[j]._id) {
                        if (formValues[j].type == 'list') {
                            updateValuesTitle(i, formValues[j].values);
                        } else {
                            var itemValues = formValues[j].values;
                            itemValues.index = i;
                            Value.update({
                                id: formValues[j]._id,
                                type: formValues[j].type
                            }, itemValues).$promise.then(function(resValues) {
                                updateValuesTitle(resValues.index, resValues.values);
                            });
                        }
                    } else if (formFields[i].subtitle_listofvalues == formValues[j]._id) {
                        if (formValues[j].type == 'list') {
                            updateValuesSubTitle(i, formValues[j].values);
                        } else {
                            var itemValues = formValues[j].values;
                            itemValues.index = i;
                            Value.update({
                                id: formValues[j]._id,
                                type: formValues[j].type,
                            }, itemValues).$promise.then(function(resValues) {
                                updateValuesSubTitle(resValues.index, resValues.values);
                            });
                        }
                    }
                }
                if (!$scope.form.search_criteria) $scope.form.search_criteria = '';
                $scope.form.search_criteria = $scope.form.search_criteria.replace(/@_user_id/g, $scope.sessionData.userData._id);
                var keysOfParameters = Object.keys($routeParams);
                for (k = 0, l = keysOfParameters.length; k < l; k++) {
                    $scope.form.search_criteria = $scope.form.search_criteria.replace('@' + keysOfParameters[k], $routeParams[
                        keysOfParameters[k]]);
                }
                getNextData();
                //} else if (formFields[i].display == 'editor') {
                //if (formFields[i].disabled) {
                //    $scope.data[formFields[i].name] = $scope.data[formFields[i].name].replace(/\n/g, '<br>');
                //}
            } else if (formFields[i].display == 'item') {
                for (var j = 0; j < formValues.length; j++) {
                    if (formFields[i].listofvalues == formValues[j]._id) {
                        if (formValues[j].type == 'list') {
                            updateValuesItems(i, formValues[j].values);
                        } else {
                            var itemValues = {
                                index: i
                            };
                            itemValues.relation = formValues[j].values.relation;
                            itemValues.id_list = $scope.data[formFields[i].items];
                            Value.update({
                                id: formValues[j]._id,
                                type: formValues[j].type,
                            }, itemValues).$promise.then(function(resValues) {
                                updateValuesItems(resValues.index, resValues.values);
                            });
                        }
                    }
                }

            }
        }
    }

    Forms.get({
        id: $routeParams.id
    }, function(form, $resource) {
        $scope.form = form;
        var formDisplay = $scope.form.display;
        $scope.form.fields = [];
        for (var i = 0; i < formDisplay.length; i++) {
            for (var j = 0; j < formDisplay[i].blocks.length; j++) {
                for (var k = 0; k < formDisplay[i].blocks[j].fields.length; k++) {
                    $scope.form.fields.push(formDisplay[i].blocks[j].fields[k]);
                }
            }
        }

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

    var rand = function() {
        return Math.random().toString(16).substr(2);
    };

    var gotoNextForm = function(formula, nextFormId, data) {
        if (nextFormId == 'home') {
            $location.url('/workflows/' + $scope.sessionData.application_id);
        } else {
            var formUrl;
            if (data && data._id) {
                formUrl = data._id;
                if (formula) {
                    keys = Object.keys(formula);
                    if (keys.length > 0) {
                        formUrl = formUrl + '?';
                    }
                    for (i = 0; i < keys.length; i++) {
                        formUrl = formUrl + '&' + keys[i] + '=' + data[formula[keys[i]]];
                    }
                }
            } else {
                formUrl = '0';
            }
            formUrl = '/form/' + nextFormId + '/' + formUrl;
            if (formUrl != $location.path()) {
                $location.url(formUrl);
            } else {
                $route.reload();
            }
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

    var notify = function(notifyUserId, emailTitle, emailHtml) {
        if (notifyUserId && emailTitle && emailHtml) {
            var translatedEmail = SessionService.translate(emailHtml);
            var fieldList = translatedEmail.match(/@\w*@/g);
            for (var i = 0; i < fieldList.length; i++) {
                if (fieldList[i] != '@@') {
                    translatedEmail = translatedEmail.replace(new RegExp(fieldList[i], 'g'), $scope.data[fieldList[i].replace(/@/g, '')]);
                }
            }
            Notify.update({
                user_id: notifyUserId
            }, {
                email_title: SessionService.translate(emailTitle),
                email_html: translatedEmail
            });
        }
    }

    $scope.create = function(formula, nextFormId, setValue, data, notifyUser, emailTitle, emailHtml) {
        updateComponents($scope.form, setValue, data);
        $scope.data.$save().then(function(res) {
            if (notifyUser) {
                if (notifyUser == 'current') {
                    notify($scope.sessionData.userData._id, emailTitle, emailHtml);
                } else if (notifyUser == 'owner') {
                    notify(data._user, emailTitle, emailHtml);
                }
            }
            gotoNextForm(formula, nextFormId, null);
        }).catch(function(res) {
            $scope.data = res.data;
        });
    }
    $scope.modify = function(formula, nextFormId, setValue, data, notifyUser, emailTitle, emailHtml) {
        updateComponents($scope.form, setValue, data);
        Datas.update({
            datamodel_id: $scope.form.datamodel._id,
            entry_id: data._id
        }, data).$promise.then(function(res) {
            if (notifyUser) {
                if (notifyUser == 'current') {
                    notify($scope.sessionData.userData._id, emailTitle, emailHtml);
                } else if (notifyUser == 'owner') {
                    notify(data._user, emailTitle, emailHtml);
                }
            }
            gotoNextForm(formula, nextFormId, null);
        }).catch(function(res) {
            $scope.data = res.data;
            updateErrorAlert();
        });
    }
    $scope.delete = function(formula, nextFormId, data, notifyUser, emailTitle, emailHtml) {
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
                    if (notifyUser) {
                        if (notifyUser == 'current') {
                            notify($scope.sessionData.userData._id, emailTitle, emailHtml);
                        } else if (notifyUser == 'owner') {
                            notify(data._user, emailTitle, emailHtml);
                        }
                    }
                    gotoNextForm(formula, nextFormId, null);
                })
                .catch(function(res) {
                    /* show error*/
                });
        });
    }
    $scope.link = function(formula, nextFormId, data, notifyUser, emailTitle, emailHtml) {
        if (notifyUser) {
            if (notifyUser == 'current') {
                notify($scope.sessionData.userData._id, emailTitle, emailHtml);
            } else if (notifyUser == 'owner') {
                notify(data._user, emailTitle, emailHtml);
            }
        }
        gotoNextForm(formula, nextFormId, data);
    }
    $scope.linkEmpty = function(formula, nextFormId, data, notifyUser, emailTitle, emailHtml) {
        if (notifyUser) {
            if (notifyUser == 'current') {
                notify($scope.sessionData.userData._id, emailTitle, emailHtml);
            } else if (notifyUser == 'owner') {
                notify(data._user, emailTitle, emailHtml);
            }
        }
        gotoNextForm(formula, nextFormId, null);
    }
    $scope.associate = function(formula, nextFormId, setValue, data, actionItem, datamodel, idMap, notifyUser, emailTitle, emailHtml) {
        updateComponents($scope.form, setValue, data);
        if (datamodel == 'User') {
            data[actionItem].push($scope.sessionData.userData._id);
        } else {}
        Datas.update({
            datamodel_id: $scope.form.datamodel._id,
            entry_id: data._id
        }, data).$promise.then(function(res) {
            if (notifyUser) {
                if (notifyUser == 'current') {
                    notify($scope.sessionData.userData._id, emailTitle, emailHtml);
                } else if (notifyUser == 'owner') {
                    notify(data._user, emailTitle, emailHtml);
                }
            }
            gotoNextForm(formula, nextFormId, data);
        }).catch(function(res) {
            $scope.data = res.data;
            updateErrorAlert();
        });
    }
    $scope.dissociate = function(formula, nextFormId, setValue, data, actionItem, datamodel, idMap, notifyUser, emailTitle, emailHtml) {
        updateComponents($scope.form, setValue, data);
        if (datamodel == 'User') {
            for (var i = data[actionItem].length - 1; i >= 0; i--) {
                if (data[actionItem][i] == $scope.sessionData.userData._id || data[actionItem][i]._id == $scope.sessionData.userData._id) {
                    data[actionItem].splice(i, 1);
                }
            }
        } else {}
        Datas.update({
            datamodel_id: $scope.form.datamodel._id,
            entry_id: data._id
        }, data).$promise.then(function(res) {
            if (notifyUser) {
                if (notifyUser == 'current') {
                    notify($scope.sessionData.userData._id, emailTitle, emailHtml);
                } else if (notifyUser == 'owner') {
                    notify(data._user, emailTitle, emailHtml);
                }
            }
            gotoNextForm(formula, nextFormId, data);
        }).catch(function(res) {
            $scope.data = res.data;
            updateErrorAlert();
        });
    }
    $scope.deleteItem = function(formula, nextFormId, setValue, itemId, fieldName, datamodel, notifyUser, emailTitle, emailHtml) {
        $mdDialog.show(
            $mdDialog.confirm()
            .parent(angular.element(document.body))
            .clickOutsideToClose(true)
            .title($scope.sessionData.appData.confirmation)
            .textContent($scope.sessionData.appData.removal_confirmation)
            .ok($scope.sessionData.appData.ok)
            .cancel($scope.sessionData.appData.cancel)
        ).then(function() {
            updateComponents($scope.form, setValue, $scope.data);
            if (datamodel == 'User') {
                for (var i = $scope.data[fieldName].length - 1; i >= 0; i--) {
                    if ($scope.data[fieldName][i]._id == itemId || $scope.data[fieldName][i]._id == itemId) {
                        $scope.data[fieldName].splice(i, 1);
                    }
                }
            } else {}
            Datas.update({
                datamodel_id: $scope.form.datamodel._id,
                entry_id: $scope.data._id
            }, $scope.data).$promise.then(function(res) {
                if (notifyUser) {
                    if (notifyUser == 'current') {
                        notify($scope.sessionData.userData._id, emailTitle, emailHtml);
                    } else if (notifyUser == 'owner') {
                        notify($scope.data._user, emailTitle, emailHtml);
                    } else if (notifyUser == 'item') {
                        notify(itemId, emailTitle, emailHtml);
                    }
                }
                gotoNextForm(formula, nextFormId, $scope.data);
            }).catch(function(res) {
                $scope.data = res.data;
                updateErrorAlert();
            });
        });
    }
    $scope.moveItem = function(formula, nextFormId, setValue, itemId, fieldName, destinationFieldName, datamodel, notifyUser, emailTitle, emailHtml) {
        updateComponents($scope.form, setValue, $scope.data);
        if (datamodel == 'User') {
            for (var i = $scope.data[fieldName].length - 1; i >= 0; i--) {
                if ($scope.data[fieldName][i] == itemId || $scope.data[fieldName][i]._id == itemId) {
                    $scope.data[fieldName].splice(i, 1);
                }
            }
            $scope.data[destinationFieldName].push(itemId);
        } else {}
        Datas.update({
            datamodel_id: $scope.form.datamodel._id,
            entry_id: $scope.data._id
        }, $scope.data).$promise.then(function(res) {
            if (notifyUser) {
                if (notifyUser == 'current') {
                    notify($scope.sessionData.userData._id, emailTitle, emailHtml);
                } else if (notifyUser == 'owner') {
                    notify($scope.data._user, emailTitle, emailHtml);
                } else if (notifyUser == 'item') {
                    notify(itemId, emailTitle, emailHtml);
                }
            }
            gotoNextForm(formula, nextFormId, $scope.data);
        }).catch(function(res) {
            $scope.data = res.data;
            updateErrorAlert();
        });
    }
    $scope.download = function(data, dataFields, fileName) {
        var content = 'sep=,\n';
        for (var i = 0; i < dataFields.attributes.length; i++) {
            content += '"' + dataFields.attributes[i] + '"' + ',' + '"' + (data[dataFields.attributes[i]] + '').replace(/\"/g, '""') + '"' + '\n';
        }
        for (var i = 0; i < dataFields.items.length; i++) {
            content += '"' + dataFields.items[i].name + '"' + ',' + '"' + data[dataFields.items[i].name].length + '"' + '\n';
            if (data[dataFields.items[i].name].length > 0) {
                for (var j = 0; j < dataFields.items[i].attributes.length; j++) {
                    content += '"' + dataFields.items[i].attributes[j] + '"' + ',';
                }
                content += '\n';
                for (var k = 0; k < data[dataFields.items[i].name].length; k++) {
                    for (var j = 0; j < dataFields.items[i].attributes.length; j++) {
                        content += '"' + (data[dataFields.items[i].name][k][dataFields.items[i].attributes[j]] + '').replace(/\"/g, '""') + '"' + ',';
                    }
                    content += '\n';
                }
            }
        }
        var downloadElement = document.createElement('a');
        downloadElement.setAttribute('target', '_blank'); //open file in new window
        if (Blob !== undefined) {
            var blob = new Blob([content], {
                type: 'text/csv'
            });
            downloadElement.setAttribute('href', URL.createObjectURL(blob));
            if (navigator.msSaveBlob) {
                navigator.msSaveBlob(blob, data[fileName] + '.csv');
            } else {
                downloadElement.setAttribute("download", data[fileName] + '.csv');
                downloadElement.click();
            }
        } else {
            downloadElement.setAttribute('href', 'data:text/csv,' + encodeURIComponent(content));
            downloadElement.setAttribute('download', data[fileName] + '.csv');
            document.body.appendChild(downloadElement);
            downloadElement.click();
            document.body.removeChild(downloadElement);
        }
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
