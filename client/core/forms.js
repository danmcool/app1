app1.controller('FormDetailsCtrl', ['$scope', '$routeParams', '$location', '$route', '$resource', '$mdDialog', 'SessionService', 'MapService', 'Forms', 'Value', 'Files', 'Datas', 'Share', 'Calendar', 'Notify', 'Event', function ($scope, $routeParams, $location, $route, $resource, $mdDialog, SessionService, MapService, Forms, Value, Files, Datas, Share, Calendar, Notify, Event) {
    $scope.sessionData = SessionService.getSessionData();

    $scope.$watch(function () {
        return SessionService.getSessionData();
    }, function (newValue, oldValue) {
        if (newValue != oldValue) {
            $scope.sessionData = newValue;
            updateAppName();
        }
    });

    $scope.calculation = function (object, calculation) {
        var data = object;
        return eval(calculation);
    }

    $scope.resolvePath = function (object, path) {
        if (!path) return undefined;
        return path.split('.').reduce(function (previous, current) {
            return (previous ? previous[current] : undefined);
        }, object);
    }

    $scope.resolvePathUpdate = function (object, path, value) {
        if (!path) return undefined;
        path.split('.').reduce(function (previous, current, index, array) {
            if (index < array.length - 1) {
                if (!previous[current]) {
                    previous[current] = {};
                }
                return previous[current];
            } else {
                previous[current] = value;
            }
        }, object);
    }

    var toString = function (object) {
        if (object) {
            return object + '';
        } else {
            return '';
        }
    }

    var updateAppName = function () {
        var apps = $scope.sessionData.applications;
        if (apps) {
            for (var i = 0; i < apps.length; i++) {
                if (apps[i]._id == $routeParams.application_id) {
                    $scope.sessionData.applicationName = SessionService.translate(apps[i].name);
                    $scope.sessionData.application_id = $routeParams.application_id;
                    SessionService.setSessionData($scope.sessionData);
                    break;
                }
            }
        }
    }

    $scope.data = {};
    $scope.dataLoaded = false;
    $scope.localdata = {};
    $scope.form = {};
    $scope.skip = 0;
    $scope.limit = 10;
    $scope.datas = [];
    $scope.stopScroll = false;
    $scope.tempStopScroll = false;
    $scope.files = {};
    $scope.currentFile = {};
    $scope.filesCount = {};
    $scope.search_criteria = '';
    $scope.show_search = false;
    $scope.search_text = '';
    $scope.formLoaded = false;
    $scope.slides = [];
    $scope.appointments = [];
    $scope.selectedDate = undefined;
    $scope.today = new Date();
    $scope.today_plus_1_year = new Date($scope.today.getTime() + 365 * 24 * 60 * 60 * 1000);
    $scope.hours = [];
    $scope.minutes = [];
    $scope.full_hours = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
    $scope.full_minutes = ['00', '15', '30', '45'];
    $scope.days = [{
            value: 0,
            name: {
                en: 'Sunday',
                fr: 'Dimanche'
            }
        },
        {
            value: 1,
            name: {
                en: 'Monday',
                fr: 'Lundi'
            }
        },
        {
            value: 2,
            name: {
                en: 'Tuesday',
                fr: 'Mardi'
            }
        },
        {
            value: 3,
            name: {
                en: 'Wednesday',
                fr: 'Mercredi'
            }
        },
        {
            value: 4,
            name: {
                en: 'Thursday',
                fr: 'Jeudi'
            }
        },
        {
            value: 5,
            name: {
                en: 'Friday',
                fr: 'Vendredi'
            }
        },
        {
            value: 6,
            name: {
                en: 'Saturday',
                fr: 'Samedi'
            }
        }
    ];

    $scope.getNextData = function () {
        if (!$scope.formLoaded) return;
        if ($scope.stopScroll) return;
        if ($scope.tempStopScroll) return;
        if (!$scope.form.datamodel) return;
        var localLimit = $scope.limit;
        var localSkip = $scope.skip;
        $scope.skip += $scope.limit;
        $scope.tempStopScroll = true;
        Datas.query({
            datamodel_id: $scope.form.datamodel._id,
            search_criteria: $scope.search_criteria,
            search_text: $scope.search_text,
            skip: localSkip,
            limit: localLimit,
            sort_by: $scope.form.sort_by
        }).$promise.then(function (datas) {
            if (datas.length < $scope.limit) $scope.stopScroll = true;
            for (var i = 0; i < datas.length; i++) {
                $scope.datas.push(datas[i]);
            }
            $scope.tempStopScroll = false;
        });
    }

    var initText = function () {
        for (var i = 0; i < $scope.days.length; i++) {
            $scope.days[i].translated_name = SessionService.translate($scope.days[i].name);
        }
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
                    var projectionKeys = Object.keys($scope.form.datamodel.projection);
                    for (var j = 0; j < projectionKeys.length; j++) {
                        var childField = $scope.form.datamodel.projection[projectionKeys[j]];
                        if (childField.path == fields[i].full_path) {
                            if (childField.technical_name == 'address_line1') {
                                fields[i].address_line1_translated_name = SessionService.translate(childField.name);
                            } else if (childField.technical_name == 'address_line2') {
                                fields[i].address_line2_translated_name = SessionService.translate(childField.name);
                            } else if (childField.technical_name == 'address_city') {
                                fields[i].address_city_translated_name = SessionService.translate(childField.name);
                            } else if (childField.technical_name == 'address_state') {
                                fields[i].address_state_translated_name = SessionService.translate(childField.name);
                            } else if (childField.technical_name == 'address_postal_code') {
                                fields[i].address_postal_code_translated_name = SessionService.translate(childField.name);
                            } else if (childField.technical_name == 'address_country') {
                                fields[i].address_country_translated_name = SessionService.translate(childField.name);
                            }
                        }
                    }
                } else if (fields[i].display == 'list' || fields[i].display == 'item') {
                    if (fields[i].item_actions) {
                        for (var j = 0; j < fields[i].item_actions.length; j++) {
                            fields[i].item_actions[j].translated_name = SessionService.translate(fields[i].item_actions[j].name);
                        }
                    }
                }
                if (fields[i].text && fields[i].text.en != '') {
                    fields[i].translated_name = SessionService.translate(fields[i].text);
                } else if (fields[i].display != 'list' && fields[i].display != 'item') {
                    fields[i].translated_name = SessionService.translate($scope.form.datamodel.projection[fields[i].projectionid].name);
                }
            }
        }
    }

    var matchField = function (string) {
        if (!string) return '';
        var fields = string.match(/data.([a-z_])+/g);
        if (!fields) return '';
        var result = '';
        for (var i = 0; i < fields.length; i++) {
            result += fields[i].substr(5) + ' ';
        }
        return result;
    }

    var updateValuesForm = function (index, newValues) {
        var formFields = $scope.form.fields[index];
        formFields.values = [];
        formFields.values_key = {};
        for (k = 0; k < newValues.length; k++) {
            formFields.values.push({
                '_id': newValues[k]._id,
                'name': SessionService.translate(newValues[k].name)
            });
            formFields.values_key[newValues[k]._id] =
                SessionService.translate(newValues[k].name);
        }
    }
    var updateValuesTitle = function (index, newValues) {
        var formFields = $scope.form.fields[index];
        formFields.title_values = {};
        for (k = 0; k < newValues.length; k++) {
            formFields.title_values[newValues[k]._id] =
                SessionService.translate(newValues[k].name);
        }
    }
    var updateValuesSubTitle = function (index, newValues) {
        var formFields = $scope.form.fields[index];
        formFields.subtitle_values = {};
        for (k = 0; k < newValues.length; k++) {
            formFields.subtitle_values[newValues[k]._id] =
                SessionService.translate(newValues[k].name);
        }
    }
    var updateValuesItems = function (index, newValues) {
        var formFields = $scope.form.fields[index];
        var valuesFieldName = formFields.projectionid + '_values';
        formFields[valuesFieldName] = newValues;
        $scope.data[formFields.projectionid] = newValues;
    }
    var initComponents = function () {
        var formFields = $scope.form.fields;
        var formValues = $scope.form.values;
        for (var i = 0; i < formFields.length; i++) {
            if (formFields[i].display == 'address') {
                $scope.localdata[formFields[i].id] = $scope.resolvePath($scope.data, formFields[i].full_path);
                if (formFields[i].disabled) {
                    MapService.initMap('map' + formFields[i].id);
                    var address = $scope.localdata[formFields[i].id];
                    MapService.geocodeAddress('map' + formFields[i].id, (address.address_line1 ? (address.address_line1 + ',') : '') + (address.address_line2 ? (address.address_line2 + ',') : '') + (address.address_city ? (address.address_city + ',') : '') + (address.address_postal_code ? (address.address_postal_code + ',') : '') + (address.address_country ? (address.address_country + ',') : ''));
                }
            } else if (formFields[i].display == 'selection' || formFields[i].display == 'currency') {
                $scope.localdata[formFields[i].id] = $scope.resolvePath($scope.data, formFields[i].full_path);
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
                            }, itemValues).$promise.then(function (resValues) {
                                updateValuesForm(resValues.index, resValues.values);
                            });
                        }
                        break;
                    }
                }
            } else if (formFields[i].display == 'calendar') {
                $scope.localdata[formFields[i].id] = $scope.resolvePath($scope.data, formFields[i].full_path);
                if ($scope.localdata[formFields[i].id]) {
                    $scope.localdata[formFields[i].id] = new Date($scope.localdata[formFields[i].id]);
                }
            } else if (formFields[i].display == 'calculation') {
                var data = $scope.data;
                $scope.localdata[formFields[i].id] = eval(formFields[i].calculation);
            } else if (formFields[i].display == 'list') {
                $scope.show_search = true;
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
                            }, itemValues).$promise.then(function (resValues) {
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
                            }, itemValues).$promise.then(function (resValues) {
                                updateValuesSubTitle(resValues.index, resValues.values);
                            });
                        }
                    }
                }
                if ($scope.form.search_criteria) {
                    $scope.search_criteria = $scope.form.search_criteria;
                }
                $scope.search_criteria = $scope.search_criteria.replace(/@_user_id/g, $scope.sessionData.userData._id);
                var keysOfParameters = Object.keys($routeParams);
                for (k = 0, l = keysOfParameters.length; k < l; k++) {
                    $scope.search_criteria = $scope.search_criteria.replace('@' + keysOfParameters[k], $routeParams[
                        keysOfParameters[k]]);
                }
                $scope.formLoaded = true;
                $scope.getNextData();
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
                            itemValues.id_list = $scope.resolvePath($scope.data, $scope.form.datamodel.projection[formFields[i].projectionid].full_path);
                            itemValues.user_fields = '';
                            if (formFields[i].title_full_path) {
                                var point = formFields[i].title_full_path.indexOf('.');
                                if (point > 0) {
                                    itemValues.user_fields += formFields[i].title_full_path.substring(0, point + 1) + ' ';
                                } else {
                                    itemValues.user_fields += formFields[i].title_full_path + ' ';
                                }
                            }
                            if (formFields[i].subtitle_full_path) {
                                var point = formFields[i].subtitle_full_path.indexOf('.');
                                if (point > 0) {
                                    itemValues.user_fields += formFields[i].subtitle_full_path.substring(0, point + 1) + ' ';
                                } else {
                                    itemValues.user_fields += formFields[i].subtitle_full_path + ' ';
                                }
                            }
                            itemValues.user_fields += matchField(formFields[i].title_calculation);
                            itemValues.user_fields += matchField(formFields[i].subtitle_calculation);
                            itemValues.user_fields = itemValues.user_fields.trim();
                            Value.update({
                                id: formValues[j]._id,
                                type: formValues[j].type,
                            }, itemValues).$promise.then(function (resValues) {
                                updateValuesItems(resValues.index, resValues.values);
                            });
                        }
                    }
                }
            } else if (formFields[i].display == 'file') {
                $scope.currentFile[formFields[i].id] = 0;
                $scope.filesCount[formFields[i].id] = 0;
                $scope.files[formFields[i].id] = [];
                $scope.localdata[formFields[i].id] = $scope.resolvePath($scope.data, formFields[i].full_path);
            } else if (formFields[i].display == 'appointment_properties') {
                if (!$scope.data._appointment_properties || !$scope.data._appointment_properties.non_stop) {
                    $scope.data._appointment_properties = {
                        non_stop: {
                            enabled: true
                        }
                    }
                    $scope.updateWholeWeek($scope.data._appointment_properties);
                }
            } else if (formFields[i].display == 'image') {
                $scope.currentFile[formFields[i].id] = 0;
                $scope.filesCount[formFields[i].id] = 0;
                $scope.files[formFields[i].id] = [];
                $scope.localdata[formFields[i].id] = $scope.resolvePath($scope.data, formFields[i].full_path);
                if ($scope.localdata[formFields[i].id]) {
                    for (var j = 0; j < $scope.localdata[formFields[i].id].length; j++) {
                        $scope.slides.push({
                            url: '/file/' + $scope.localdata[formFields[i].id][j]._id,
                            caption: ''
                        });
                    }
                }
            } else {
                $scope.localdata[formFields[i].id] = $scope.resolvePath($scope.data, formFields[i].full_path);
            }
        }
    }

    Forms.get({
        id: $routeParams.id
    }, function (form) {
        $scope.form = form;
        var formDisplay = $scope.form.display;
        $scope.form.fields = [];
        var populate = '';
        if (formDisplay) {
            for (var i = 0; i < formDisplay.length; i++) {
                for (var j = 0; j < formDisplay[i].blocks.length; j++) {
                    for (var k = 0; k < formDisplay[i].blocks[j].fields.length; k++) {
                        var field = formDisplay[i].blocks[j].fields[k];
                        $scope.form.fields.push(field);
                        if (field.display == 'list' || field.display == 'item') {} else {
                            if (field.projectionid && ($scope.form.datamodel.projection[field.projectionid].type == 'item' || $scope.form.datamodel.projection[field.projectionid].type == 'reference')) {
                                populate = populate + $scope.form.datamodel.projection[field.projectionid].full_path + ' ';
                            }
                        }
                    }
                }
            }
        }
        updateAppName();
        initText();
        if ($scope.form.datamodel) {
            if ($routeParams.entry_id == '0') {
                $scope.data = new Datas({
                    datamodel_id: $scope.form.datamodel._id
                });
                $scope.data._user = $scope.sessionData.userData._id;
                $scope.dataLoaded = true;
                initComponents();
            } else {
                Datas.get({
                    datamodel_id: $scope.form.datamodel._id,
                    entry_id: $routeParams.entry_id,
                    populate: populate.trim()
                }, function (data) {
                    $scope.data = data;
                    $scope.dataLoaded = true;
                    initComponents();
                });
            }
        }
    });

    var rand = function () {
        return Math.random().toString(16).substr(2);
    };

    var gotoNextForm = function (formula, nextFormId, data) {
        if (nextFormId == 'home') {
            SessionService.location('/workflows/' + $scope.sessionData.application_id);
        } else {
            var formUrl = '/form/' + nextFormId + '/';
            if (data && data._id) {
                formUrl = formUrl + data._id + '?application_id=' + $routeParams.application_id;
                if (formula) {
                    keys = Object.keys(formula);
                    for (i = 0; i < keys.length; i++) {
                        formUrl = formUrl + '&' + formula[keys[i]] + '=' + data[formula[keys[i]]];
                    }
                }
            } else {
                formUrl = formUrl + '0?application_id=' + $routeParams.application_id;
            }
            if (formUrl != $location.url()) {
                SessionService.location(formUrl);
            } else {
                $route.reload();
            }
        }
    }

    $scope.uploadFile = function (file, signedRequest, url, fieldId) {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', signedRequest);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    $scope.currentFile[fieldId]++;
                    if ($scope.currentFile[fieldId] > $scope.filesCount[fieldId]) {
                        document.getElementById('file_upload_' + fieldId).textContent = $scope.sessionData.appData.uploading_done;
                        setTimeout(function () {
                            document.getElementById('file_upload_' + fieldId).textContent = '';
                        }, 4 * 1000);
                    } else {
                        document.getElementById('file_upload_' + fieldId).textContent = $scope.sessionData.appData.uploading_in_progress + ' ' + $scope.currentFile[fieldId] + '/' + $scope.filesCount[fieldId];
                    }
                } else {
                    alert('Could not upload file.');
                }
            }
        };
        xhr.send(file);
    }
    changeFilesInFormsJS = function (files, fieldId) {
        if (files.length == 0) return;
        //$scope.dynamicForm.$setValidity({'Attachments': true});
        if (!$scope.localdata[fieldId]) {
            $scope.localdata[fieldId] = [];
        }
        for (k = files.length - 1; k >= 0; k--) {
            if (files[k].size / 1048576 > 35) {
                files.splice(k, 1);
            }
        }
        $scope.filesCount[fieldId] = files.length;
        $scope.currentFile[fieldId] = 1;
        document.getElementById('file_upload_' + fieldId).textContent = $scope.sessionData.appData.uploading_in_progress + ' ' + $scope.currentFile[fieldId] + '/' + $scope.filesCount[fieldId];
        for (i = 0; i < $scope.filesCount[fieldId]; i++) {
            var file = new Files({
                name: files[i].name,
                type: files[i].type
            });
            $scope.files[fieldId].push(files[i]);
            file.$save().then(function (res) {
                for (var j = 0; j < $scope.files[fieldId].length; j++) {
                    if ($scope.files[fieldId][j].name == res.file.name) {
                        $scope.localdata[fieldId].push({
                            _id: res.file._id,
                            name: res.file.name,
                            type: res.file.type
                        });
                        $scope.files[fieldId][j]._id = res.file._id;
                        $scope.uploadFile($scope.files[fieldId][j], res.signedRequest, res.url, fieldId);
                    }
                }
            });
        }
    }
    $scope.removeFile = function (fileId, fieldId) {
        var files = $scope.localdata[fieldId];
        for (var i = 0; i < files.length; i++) {
            if (files[i]._id == fileId) {
                files.splice(i, 1);
                Files.remove({
                        id: fileId
                    }).$promise
                    .then(function (res) {
                        for (var j = 0; j < $scope.files[fieldId].length; j++) {
                            if ($scope.files[fieldId][j]._id == fileId) {
                                $scope.files[fieldId].splice(j, 1);
                                break;
                            }
                        }
                    })
                    .catch(function (res) {
                        /* show error*/
                    })
                break;
            }
        }
    }

    var computeDateKey = function (date) {
        return [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-');
    }

    $scope.updateWholeWeek = function (properties) {
        if (!properties.days) {
            properties.days = [];
        }
        if (properties.non_stop.enabled) {
            for (var i = 0; i < 7; i++) {
                properties.days[i] = {
                    whole_day: true,
                    enabled: true
                }
                $scope.updateWholeDay(properties.days[i]);
            }
        } else {
            for (var i = 0; i < 7; i++) {
                properties.days[i] = {
                    whole_day: false,
                    enabled: false
                }
                $scope.updateWholeDay(properties.days[i]);
            }
        }
    }
    $scope.updateWholeDay = function (day) {
        if (day.whole_day) {
            day.start_time = {
                hours: '00',
                minutes: '00'
            };
            day.end_time = {
                hours: '24',
                minutes: '00'
            };
        } else {
            day.start_time = {
                hours: '08',
                minutes: '00'
            };
            day.end_time = {
                hours: '19',
                minutes: '00'
            };
        }
    }
    $scope.updateDate = function (fieldId, dateEntry, dateValueObject) {
        if (dateValueObject.date) {
            var date = dateValueObject.date;
            $scope.hours = [];
            if ($scope.data._appointment_properties && $scope.data._appointment_properties.days && $scope.data._appointment_properties.days[date.getDay()]) {
                var day = $scope.data._appointment_properties.days[date.getDay()];
                for (var i = 0; i < $scope.full_hours.length; i++) {
                    if ($scope.full_hours[i].localeCompare(day.start_time.hours) >= 0 && $scope.full_hours[i].localeCompare(day.end_time.hours) <= 0) {
                        $scope.hours.push($scope.full_hours[i]);
                    }
                }
            }
            if ($scope.hours.length > 0) {
                $scope.minutes = ['00', '15', '30', '45']
            } else {
                $scope.minutes = [];
            }
            date.setHours(parseInt(dateValueObject.hours ? dateValueObject.hours : '0'));
            date.setMinutes(parseInt(dateValueObject.minutes ? dateValueObject.minutes : '0'));
            date.setSeconds(0);
            date.setMilliseconds(0);
            if (!$scope.localdata[fieldId]) {
                $scope.localdata[fieldId] = {};
            }
            $scope.localdata[fieldId][dateEntry] = date;
        }
    }
    $scope.dayAvailable = function (date) {
        var today = new Date();
        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);
        today.setMilliseconds(0);
        if (date < today) {
            return false;
        }
        var dateKey = computeDateKey(date);
        // check if day of week is allowed
        if ($scope.data._appointment_properties && $scope.data._appointment_properties.days && $scope.data._appointment_properties.days[date.getDay()] && $scope.data._appointment_properties.days[date.getDay()].enabled) {
            return true;

            // check if there are free time slots
            if ($scope.data._appointments && $scope.data._appointments[dateKey] && $scope.data._appointments[dateKey].length > 0) {
                return true;
            } else {
                return true;
            }
        } else {
            // day of week not allowed
            return false;
        }
    }
    $scope.dayContent = function (date) {
        var today = new Date();
        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);
        today.setMilliseconds(0);
        if (date < today) {
            return '';
        }
        var dateKey = computeDateKey(date);
        // check if there are free time slots
        if ($scope.data._appointments && $scope.data._appointments[dateKey] && $scope.data._appointments[dateKey].length > 0) {
            return '' + $scope.data._appointments[dateKey].length;
        } else {
            return '';
        }
    }

    $scope.dayClick = function (date) {
        $scope.selectedDate = date;
        var dateKey = computeDateKey(date);
        if ($scope.data._appointments && $scope.data._appointments[dateKey] && $scope.data._appointments[dateKey].length > 0) {
            $scope.appointments = $scope.data._appointments[dateKey].sort(function (a, b) {
                return (a.start_time.hours * 60 + a.start_time.minutes * 1) - (b.start_time.hours * 60 + b.start_time.minutes * 1);
            });
        } else {
            $scope.appointments = [];
        }
    }

    var updateComponents = function (form, setValue, data) {
        var formFields = $scope.form.fields;
        for (var i = 0; i < formFields.length; i++) {
            if (formFields[i].display == 'feed') {
                if (form.newvalues && form.newvalues[formFields[i].id] && form.newvalues[formFields[i].id].length > 0) {
                    if (!$scope.localdata[formFields[i].id]) {
                        $scope.localdata[formFields[i].id] = [];
                    }
                    $scope.localdata[formFields[i].id].push({
                        text: form.newvalues[formFields[i].id],
                        from: $scope.sessionData.userData.name,
                        user: $scope.sessionData.userData.user,
                        date: Date.now()
                    });
                }
            } else if (formFields[i].display != 'list' && formFields[i].display != 'item') {
                $scope.resolvePathUpdate(data, formFields[i].full_path, $scope.localdata[formFields[i].id]);
            }
        }
        if (setValue) {
            $scope.resolvePathUpdate(data, setValue.full_path, setValue.value);
        }
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

    var errorAlert = function (error) {
        $mdDialog.show(
            $mdDialog.alert()
            .parent(angular.element(document.body))
            .clickOutsideToClose(true)
            .title($scope.sessionData.appData.error)
            .textContent(error)
            .ok($scope.sessionData.appData.ok)
        );
    }

    var notify = function (notifyUser, emailTitle, emailHtml, itemId) {
        if (!notifyUser) return;
        var notifyUserId;
        if (notifyUser == 'current') {
            notifyUserId = $scope.sessionData.userData._id;
        } else if (notifyUser == 'owner') {
            notifyUserId = $scope.data._user;
        } else if (notifyUser == 'item') {
            notifyUserId = itemId;
        } else {
            return;
        }
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

    $scope.create = function (formula, nextFormId, setValue, forwardId, notifyUser, emailTitle, emailHtml) {
        updateComponents($scope.form, setValue, $scope.data);
        $scope.data.$save().then(function (res) {
            notify(notifyUser, emailTitle, emailHtml);
            gotoNextForm(formula, nextFormId, (forwardId ? res : null));
        }).catch(function (res) {
            $scope.data = res.data;
        });
    }
    $scope.modify = function (formula, nextFormId, setValue, forwardId, notifyUser, emailTitle, emailHtml) {
        updateComponents($scope.form, setValue, $scope.data);
        Datas.update({
            datamodel_id: $scope.form.datamodel._id,
            entry_id: $scope.data._id
        }, $scope.data).$promise.then(function (res) {
            notify(notifyUser, emailTitle, emailHtml);
            gotoNextForm(formula, nextFormId, (forwardId ? res : null));
        }).catch(function (res) {
            $scope.data = res.data;
            updateErrorAlert();
        });
    }
    $scope.delete = function (formula, nextFormId, notifyUser, emailTitle, emailHtml) {
        $mdDialog.show(
            $mdDialog.confirm()
            .parent(angular.element(document.body))
            .clickOutsideToClose(true)
            .title($scope.sessionData.appData.confirmation)
            .textContent($scope.sessionData.appData.removal_confirmation)
            .ok($scope.sessionData.appData.ok)
            .cancel($scope.sessionData.appData.cancel)
        ).then(function () {
            Datas.remove({
                    datamodel_id: $scope.form.datamodel._id,
                    entry_id: $scope.data._id
                }).$promise
                .then(function (res) {
                    notify(notifyUser, emailTitle, emailHtml);
                    gotoNextForm(formula, nextFormId, null);
                })
                .catch(function (res) {
                    /* show error*/
                });
        });
    }
    $scope.link = function (formula, nextFormId, forwardId, notifyUser, emailTitle, emailHtml) {
        notify(notifyUser, emailTitle, emailHtml);
        gotoNextForm(formula, nextFormId, (forwardId ? $scope.data : null));
    }

    $scope.subscribe = function (formula, nextFormId, setValue, forwardId, itemPath, notifyUser, emailTitle, emailHtml) {
        updateComponents($scope.form, setValue, $scope.data);
        $scope.resolvePath($scope.data, itemPath).push($scope.sessionData.userData._id);
        Datas.update({
            datamodel_id: $scope.form.datamodel._id,
            entry_id: $scope.data._id
        }, $scope.data).$promise.then(function (res) {
            notify(notifyUser, emailTitle, emailHtml);
            gotoNextForm(formula, nextFormId, (forwardId ? $scope.data : null));
        }).catch(function (res) {
            $scope.data = res.data;
            updateErrorAlert();
        });
    }
    $scope.unsubscribe = function (formula, nextFormId, setValue, forwardId, itemPath, notifyUser, emailTitle, emailHtml) {
        updateComponents($scope.form, setValue, $scope.data);
        var itemList = $scope.resolvePath($scope.data, itemPath);
        for (var i = itemList.length - 1; i >= 0; i--) {
            if (itemList[i] == $scope.sessionData.userData._id || itemList[i]._id == $scope.sessionData.userData._id) {
                itemList.splice(i, 1);
            }
        }
        Datas.update({
            datamodel_id: $scope.form.datamodel._id,
            entry_id: $scope.data._id
        }, $scope.data).$promise.then(function (res) {
            notify(notifyUser, emailTitle, emailHtml);
            gotoNextForm(formula, nextFormId, (forwardId ? $scope.data : null));
        }).catch(function (res) {
            $scope.data = res.data;
            updateErrorAlert();
        });
    }

    $scope.deleteItem = function (formula, nextFormId, setValue, itemPath, itemId, notifyUser, emailTitle, emailHtml) {
        $mdDialog.show(
            $mdDialog.confirm()
            .parent(angular.element(document.body))
            .clickOutsideToClose(true)
            .title($scope.sessionData.appData.confirmation)
            .textContent($scope.sessionData.appData.removal_confirmation)
            .ok($scope.sessionData.appData.ok)
            .cancel($scope.sessionData.appData.cancel)
        ).then(function () {
            updateComponents($scope.form, setValue, $scope.data);
            var itemList = $scope.resolvePath($scope.data, itemPath);
            for (var i = itemList.length - 1; i >= 0; i--) {
                if (itemList[i] == itemId || itemList[i]._id == itemId) {
                    itemList.splice(i, 1);
                }
            }
            Datas.update({
                datamodel_id: $scope.form.datamodel._id,
                entry_id: $scope.data._id
            }, $scope.data).$promise.then(function (res) {
                notify(notifyUser, emailTitle, emailHtml, itemId);
                gotoNextForm(formula, nextFormId, $scope.data);
            }).catch(function (res) {
                $scope.data = res.data;
                updateErrorAlert();
            });
        });
    }
    $scope.moveItem = function (formula, nextFormId, setValue, itemId, itemPath, destinationItemPath, notifyUser, emailTitle, emailHtml) {
        updateComponents($scope.form, setValue, $scope.data);
        var itemList = $scope.resolvePath($scope.data, itemPath);
        for (var i = itemList.length - 1; i >= 0; i--) {
            if (itemList[i] == itemId || itemList[i]._id == itemId) {
                itemList.splice(i, 1);
            }
        }
        $scope.resolvePath($scope.data, destinationItemPath).push(itemId);
        Datas.update({
            datamodel_id: $scope.form.datamodel._id,
            entry_id: $scope.data._id
        }, $scope.data).$promise.then(function (res) {
            notify(notifyUser, emailTitle, emailHtml, itemId);
            gotoNextForm(formula, nextFormId, $scope.data);
        }).catch(function (res) {
            $scope.data = res.data;
            updateErrorAlert();
        });
    }

    $scope.modifyList = function (formula, nextFormId, setValue, data, notifyUser, emailTitle, emailHtml) {
        updateComponents($scope.form, setValue, data);
        Datas.update({
            datamodel_id: $scope.form.datamodel._id,
            entry_id: data._id
        }, data).$promise.then(function (res) {
            notify(notifyUser, emailTitle, emailHtml);
            gotoNextForm(formula, nextFormId, res);
        }).catch(function (res) {
            $scope.data = res.data;
            updateErrorAlert();
        });
    }
    $scope.deleteList = function (formula, nextFormId, data, notifyUser, emailTitle, emailHtml) {
        $mdDialog.show(
            $mdDialog.confirm()
            .parent(angular.element(document.body))
            .clickOutsideToClose(true)
            .title($scope.sessionData.appData.confirmation)
            .textContent($scope.sessionData.appData.removal_confirmation)
            .ok($scope.sessionData.appData.ok)
            .cancel($scope.sessionData.appData.cancel)
        ).then(function () {
            Datas.remove({
                    datamodel_id: $scope.form.datamodel._id,
                    entry_id: data._id
                }).$promise
                .then(function (res) {
                    notify(notifyUser, emailTitle, emailHtml);
                    gotoNextForm(formula, nextFormId, null);
                })
                .catch(function (res) {
                    /* show error*/
                });
        });
    }
    $scope.linkList = function (formula, nextFormId, data, notifyUser, emailTitle, emailHtml) {
        notify(notifyUser, emailTitle, emailHtml);
        gotoNextForm(formula, nextFormId, data);
    }
    /*    $scope.download = function (data, dataFields, fileName) {
            var content = 'sep=,\n';
            for (var i = 0; i < dataFields.attributes.length; i++) {
                content += '"' + dataFields.attributes[i] + '"' + ',' + '"' + toString($scope.resolvePath(data, dataFields.attributes[i])).replace(/\"/g, '""') + '"' + '\n';
            }
            for (var i = 0; i < dataFields.projectionid.length; i++) {
                content += '"' + dataFields.projectionid[i].name + '"' + ',' + '"' + data[dataFields.projectionid[i].name].length + '"' + '\n';
                if (data[dataFields.projectionid[i].name].length > 0) {
                    for (var j = 0; j < dataFields.projectionid[i].attributes.length; j++) {
                        content += '"' + dataFields.projectionid[i].attributes[j] + '"' + ',';
                    }
                    content += '\n';
                    var objectItems = $scope.resolvePath(data, dataFields.projectionid[i].name);
                    for (var k = 0; k < objectItems.length; k++) {
                        for (var j = 0; j < dataFields.projectionid[i].attributes.length; j++) {
                            content += '"' + toString($scope.resolvePath(objectItems[k], dataFields.projectionid[i].attributes[j])).replace(/\"/g, '""') + '"' + ',';
                        }
                        content += '\n';
                    }
                }
            }
            for (var i = 0; i < dataFields.details.length; i++) {
                        content += '"' + dataFields.details[i].name + '"' + ',' + '"' + data[dataFields.details[i].name].length + '"' + '\n';
                        if (data[dataFields.details[i].name].length > 0) {
                            for (var j = 0; j < dataFields.details[i].attributes.length; j++) {
                                content += '"' + dataFields.details[i].attributes[j] + '"' + ',';
                            }
                            content += '\n';
                            for (var k = 0; k < data[dataFields.projectionid[i].name].length; k++) {
                                for (var j = 0; j < dataFields.projectionid[i].attributes.length; j++) {
                                    content += '"' + (data[dataFields.projectionid[i].name][k][dataFields.projectionid[i].attributes[j]] + '').replace(/\"/g, '""') + '"' + ',';
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
                    downloadElement.setAttribute('download', data[fileName] + '.csv');
                    downloadElement.click();
                }
            } else {
                downloadElement.setAttribute('href', 'data:text/csv,' + encodeURIComponent(content));
                downloadElement.setAttribute('download', data[fileName] + '.csv');
                document.body.appendChild(downloadElement);
                downloadElement.click();
                document.body.removeChild(downloadElement);
            }
        }*/
    $scope.share = function (formula, nextFormId, setValue, constraint, email_field_name, form_id, data) {
        updateComponents($scope.form, setValue, data);
        Datas.update({
            datamodel_id: $scope.form.datamodel._id,
            entry_id: data._id
        }, data).$promise.then(function (res) {
            Share.update({
                form_id: form_id,
                datamodel_id: $scope.form.datamodel._id,
                data_id: data._id,
                email: data[email_field_name],
                key: constraint.key,
                value: constraint.value
            }).$promise.then(function (res) {
                gotoNextForm(formula, nextFormId, data);
            })
        }).catch(function (res) {
            $scope.data = res.data;
            updateErrorAlert();
        });
    }
    $scope.calendar = function (formula, nextFormId, setValue, project_name_field, start_date_field, end_date_field, data) {
        updateComponents($scope.form, setValue, data);
        Datas.update({
            datamodel_id: $scope.form.datamodel._id,
            entry_id: data._id
        }, data).$promise.then(function (res) {
            Calendar.get({
                project_name: data[project_name_field],
                start_date: data[start_date_field],
                end_date: data[end_date_field],
                user_id: data._user
            }).$promise.then(function (res) {
                gotoNextForm(formula, nextFormId, data);
            })
        }).catch(function (res) {
            $scope.data = res.data;
            updateErrorAlert();
        });
    }

    $scope.addEvent = function (formula, nextFormId, setValue, objectNamePath, periodPath) {
        updateComponents($scope.form, setValue, $scope.data);;
        Event.update({
            id: $scope.data._id
        }, {
            datamodel_id: $scope.form.datamodel._id,
            object_name: $scope.resolvePath($scope.data, objectNamePath),
            start_time: $scope.resolvePath($scope.data, periodPath).start_time,
            end_time: $scope.resolvePath($scope.data, periodPath).end_time,
            _user: $scope.data._user,
            _updated_at: $scope.data._updated_at
        }).$promise.then(function (res) {
            gotoNextForm(formula, nextFormId, $scope.data);
        }).catch(function (res) {
            if (res.data) {
                $scope.data = res.data;
                initComponents();
            }
            errorAlert($scope.sessionData.appData.error_creating_appointment);
        });
    }

    $scope.search = function (search_text) {
        if (!search_text) {
            search_text = ''
        };
        $scope.search_text = search_text;
        $scope.skip = 0;
        $scope.limit = 10;
        $scope.stopScroll = false;
        $scope.tempStopScroll = false;
        $scope.datas = [];
        $scope.getNextData();
    }
}]);
