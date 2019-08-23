app1.controller('FormDetailsCtrl', ['$scope', '$routeParams', '$location', '$route', '$resource', '$mdDialog', 'SessionService', 'MapService', 'Forms', 'Value', 'Files', 'Datas', 'Share', 'Calendar', 'Notify', 'Event', 'Reservation', function ($scope, $routeParams, $location, $route, $resource, $mdDialog, SessionService, MapService, Forms, Value, Files, Datas, Share, Calendar, Notify, Event, Reservation) {
    $scope.sessionData = SessionService.getSessionData();

    $scope.$watch(function () {
        return SessionService.getSessionData();
    }, function (newValue, oldValue) {
        if (newValue != oldValue) {
            $scope.sessionData = newValue;
            $scope.updateAppName();
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

    /*$scope.toString = function (object) {
        if (object) {
            return object + '';
        } else {
            return '';
        }
    }*/

    $scope.updateAppName = function () {
        var apps = $scope.sessionData.applications;
        if (apps) {
            for (var i = 0; i < apps.length; i++) {
                if (apps[i]._id == $routeParams.application_id && apps[i].pid == $routeParams.pid) {
                    for (var j = 0; j < apps[i].workflows.length; j++) {
                        if (apps[i].workflows[j]._id == $routeParams.workflow_id) {
                            $scope.sessionData.applicationName = apps[i].translated_name + ' - ' + SessionService.translate(apps[i].workflows[j].name);
                            $scope.sessionData.application_id = $routeParams.application_id;
                            SessionService.setSessionData($scope.sessionData);
                            break;
                        }
                    }
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
    $scope.list_interval = {
        start: '',
        end: ''
    };
    $scope.list_interval_validation = {};
    $scope.selectedDate = undefined;
    $scope.today = new Date();
    $scope.today_plus_1_year = new Date($scope.today.getTime() + 365 * 24 * 60 * 60 * 1000);
    $scope.hours = [];
    $scope.minutes = [];
    $scope.full_hours = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
    $scope.full_minutes = ['00', '15', '30', '45'];
    $scope.days = [
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
        },
        {
            value: 0,
            name: {
                en: 'Sunday',
                fr: 'Dimanche'
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
            interval_start: $scope.list_interval.start,
            interval_end: $scope.list_interval.end,
            skip: localSkip,
            limit: localLimit,
            sort_by: $scope.form.sort_by,
            pid: $routeParams.pid
        }, function (datas) {
            if (datas.length < $scope.limit) $scope.stopScroll = true;
            var formValues = $scope.form.values;
            var i;
            for (var j = 0; j < formValues.length; j++) {
                var itemValues = {};
                if ($scope.form_field_list.title_listofvalues == formValues[j]._id && formValues[j].type != 'list') {
                    itemValues.relation = formValues[j].values.relation;
                    itemValues.id_list = [];
                    for (i = 0; i < datas.length; i++) {
                        itemValues.id_list.push($scope.resolvePath(datas[i], $scope.form.datamodel.projection[$scope.form_field_list.title].full_path));
                    }
                    $scope.queryValues(formValues[j]._id, formValues[j].type, itemValues, $scope.form_field_list, 'title', $scope.form_field_list);
                }
                if ($scope.form_field_list.subtitle_listofvalues == formValues[j]._id && formValues[j].type != 'list') {
                    itemValues.relation = formValues[j].values.relation;
                    itemValues.id_list = [];
                    for (i = 0; i < datas.length; i++) {
                        itemValues.id_list.push($scope.resolvePath(datas[i], $scope.form.datamodel.projection[$scope.form_field_list.subtitle].full_path));
                    }
                    $scope.queryValues(formValues[j]._id, formValues[j].type, itemValues, $scope.form_field_list, 'subtitle', $scope.form_field_list);
                }
            }
            for (i = 0; i < datas.length; i++) {
                $scope.datas.push(datas[i]);
            }
            $scope.tempStopScroll = false;
        });
    }

    $scope.initText = function () {
        var i, j;
        for (i = 0; i < $scope.days.length; i++) {
            $scope.days[i].translated_name = SessionService.translate($scope.days[i].name);
        }
        $scope.form.title = SessionService.translate($scope.form.name);
        if ($scope.form.actions) {
            for (i = 0; i < $scope.form.actions.length; i++) {
                $scope.form.actions[i].translated_name = SessionService.translate($scope.form.actions[i].name);
            }
        }
        if ($scope.form.fields) {
            var fields = $scope.form.fields;
            for (i = 0; i < fields.length; i++) {
                if (fields[i].display == 'address') {
                    var projectionKeys = Object.keys($scope.form.datamodel.projection);
                    for (j = 0; j < projectionKeys.length; j++) {
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
                        for (j = 0; j < fields[i].item_actions.length; j++) {
                            fields[i].item_actions[j].translated_name = SessionService.translate(fields[i].item_actions[j].name);
                        }
                    }
                }
                fields[i].translated_name = '';
                if (fields[i].text) {
                    fields[i].translated_name = SessionService.translate(fields[i].text);
                }
                if ((!fields[i].translated_name || fields[i].translated_name == '') && fields[i].display != 'list' && fields[i].display != 'item') {
                    fields[i].translated_name = SessionService.translate($scope.form.datamodel.projection[fields[i].projectionid].name);
                }
            }
        }
    }

    $scope.getIcon = function (data, iconFieldId) {
        if (!iconFieldId) {
            return "/images/noimage.jpg";
        }
        var images = $scope.resolvePath(data, $scope.form.datamodel.projection[iconFieldId].full_path);
        if (images && images.length > 0) {
            return "/client/file/" + images[0];
        } else {
            return "/images/noimage.jpg";
        }
    }

    $scope.matchField = function (string) {
        if (!string) return '';
        var fields = string.match(/data.([a-z_])+/g);
        if (!fields) return '';
        var result = '';
        for (var i = 0; i < fields.length; i++) {
            result += fields[i].substr(5) + ' ';
        }
        return result;
    }
    $scope.computeFields = function (fullPath, calculation) {
        var userFields = '';
        if (fullPath) {
            var point = fullPath.indexOf('.');
            if (point > 0) {
                userFields += fullPath.substring(0, point + 1) + ' ';
            } else {
                userFields += fullPath + ' ';
            }
        }
        userFields += $scope.matchField(calculation);
        userFields = userFields.trim();
        return userFields;
    }

    $scope.queryValues = function (valuesId, valuesType, valuesObject, formField, valuesDisplay, extData) {
        Value.update({
            id: valuesId,
            type: valuesType
        }, valuesObject, function (resValues) {
            if (valuesDisplay == 'title') {
                $scope.updateValuesTitle(formField, resValues.values, extData);
            } else if (valuesDisplay == 'subtitle') {
                $scope.updateValuesSubTitle(formField, resValues.values, extData);
            } else if (valuesDisplay == 'items') {
                $scope.updateValuesItems(formField, resValues.values);
            } else if (valuesDisplay == 'form') {
                $scope.updateValuesForm(formField, resValues.values, extData);
            }
        });
    }
    $scope.updateValuesForm = function (formField, newValues, extData) {
        formField.values = [];
        formField.values_key = {};
        var k;
        if (extData) {
            if (extData.selection_display == 'property') {
                for (k = 0; k < newValues.length; k++) {
                    formField.values.push({
                        _id: newValues[k]._id,
                        name: $scope.resolvePath(newValues[k], extData.selection_full_path)
                    });
                    formField.values_key[newValues[k]._id] = $scope.resolvePath(newValues[k], extData.selection_full_path);
                }
            } else if (extData.selection_display == 'calculation') {
                for (k = 0; k < newValues.length; k++) {
                    formField.values.push({
                        _id: newValues[k]._id,
                        name: $scope.calculation(newValues[k], extData.selection_calculation)
                    });
                    formField.values_key[newValues[k]._id] = $scope.calculation(newValues[k], extData.selection_calculation);
                }
            }
        } else {
            for (k = 0; k < newValues.length; k++) {
                formField.values.push({
                    _id: newValues[k]._id,
                    name: SessionService.translate(newValues[k].name)
                });
                formField.values_key[newValues[k]._id] =
                    SessionService.translate(newValues[k].name);
            }
        }
    }
    $scope.updateValuesTitle = function (formField, newValues, extData) {
        formField.title_values = {};
        var k;
        if (extData) {
            if (extData.title_display_text == 'property') {
                for (k = 0; k < newValues.length; k++) {
                    formField.title_values[newValues[k]._id] = $scope.resolvePath(newValues[k], extData.title_full_path);
                }
            } else if (extData.title_display_text == 'calculation') {
                for (k = 0; k < newValues.length; k++) {
                    formField.title_values[newValues[k]._id] = $scope.calculation(newValues[k], extData.title_calculation);
                }
            }
        } else {
            for (k = 0; k < newValues.length; k++) {
                formField.title_values[newValues[k]._id] =
                    SessionService.translate(newValues[k].name);
            }
        }
    }
    $scope.updateValuesSubTitle = function (formField, newValues, extData) {
        formField.subtitle_values = {};
        var k;
        if (extData) {
            if (extData.subtitle_display_text == 'property') {
                for (k = 0; k < newValues.length; k++) {
                    formField.subtitle_values[newValues[k]._id] = $scope.resolvePath(newValues[k], extData.subtitle_full_path);
                }
            } else if (extData.subtitle_display_text == 'calculation') {
                for (k = 0; k < newValues.length; k++) {
                    formField.subtitle_values[newValues[k]._id] = $scope.calculation(newValues[k], extData.subtitle_calculation);
                }
            }
        } else {
            for (k = 0; k < newValues.length; k++) {
                formField.subtitle_values[newValues[k]._id] =
                    SessionService.translate(newValues[k].name);
            }
        }
    }
    $scope.updateValuesItems = function (formField, newValues) {
        var valuesFieldName = formField.projectionid + '_values';
        formField[valuesFieldName] = newValues;
        $scope.data[formField.projectionid] = newValues;
    }
    $scope.initComponents = function () {
        var formFields = $scope.form.fields;
        var formValues = $scope.form.values;
        var i, j;
        for (i = 0; i < formFields.length; i++) {
            if (formFields[i].display == 'address') {
                $scope.localdata[formFields[i].id] = $scope.resolvePath($scope.data, formFields[i].full_path);
                if (formFields[i].disabled && formFields[i].show_map) {
                    MapService.initMap('map' + formFields[i].id);
                    var address = $scope.localdata[formFields[i].id];
                    MapService.geocodeAddress('map' + formFields[i].id, (address.address_line1 ? (address.address_line1 + ',') : '') + (address.address_line2 ? (address.address_line2 + ',') : '') + (address.address_city ? (address.address_city + ',') : '') + (address.address_postal_code ? (address.address_postal_code + ',') : '') + (address.address_country ? (address.address_country + ',') : ''));
                }
            } else if (formFields[i].display == 'currency') {
                $scope.localdata[formFields[i].id] = $scope.resolvePath($scope.data, formFields[i].full_path);
                for (j = 0; j < formValues.length; j++) {
                    if (formFields[i].listofvalues == formValues[j]._id) {
                        if (formValues[j].type == 'list') {
                            $scope.updateValuesForm(formFields[i], formValues[j].values);
                        } else {
                            $scope.queryValues(formValues[j]._id, formValues[j].type, formValues[j].values, formFields[i], 'form', formFields[i]);
                        }
                        break;
                    }
                }
            } else if (formFields[i].display == 'selection') {
                $scope.localdata[formFields[i].id] = $scope.resolvePath($scope.data, formFields[i].full_path);
                for (j = 0; j < formValues.length; j++) {
                    if (formFields[i].listofvalues == formValues[j]._id) {
                        if (formValues[j].type == 'list') {
                            $scope.updateValuesForm(formFields[i], formValues[j].values);
                        } else {
                            var selectionValues = {};
                            selectionValues.relation = formValues[j].values.relation;
                            selectionValues.user_fields = $scope.computeFields(formFields[i].selection_full_path, formFields[i].selection_calculation);
                            selectionValues.id_list = [];
                            if (formFields[i].disabled) {
                                selectionValues.id_list.push($scope.resolvePath($scope.data, $scope.form.datamodel.projection[formFields[i].projectionid].full_path));
                            }
                            $scope.queryValues(formValues[j]._id, formValues[j].type, selectionValues, formFields[i], 'form', formFields[i]);
                        }
                        break;
                    }
                }
            } else if (formFields[i].display == 'calendar') {
                if (formFields[i].init_value && formFields[i].init_value != '' && $routeParams[formFields[i].init_value]) {
                    $scope.localdata[formFields[i].id] = $routeParams[formFields[i].init_value];
                } else {
                    $scope.localdata[formFields[i].id] = $scope.resolvePath($scope.data, formFields[i].full_path);
                }
                if ($scope.localdata[formFields[i].id]) {
                    $scope.localdata[formFields[i].id] = new Date($scope.localdata[formFields[i].id]);
                }
            } else if (formFields[i].display == 'calculation') {
                var data = $scope.data;
                $scope.localdata[formFields[i].id] = eval(formFields[i].calculation);
            } else if (formFields[i].display == 'list') {
                $scope.show_search = true;
                $scope.form_field_list = formFields[i];
                $scope.form_field_list_title_user_fields = '';
                $scope.form_field_list_subtitle_user_fields = '';
                for (j = 0; j < formValues.length; j++) {
                    if (formFields[i].title_listofvalues == formValues[j]._id) {
                        if (formValues[j].type == 'list') {
                            $scope.updateValuesTitle(formFields[i], formValues[j].values);
                        } else {
                            $scope.form_field_list_title_user_fields = $scope.computeFields(formFields[i].title_full_path, formFields[i].title_calculation);
                        }
                    } else if (formFields[i].subtitle_listofvalues == formValues[j]._id) {
                        if (formValues[j].type == 'list') {
                            $scope.updateValuesSubTitle(formFields[i], formValues[j].values);
                        } else {
                            $scope.form_field_list_subtitle_user_fields = $scope.computeFields(formFields[i].subtitle_full_path, formFields[i].subtitle_calculation);
                        }
                    }
                }
                $scope.formLoaded = true;
                $scope.getNextData();
            } else if (formFields[i].display == 'item') {
                for (j = 0; j < formValues.length; j++) {
                    if (formFields[i].listofvalues == formValues[j]._id) {
                        if (formValues[j].type == 'list') {
                            $scope.updateValuesItems(i, formValues[j].values);
                        } else {
                            var itemValues = {};
                            itemValues.relation = formValues[j].values.relation;
                            itemValues.id_list = $scope.resolvePath($scope.data, $scope.form.datamodel.projection[formFields[i].projectionid].full_path);
                            itemValues.user_fields = $scope.computeFields(formFields[i].title_full_path, formFields[i].title_calculation) + ' ';
                            itemValues.user_fields += $scope.computeFields(formFields[i].subtitle_full_path, formFields[i].subtitle_calculation);
                            itemValues.user_fields = itemValues.user_fields.trim();
                            $scope.queryValues(formValues[j]._id, formValues[j].type, itemValues, formFields[i], 'items');
                        }
                    }
                }
            } else if (formFields[i].display == 'file' || formFields[i].display == 'image') {
                $scope.currentFile[formFields[i].id] = 0;
                $scope.filesCount[formFields[i].id] = 0;
                if (formFields[i].display == 'image' && formFields[i].init_value && formFields[i].init_value != '' && $routeParams[formFields[i].init_value]) {
                    $scope.localdata[formFields[i].id] = eval($routeParams[formFields[i].init_value]);
                } else if (formFields[i].default_value && formFields[i].default_value != '') {
                    $scope.localdata[formFields[i].id] = eval(formFields[i].default_value);
                } else {
                    $scope.localdata[formFields[i].id] = $scope.resolvePath($scope.data, formFields[i].full_path);
                }
                if (!$scope.localdata[formFields[i].id]) {
                    $scope.localdata[formFields[i].id] = [];
                }
                $scope.files[formFields[i].id] = [];
                for (var f = 0; f < $scope.localdata[formFields[i].id].length; f++) {
                    $scope.files[formFields[i].id].push({
                        _id: $scope.localdata[formFields[i].id][f]._id,
                        name: $scope.localdata[formFields[i].id][f].name,
                        type: $scope.localdata[formFields[i].id][f].type
                    });
                }
                if ($scope.localdata[formFields[i].id]) {
                    for (var k = 0; k < $scope.localdata[formFields[i].id].length; k++) {
                        $scope.slides.push({
                            url: '/client/file/' + $scope.localdata[formFields[i].id][k]._id,
                            caption: ''
                        });
                    }
                }
            } else if (formFields[i].display == 'appointment') {
                var dateValue;
                $scope.localdata[formFields[i].id] = {};
                if (formFields[i].init_value_start && formFields[i].init_value_start != '' && $routeParams[formFields[i].init_value_start]) {
                    $scope.localdata[formFields[i].id].start_time = new Date();
                    $scope.localdata[formFields[i].id].start_time.setTime($routeParams[formFields[i].init_value_start]);
                } else {
                    dateValue = $scope.resolvePath($scope.data, formFields[i].full_path + '.start_time');
                    if (dateValue) {
                        $scope.localdata[formFields[i].id].start_time = new Date(dateValue);
                    }
                }
                if ($scope.localdata[formFields[i].id].start_time) {
                    $scope.localdata[formFields[i].id].start_time_hours = $scope.addZero($scope.localdata[formFields[i].id].start_time.getHours());
                    $scope.localdata[formFields[i].id].start_time_minutes = $scope.addZero($scope.localdata[formFields[i].id].start_time.getMinutes());
                }
                if (formFields[i].init_value_end && formFields[i].init_value_end != '' && $routeParams[formFields[i].init_value_end]) {
                    $scope.localdata[formFields[i].id].end_time = new Date();
                    $scope.localdata[formFields[i].id].end_time.setTime($routeParams[formFields[i].init_value_end]);
                } else {
                    dateValue = $scope.resolvePath($scope.data, formFields[i].full_path + '.end_time');
                    if (dateValue) {
                        $scope.localdata[formFields[i].id].end_time = new Date(dateValue);
                    }
                }
                if ($scope.localdata[formFields[i].id].end_time) {
                    $scope.localdata[formFields[i].id].end_time_hours = $scope.addZero($scope.localdata[formFields[i].id].end_time.getHours());
                    $scope.localdata[formFields[i].id].end_time_minutes = $scope.addZero($scope.localdata[formFields[i].id].end_time.getMinutes());
                }
            } else if (formFields[i].display == 'appointment_properties') {
                if (!$scope.data._appointment_properties || !$scope.data._appointment_properties.non_stop) {
                    $scope.data._appointment_properties = {
                        non_stop: {
                            enabled: true
                        }
                    }
                    $scope.updateWholeWeek($scope.data._appointment_properties);
                }
            } else {
                if (formFields[i].init_value && formFields[i].init_value != '' && $routeParams[formFields[i].init_value]) {
                    $scope.localdata[formFields[i].id] = $routeParams[formFields[i].init_value];
                } else if (formFields[i].default_value && formFields[i].default_value != '') {
                    $scope.localdata[formFields[i].id] = formFields[i].default_value;
                } else {
                    $scope.localdata[formFields[i].id] = $scope.resolvePath($scope.data, formFields[i].full_path);
                }
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
                        if (field.display == 'file' || field.display == 'image') {
                            if (field.projectionid && ($scope.form.datamodel.projection[field.projectionid].type == 'item' || $scope.form.datamodel.projection[field.projectionid].type == 'reference')) {
                                populate = populate + $scope.form.datamodel.projection[field.projectionid].full_path + ' ';
                            }
                        }
                        /*if (field.display == 'list' || field.display == 'item') {} else {
                            if (field.projectionid && ($scope.form.datamodel.projection[field.projectionid].type == 'item' || $scope.form.datamodel.projection[field.projectionid].type == 'reference')) {
                                populate = populate + $scope.form.datamodel.projection[field.projectionid].full_path + ' ';
                            }
                        }*/
                    }
                }
            }
        }
        $scope.updateAppName();
        $scope.initText();
        if ($scope.form.search_criteria) {
            $scope.form.search_criteria = $scope.form.search_criteria.replace(/@_user_id/g, $scope.sessionData.userData._id);
            var dateNow = new Date();
            $scope.form.search_criteria = $scope.form.search_criteria.replace(/@@today/g, dateNow.toISOString());
            var keysOfParameters = Object.keys($routeParams);
            for (var m = 0, l = keysOfParameters.length; m < l; m++) {
                $scope.form.search_criteria = $scope.form.search_criteria.replace('@' + keysOfParameters[m], $routeParams[
                    keysOfParameters[m]]);
            }
            $scope.search_criteria = $scope.form.search_criteria;
        }
        if ($scope.form.datamodel) {
            if ($routeParams.entry_id == '0') {
                $scope.data = new Datas({
                    datamodel_id: $scope.form.datamodel._id
                });
                $scope.data._user = $scope.sessionData.userData._id;
                $scope.dataLoaded = true;
                $scope.initComponents();
            } else {
                Datas.get({
                    datamodel_id: $scope.form.datamodel._id,
                    entry_id: $routeParams.entry_id,
                    search_criteria: $scope.search_criteria,
                    populate: populate.trim(),
                    pid: $routeParams.pid
                }, function (data) {
                    $scope.data = data;
                    $scope.dataLoaded = true;
                    $scope.initComponents();
                });
            }
        }
    });

    $scope.gotoNextForm = function (formula, nextFormId, data) {
        if (nextFormId == 'home') {
            if ($routeParams.pid) {
                SessionService.location('/workflows/' + $scope.sessionData.application_id + '?pid=' + $routeParams.pid);
            } else {
                SessionService.location('/workflows/' + $scope.sessionData.application_id);
            }
        } else if (nextFormId == 'back') {
            SessionService.locationBack(false);
        } else {
            var formUrl = '/form/' + nextFormId + '/';
            if (data && data._id) {
                formUrl = formUrl + data._id + '?application_id=' + $routeParams.application_id + '&workflow_id=' + $routeParams.workflow_id;
                if (formula) {
                    for (var i = 0; i < formula.length; i++) {
                        formUrl = formUrl + '&' + $scope.form.datamodel.projection[formula[i]].full_path +
                            '=' + $scope.resolvePath(data, $scope.form.datamodel.projection[formula[i]].full_path);
                    }
                }
            } else {
                formUrl = formUrl + '0?application_id=' + $routeParams.application_id + '&workflow_id=' + $routeParams.workflow_id;
            }
            if ($routeParams.pid) {
                formUrl = formUrl + '&pid=' + $routeParams.pid;
            }
            if ($scope.list_interval_validation[0] && $scope.list_interval_validation[1] && $scope.list_interval_validation[2] && $scope.list_interval_validation[3] && $scope.list_interval_validation[4] && $scope.list_interval_validation[5]) {
                formUrl = formUrl + '&_interval_start=' + $scope.list_interval.start.getTime();
                formUrl = formUrl + '&_interval_end=' + $scope.list_interval.end.getTime();
            }
            if (formUrl != $location.url()) {
                SessionService.location(formUrl);
            } else {
                $route.reload();
            }
        }
    }

    $scope.uploadFile = function (file, url, fieldId) {
        var xhr = new XMLHttpRequest();
        xhr.open('PUT', url);
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
        }
        xhr.send(file);
    }

    // do not add var in front of the function name neither put it in the scope!!!
    changeFilesInFormsJS = function (files, fieldId) {
        if (files.length == 0) return;
        //$scope.dynamicForm.$setValidity({'Attachments': true});
        if (!$scope.localdata[fieldId]) {
            $scope.localdata[fieldId] = [];
        }
        for (var k = files.length - 1; k >= 0; k--) {
            if (files[k].size / 1048576 > 20) {
                files.splice(k, 1);
            }
        }
        $scope.filesCount[fieldId] = files.length;
        $scope.currentFile[fieldId] = 1;
        document.getElementById('file_upload_' + fieldId).textContent = $scope.sessionData.appData.uploading_in_progress + ' ' + $scope.currentFile[fieldId] + '/' + $scope.filesCount[fieldId];
        for (var i = 0; i < $scope.filesCount[fieldId]; i++) {
            var file = new Files({
                name: files[i].name,
                type: files[i].type,
                pid: $routeParams.pid
            });
            $scope.files[fieldId].push(files[i]);
            file.$save(function (res) {
                for (var j = 0; j < $scope.files[fieldId].length; j++) {
                    if ($scope.files[fieldId][j].name == res.file.name) {
                        $scope.localdata[fieldId].push({
                            _id: res.file._id,
                            name: res.file.name,
                            type: res.file.type
                        });
                        $scope.files[fieldId][j]._id = res.file._id;
                        $scope.uploadFile($scope.files[fieldId][j], res.url, fieldId);
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
                    id: fileId,
                    pid: $routeParams.pid
                }, function (res) {
                    for (var j = 0; j < $scope.files[fieldId].length; j++) {
                        if ($scope.files[fieldId][j]._id == fileId) {
                            $scope.files[fieldId].splice(j, 1);
                            break;
                        }
                    }
                }, function (res) {
                    /* show error*/
                })
                break;
            }
        }
    }

    $scope.computeDateKey = function (date) {
        return [date.getFullYear(), $scope.addZero(date.getMonth() + 1), $scope.addZero(date.getDate())].join("-");
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
            for (var j = 0; j < 7; j++) {
                properties.days[j] = {
                    whole_day: false,
                    enabled: false
                }
                $scope.updateWholeDay(properties.days[j]);
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
    $scope.updateDate = function (fieldId, dateEntry) {
        var dateNode = $scope.localdata[fieldId];
        if (dateNode) {
            var date = dateNode[dateEntry];
            date.setHours(parseInt(dateNode[dateEntry + '_hours'] ? dateNode[dateEntry + '_hours'] : '0'));
            date.setMinutes(parseInt(dateNode[dateEntry + '_minutes'] ? dateNode[dateEntry + '_minutes'] : '0'));
            date.setSeconds(0);
            date.setMilliseconds(0);
            /*$scope.hours = [];
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
            }*/
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
        var dateKey = $scope.computeDateKey(date);
        // check if day of week is allowed
        if ($scope.data._appointment_properties && $scope.data._appointment_properties.days && $scope.data._appointment_properties.days[date.getDay()] && $scope.data._appointment_properties.days[date.getDay()].enabled) {
            return true;

            // check if there are free time slots
            if ($scope.data._appointments && $scope.data._appointments[dateKey] && $scope.data._appointments[dateKey].busy && $scope.data._appointments[dateKey].busy.length > 0) {
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
        var dateKey = $scope.computeDateKey(date);
        // check if there are free time slots
        if ($scope.data._appointments && $scope.data._appointments[dateKey] && $scope.data._appointments[dateKey].busy && $scope.data._appointments[dateKey].busy.length > 0) {
            return '' + $scope.data._appointments[dateKey].busy.length;
        } else {
            return '';
        }
    }

    $scope.addZero = function (value) {
        return (value > 9 ? '' + value : '0' + value);
    }
    $scope.dayClick = function (date) {
        $scope.selectedDate = date;
        var dateKey = $scope.computeDateKey(date);
        if ($scope.data._appointments && $scope.data._appointments[dateKey] && $scope.data._appointments[dateKey].busy && $scope.data._appointments[dateKey].busy.length > 0) {
            $scope.appointments = $scope.data._appointments[dateKey].busy.sort(function (a, b) {
                return (a.start - b.start);
            });
            for (var i = 0; i < $scope.appointments.length; i++) {
                var appointment = $scope.appointments[i];
                appointment.start_hours = Math.floor(appointment.start / 60);
                appointment.start_minutes = appointment.start - appointment.start_hours * 60;
                appointment.end_hours = Math.floor(appointment.end / 60);
                appointment.end_minutes = appointment.end - appointment.end_hours * 60;
                appointment.start_hours = $scope.addZero(appointment.start_hours);
                appointment.start_minutes = $scope.addZero(appointment.start_minutes);
                appointment.end_hours = $scope.addZero(appointment.end_hours);
                appointment.end_minutes = $scope.addZero(appointment.end_minutes);
            }
        } else {
            $scope.appointments = [];
        }
    }

    $scope.updateComponents = function (form, setValue, data) {
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

    $scope.updateErrorAlert = function () {
        $mdDialog.show(
            $mdDialog.alert()
            .parent(angular.element(document.body))
            .clickOutsideToClose(true)
            .title($scope.sessionData.appData.new_document_version)
            .textContent($scope.sessionData.appData.already_modified_document)
            .ok($scope.sessionData.appData.ok)
        );
    }

    $scope.errorAlert = function (error) {
        $mdDialog.show(
            $mdDialog.alert()
            .parent(angular.element(document.body))
            .clickOutsideToClose(true)
            .title($scope.sessionData.appData.error)
            .textContent(error)
            .ok($scope.sessionData.appData.ok)
        );
    }

    $scope.notify = function (notifyUser, emailTitle, emailHtml, itemId) {
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
            for (var i = 0; fieldList && i < fieldList.length; i++) {
                if (fieldList[i] != '@@') {
                    translatedEmail = translatedEmail.replace(new RegExp(fieldList[i], 'g'), $scope.localdata[fieldList[i].replace(/@/g, '')]);
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
        $scope.updateComponents($scope.form, setValue, $scope.data);
        if ($routeParams.pid) {
            $scope.data.pid = $routeParams.pid;
        }
        $scope.data.$save(function (res) {
            $scope.notify(notifyUser, emailTitle, emailHtml);
            $scope.gotoNextForm(formula, nextFormId, (forwardId ? res : null));
        }, function (res) {
            $scope.data = res.data;
        });
    }
    $scope.modify = function (formula, nextFormId, setValue, forwardId, notifyUser, emailTitle, emailHtml) {
        $scope.updateComponents($scope.form, setValue, $scope.data);
        Datas.update({
            datamodel_id: $scope.form.datamodel._id,
            entry_id: $scope.data._id,
            pid: $routeParams.pid
        }, $scope.data, function (res) {
            $scope.notify(notifyUser, emailTitle, emailHtml);
            $scope.gotoNextForm(formula, nextFormId, (forwardId ? res : null));
        }, function (res) {
            $scope.data = res.data;
            $scope.updateErrorAlert();
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
            .cancel($scope.sessionData.appData.cancel)).then(
            function () {
                Datas.remove({
                    datamodel_id: $scope.form.datamodel._id,
                    entry_id: $scope.data._id,
                    pid: $routeParams.pid
                }, function (res) {
                    $scope.notify(notifyUser, emailTitle, emailHtml);
                    $scope.gotoNextForm(formula, nextFormId, null);
                }, function (error) {
                    /* show error*/
                });
            });
    }
    $scope.link = function (formula, nextFormId, forwardId, notifyUser, emailTitle, emailHtml) {
        $scope.notify(notifyUser, emailTitle, emailHtml);
        $scope.gotoNextForm(formula, nextFormId, (forwardId ? $scope.data : null));
    }

    $scope.subscribe = function (formula, nextFormId, setValue, forwardId, itemPath, notifyUser, emailTitle, emailHtml) {
        $scope.updateComponents($scope.form, setValue, $scope.data);
        $scope.resolvePath($scope.data, itemPath).push($scope.sessionData.userData._id);
        Datas.update({
            datamodel_id: $scope.form.datamodel._id,
            entry_id: $scope.data._id,
            pid: $routeParams.pid
        }, $scope.data, function (res) {
            $scope.notify(notifyUser, emailTitle, emailHtml);
            $scope.gotoNextForm(formula, nextFormId, (forwardId ? $scope.data : null));
        }, function (res) {
            $scope.data = res.data;
            $scope.updateErrorAlert();
        });
    }
    $scope.unsubscribe = function (formula, nextFormId, setValue, forwardId, itemPath, notifyUser, emailTitle, emailHtml) {
        $scope.updateComponents($scope.form, setValue, $scope.data);
        var itemList = $scope.resolvePath($scope.data, itemPath);
        for (var i = itemList.length - 1; i >= 0; i--) {
            if (itemList[i] == $scope.sessionData.userData._id || itemList[i]._id == $scope.sessionData.userData._id) {
                itemList.splice(i, 1);
            }
        }
        Datas.update({
            datamodel_id: $scope.form.datamodel._id,
            entry_id: $scope.data._id,
            pid: $routeParams.pid
        }, $scope.data, function (res) {
            $scope.notify(notifyUser, emailTitle, emailHtml);
            $scope.gotoNextForm(formula, nextFormId, (forwardId ? $scope.data : null));
        }, function (res) {
            $scope.data = res.data;
            $scope.updateErrorAlert();
        });
    }

    $scope.deleteItem = function (formula, nextFormId, setValue, itemId, itemPath, notifyUser, emailTitle, emailHtml) {
        $mdDialog.show(
            $mdDialog.confirm()
            .parent(angular.element(document.body))
            .clickOutsideToClose(true)
            .title($scope.sessionData.appData.confirmation)
            .textContent($scope.sessionData.appData.removal_confirmation)
            .ok($scope.sessionData.appData.ok)
            .cancel($scope.sessionData.appData.cancel)).then(
            function () {
                $scope.updateComponents($scope.form, setValue, $scope.data);
                var itemList = $scope.resolvePath($scope.data, itemPath);
                for (var i = itemList.length - 1; i >= 0; i--) {
                    if (itemList[i] == itemId || itemList[i]._id == itemId) {
                        itemList.splice(i, 1);
                    }
                }
                Datas.update({
                    datamodel_id: $scope.form.datamodel._id,
                    entry_id: $scope.data._id,
                    pid: $routeParams.pid
                }, $scope.data, function (res) {
                    $scope.notify(notifyUser, emailTitle, emailHtml, itemId);
                    $scope.gotoNextForm(formula, nextFormId, $scope.data);
                }, function (res) {
                    $scope.data = res.data;
                    $scope.updateErrorAlert();
                });
            });
    }
    $scope.moveItem = function (formula, nextFormId, setValue, itemId, itemPath, destinationItemPath, notifyUser, emailTitle, emailHtml) {
        $scope.updateComponents($scope.form, setValue, $scope.data);
        var itemList = $scope.resolvePath($scope.data, itemPath);
        for (var i = itemList.length - 1; i >= 0; i--) {
            if (itemList[i] == itemId || itemList[i]._id == itemId) {
                itemList.splice(i, 1);
            }
        }
        $scope.resolvePath($scope.data, destinationItemPath).push(itemId);
        Datas.update({
            datamodel_id: $scope.form.datamodel._id,
            entry_id: $scope.data._id,
            pid: $routeParams.pid
        }, $scope.data, function (res) {
            $scope.notify(notifyUser, emailTitle, emailHtml, itemId);
            $scope.gotoNextForm(formula, nextFormId, $scope.data);
        }, function (res) {
            $scope.data = res.data;
            $scope.updateErrorAlert();
        });
    }

    $scope.modifyList = function (formula, nextFormId, setValue, data, notifyUser, emailTitle, emailHtml) {
        $scope.updateComponents($scope.form, setValue, data);
        Datas.update({
            datamodel_id: $scope.form.datamodel._id,
            entry_id: data._id,
            pid: $routeParams.pid
        }, data, function (res) {
            $scope.notify(notifyUser, emailTitle, emailHtml);
            $scope.gotoNextForm(formula, nextFormId, res);
        }, function (res) {
            $scope.data = res.data;
            $scope.updateErrorAlert();
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
            .cancel($scope.sessionData.appData.cancel)).then(
            function () {
                Datas.remove({
                    datamodel_id: $scope.form.datamodel._id,
                    entry_id: data._id,
                    pid: $routeParams.pid
                }, function (res) {
                    $scope.notify(notifyUser, emailTitle, emailHtml);
                    $scope.gotoNextForm(formula, nextFormId, null);
                }, function (res) {
                    /* show error*/
                });
            });
    }
    $scope.linkList = function (formula, nextFormId, data, notifyUser, emailTitle, emailHtml) {
        $scope.notify(notifyUser, emailTitle, emailHtml);
        $scope.gotoNextForm(formula, nextFormId, data);
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
    $scope.share = function (formula, nextFormId, setValue, constraintPath, constraintValue, emailPath, shareAppProfileId, message, data) {
        $scope.updateComponents($scope.form, setValue, data);
        Datas.update({
            datamodel_id: $scope.form.datamodel._id,
            entry_id: data._id,
            pid: $routeParams.pid
        }, data, function (res) {
            Share.update({
                app_profile_id: shareAppProfileId,
                datamodel_id: $scope.form.datamodel._id,
                data_id: data._id,
                email: $scope.resolvePath(data, emailPath),
                message: message,
                key: constraintPath,
                value: constraintValue
            }, function (res) {
                $scope.gotoNextForm(formula, nextFormId, data);
            })
        }, function (res) {
            $scope.data = res.data;
            $scope.updateErrorAlert();
        });
    }
    $scope.calendar = function (formula, nextFormId, setValue, forwardId, projectNamePath, startDatePath, endDatePath, userPath, data) {
        $scope.updateComponents($scope.form, setValue, data);
        Datas.update({
            datamodel_id: $scope.form.datamodel._id,
            entry_id: data._id,
            pid: $routeParams.pid
        }, data, function (res) {
            Calendar.get({
                project_name: $scope.resolvePath(data, projectNamePath),
                start_date: $scope.resolvePath(data, startDatePath),
                end_date: $scope.resolvePath(data, endDatePath),
                user_id: $scope.resolvePath(data, userPath)
            }, function (res) {
                $scope.gotoNextForm(formula, nextFormId, (forwardId ? data : null));
            })
        }, function (res) {
            $scope.data = res.data;
            $scope.updateErrorAlert();
        });
    }

    $scope.addEvent = function (formula, nextFormId, setValue, objectNamePath, periodPath, reservation_datamodel, objectIdReservationPath, nameReservationPath, periodReservationPath) {
        $scope.updateComponents($scope.form, setValue, $scope.data);
        var reservation = {};
        $scope.resolvePathUpdate(reservation, objectIdReservationPath, $scope.data._id);
        $scope.resolvePathUpdate(reservation, nameReservationPath, $scope.resolvePath($scope.data, objectNamePath));
        $scope.resolvePathUpdate(reservation, periodReservationPath + '.start_time', $scope.resolvePath($scope.data, periodPath).start_time);
        $scope.resolvePathUpdate(reservation, periodReservationPath + '.end_time', $scope.resolvePath($scope.data, periodPath).end_time);
        Event.update({
            datamodel_id: $scope.form.datamodel._id,
            id: $scope.data._id
        }, {
            object_name: $scope.resolvePath($scope.data, objectNamePath),
            start_time: $scope.resolvePath($scope.data, periodPath).start_time,
            end_time: $scope.resolvePath($scope.data, periodPath).end_time,
            reservation_object: reservation,
            _user: $scope.data._user,
            reservation_datamodel_id: reservation_datamodel
        }, function (res) {
            $scope.gotoNextForm(formula, nextFormId, $scope.data);
        }, function (res) {
            if (res.data) {
                $scope.data = res.data;
                $scope.initComponents();
            }
            $scope.errorAlert($scope.sessionData.appData.error_creating_appointment);
        });
    }

    $scope.removeEvent = function (formula, nextFormId, setValue, objectIdPath, periodPath) {
        $mdDialog.show(
            $mdDialog.confirm()
            .parent(angular.element(document.body))
            .clickOutsideToClose(true)
            .title($scope.sessionData.appData.confirmation)
            .textContent($scope.sessionData.appData.removal_confirmation)
            .ok($scope.sessionData.appData.ok)
            .cancel($scope.sessionData.appData.cancel)).then(
            function () {
                Reservation.remove({
                    datamodel_id: $scope.form.datamodel._id,
                    id: $scope.data._id,
                    object_id_path: objectIdPath,
                    period_path: periodPath
                }, function (res) {
                    $scope.gotoNextForm(formula, nextFormId, $scope.data);
                }, function (res) {
                    if (res.data) {
                        $scope.data = res.data;
                        $scope.initComponents();
                    }
                    $scope.errorAlert($scope.sessionData.appData.error_removing_appointment);
                });
            });
    }

    $scope.pay = function (formula, nextFormId, setValue, paymentCountry, paymentCurrency, paymentValuePath, paymentLabelPath) {
        $scope.updateComponents($scope.form, setValue, $scope.data);
        document.getElementById('paypal_country').value = paymentCountry;
        document.getElementById('paypal_currency').value = paymentCurrency;
        document.getElementById('paypal_merchant_id').value = $scope.sessionData.userData.company.properties.payment.paypal_merchant_id;
        document.getElementById('paypal_label').value = $scope.resolvePath($scope.data, paymentLabelPath);
        document.getElementById('paypal_amount').value = $scope.resolvePath($scope.data, paymentValuePath);
        document.getElementById('paypal_return').value = "https://app1.digital/app/#!/form/5d5b1428258b030998ff4180/0?application_id=5d5b13f6258b030998ff417e&workflow_id=5d5b1411258b030998ff417f";
        document.getElementById('paypal_cancel_return').value = "https://app1.digital/app/#!/form/5d5b1428258b030998ff4180/0?application_id=5d5b13f6258b030998ff417e&workflow_id=5d5b1411258b030998ff417f";
        document.getElementById('paypal').submit();
    }

    $scope.search = function (search_text) {
        if (!search_text) {
            search_text = ''
        }
        $scope.search_text = search_text;
        $scope.skip = 0;
        $scope.limit = 10;
        $scope.stopScroll = false;
        $scope.tempStopScroll = false;
        $scope.datas = [];
        $scope.getNextData();
    }

    $scope.interval = function (fieldId, dateValueObject, objectId) {
        $scope.list_interval_validation[objectId] = true;
        if (dateValueObject.date) {
            var date = dateValueObject.date;
            date.setHours(parseInt(dateValueObject.hours ? dateValueObject.hours : '0'));
            date.setMinutes(parseInt(dateValueObject.minutes ? dateValueObject.minutes : '0'));
            date.setSeconds(0);
            date.setMilliseconds(0);
        }
        if ($scope.list_interval_validation[0] && $scope.list_interval_validation[1] && $scope.list_interval_validation[2] && $scope.list_interval_validation[3] && $scope.list_interval_validation[4] && $scope.list_interval_validation[5]) {
            $scope.list_interval.start = $scope.list_interval.start_date.date;
            $scope.list_interval.end = $scope.list_interval.end_date.date;
            $scope.skip = 0;
            $scope.limit = 10;
            $scope.stopScroll = false;
            $scope.tempStopScroll = false;
            $scope.datas = [];
            $scope.getNextData();
        }
    }
}]);
