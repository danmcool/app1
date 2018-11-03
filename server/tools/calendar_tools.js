var Constants = require('../tools/constants.js');

var CalendarTools = {}

var computeDateKey = function (date) {
    return [date.getFullYear(), (((date.getMonth() + 1) < 10) ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)), (date.getDate() < 10) ? '0' + date.getDate() : date.getDate()].join("-");
}

var computeTimeDate = function (time) {
    return time.getHours() * 60 + time.getMinutes();
}

var computeTimeFromProperties = function (time) {
    return time.hours * 60 + time.minutes * 1;
}

var checkTimeIntersection = function (startTime1, endTime1, startDateTime2, endDateTime2) {
    if (startTime1 <= computeTimeDate(startDateTime2) && computeTimeDate(startDateTime2) < endTime1) return true;
    if (computeTimeDate(startDateTime2) <= startTime1 && startTime1 < computeTimeDate(endDateTime2)) return true;
    return false;
}

var checkIntervalIntersection = function (start1, end1, start2, end2) {
    if ((start1 <= start2 && start2 < end1) || (start2 <= start1 && start1 < end2)) return true;
    return false;
}

var availableInterval = function (intervalArray, startTime, endTime) {
    for (var i = 0; i < intervalArray.length; i++) {
        if (checkIntervalIntersection(intervalArray.start_time, intervalArray.end_time, startTime, endTime)) {
            return false;
        }
    }
    return true;
}

CalendarTools.computeQuery = function (startTime, endTime) {
    var startDay = Math.floor(startTime.getTime() / Constants.OneDay);
    var endDay = Math.floor(endTime.getTime() / Constants.OneDay);
    var startTimeKey = computeDateKey(startTime);
    var endTimeKey = computeDateKey(endTime);
    var query = {};
    if (startTime.getDay() == endTime.getDay() && (endTime.getTime() - startTime.getTime() < Constants.OneDay)) {
        query = JSON.parse('{"$or":[{"_appointments.' + startTimeKey + '":null},{"_appointments.' + startTimeKey + '.free":{"$elemMatch":{"start":{"$lte":' + computeTimeDate(startTime) + '},"end":{"$gte":' + computeTimeDate(endTime) + '}}}}]}');
    } else {
        var queryString = '{"$and":[{"$or":[{"_appointments.' + startTimeKey + '":null},{"_appointments.' + startTimeKey + '.free":{"$elemMatch":{"start":{"$lte":' + computeTimeDate(startTime) + '},"end":{"$gte":' + Constants.EndOfDay + '}}}}]},{"$or":[{"_appointments.' + endTimeKey + '":null},{"_appointments.' + endTimeKey + '.free":{"$elemMatch":{"start":{"$lte":' + Constants.StartOfDay + '},"end":{"$gte":' + computeTimeDate(endTime) + '}}}}]}';
        for (var i = 1; i < (endDay - startDay); i++) {
            var currentDateKey = computeDateKey(startTime + (startDay + i) * Constants.OneDay);
            queryString = queryString + ',{"$or":[{"_appointments.' + currentDateKey + '":null},{"_appointments.' + currentDateKey + '.free":{"$elemMatch":{"start":{"$lte":' + Constants.StartOfDay + '},"end":{"$gte":' + Constants.EndOfDay + '}}}}]}'
        }
        queryString = queryString + ']}';
        query = JSON.parse(queryString);
    }
    return query;
}

var addBusyInterval = function (intervals, start, end, user, object) {
    intervals.push({
        start: start,
        end: end,
        user: user,
        object: object
    });
}

var removeBusyInterval = function (intervals, user, object) {
    var interval = {};
    for (var i = 0; i < intervals.length; i++) {
        if (intervals[i].user == user && intervals[i].object == object) {
            interval.start = intervals[i].start;
            interval.end = intervals[i].end;
            intervals.splice(i, 1);
            removed = true;
            break;
        }
    }
    if (!removed) {
        console.log('error removing interval: ' + intervals.toString() + ' ' + start + ' ' + end);
    }
    return interval;
}

var addFreeInterval = function (intervals, start, end) {
    if (!start || !end) return;
    var added = false;
    for (var i = 0; i < intervals.length; i++) {
        if (intervals[i].start == end) {
            intervals[i].start = start;
            added = true;
            break;
        }
        if (intervals[i].end == start) {
            intervals[i].end = end;
            added = true;
            break;
        }
    }
    if (!added) {
        intervals.push({
            start: start,
            end: end
        });
    }
}

var removeFreeInterval = function (intervals, start, end) {
    var removed = false;
    for (var i = 0; i < intervals.length; i++) {
        if (intervals[i].start < start && end == intervals[i].end) {
            intervals[i].end = start;
            removed = true;
            break;
        }
        if (intervals[i].start == start && end < intervals[i].end) {
            intervals[i].start = end;
            removed = true;
            break;
        }
        if (intervals[i].start < start && intervals[i].end > end) {
            intervals.push({
                start: end,
                end: intervals[i].end
            });
            intervals[i].end = start;
            removed = true;
            break;
        }
    }
    if (!removed) {
        console.log('error removing interval: ' + intervals.toString() + ' ' + start + ' ' + end);
    }
}

CalendarTools.removeEvent = function (appointments, appointment_properties, startDate, endDate, user, object) {
    var startDay = Math.floor(startDate.getTime() / Constants.OneDay);
    var endDay = Math.floor(endDate.getTime() / Constants.OneDay);
    var startDateKey = computeDateKey(startDate);
    var endDateKey = computeDateKey(endDate);
    var interval = {};
    if (startDate.getDay() == endDate.getDay() && (endDate.getTime() - startDate.getTime() < Constants.OneDay)) {
        interval = removeBusyInterval(appointments[startDateKey].busy, user, object);
        addFreeInterval(appointments[startDateKey].free, interval.startTime, interval.endTime);
    } else if (startDay < endDay) {
        interval = removeBusyInterval(appointments[startDateKey].busy, user, object);
        addFreeInterval(appointments[startDateKey].free, interval.startTime, interval.endTime);
        interval = removeBusyInterval(appointments[endDateKey].busy, user, object);
        addFreeInterval(appointments[endDateKey].free, interval.startTime, interval.endTime);
        for (var i = 1; i < (endDay - startDay); i++) {
            var currentDate = startDate + (startDay + i) * Constants.OneDay;
            var dateKey = computeDateKey(currentDate);
            interval = removeBusyInterval(appointments[dateKey].busy, user, object);
            addFreeInterval(appointments[dateKey].free, interval.startTime, interval.endTime);
        }
    }
    return true;
}

CalendarTools.addEvent = function (appointments, appointment_properties, startDate, endDate, user, object) {
    var startDay = Math.floor(startDate.getTime() / Constants.OneDay);
    var endDay = Math.floor(endDate.getTime() / Constants.OneDay);
    var startDateKey = computeDateKey(startDate);
    var endDateKey = computeDateKey(endDate);
    var dayProperties = {};
    var startTime = computeTimeDate(startDate);
    var endTime = computeTimeDate(endDate);
    var startTimeProperties;
    var endTimeProperties
    if (startDate.getDay() == endDate.getDay() && (endDate.getTime() - startDate.getTime() < Constants.OneDay)) {
        dayProperties = appointment_properties.days[startDate.getDay()];
        if (!dayProperties.enabled) {
            return false;
        }
        startTimeProperties = computeTimeFromProperties(dayProperties.start_time);
        endTimeProperties = computeTimeFromProperties(dayProperties.end_time);
        if (endTime <= startTimeProperties ||
            startTime >= endTimeProperties) {
            return false;
        }
        if (!appointments[startDateKey]) {
            appointments[startDateKey] = {
                busy: [],
                free: [{
                    start: Constants.StartOfDay,
                    end: Constants.EndOfDay
                }]
            }
        }
        startTime = Math.max(startTime, startTimeProperties);
        endTime = Math.min(endTime, endTimeProperties);
        addBusyInterval(appointments[startDateKey].busy, startTime, endTime, user, object);
        removeFreeInterval(appointments[startDateKey].free, startTime, endTime);
        return true;
    } else if (startDay < endDay) {
        // start day appointment
        dayProperties = appointment_properties.days[startDate.getDay()];
        if (!dayProperties.enabled) {
            return false;
        }
        startTimeProperties = computeTimeFromProperties(dayProperties.start_time);
        endTimeProperties = computeTimeFromProperties(dayProperties.end_time);
        if (startTime >= endTimeProperties) {
            return false;
        }
        if (!appointments[startDateKey]) {
            appointments[startDateKey] = {
                busy: [],
                free: [{
                    start: Constants.StartOfDay,
                    end: Constants.EndOfDay
                }]
            }
        }
        startTime = Math.max(startTime, startTimeProperties);
        addBusyInterval(appointments[startDateKey].busy, startTime, endTimeProperties, user, object);
        removeFreeInterval(appointments[startDateKey].free, startTime, endTimeProperties);
        // end day appointment
        dayProperties = appointment_properties.days[endDate.getDay()];
        if (!dayProperties.enabled) {
            return false;
        }
        startTimeProperties = computeTimeFromProperties(dayProperties.start_time);
        endTimeProperties = computeTimeFromProperties(dayProperties.end_time);
        if (endTime <= startTimeProperties) {
            return false;
        }
        if (!appointments[endDateKey]) {
            appointments[endDateKey] = {
                busy: [],
                free: [{
                    start: Constants.StartOfDay,
                    end: Constants.EndOfDay
                }]
            }
        }
        endTime = Math.min(endTime, endTimeProperties);
        addBusyInterval(appointments[endDateKey].busy, startTimeProperties, endTime, user, object);
        removeFreeInterval(appointments[endDateKey].free, startTimeProperties, endTime);
        for (var i = 1; i < (endDay - startDay); i++) {
            var currentDate = startDate + (startDay + i) * Constants.OneDay;
            var dateKey = computeDateKey(currentDate);
            dayProperties = appointment_properties.days[currentDate.getDay()];
            if (!dayProperties.enabled) {
                return false;
            }
            startTimeProperties = computeTimeFromProperties(dayProperties.start_time);
            endTimeProperties = computeTimeFromProperties(dayProperties.end_time);
            if (!appointments[dateKey]) {
                appointments[dateKey] = {
                    busy: [],
                    free: [{
                        start: Constants.StartOfDay,
                        end: Constants.EndOfDay
                }]
                }
            }
            addBusyInterval(appointments[endDateKey].busy, startTimeProperties, endTimeProperties, user, object);
            removeFreeInterval(appointments[endDateKey].free, startTimeProperties, endTimeProperties);
        }
        return true;
    }
}

module.exports = CalendarTools;
