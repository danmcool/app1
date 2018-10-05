var Tools = {}

Tools.computeDateKey = function (date) {
    return [date.getFullYear(), (((date.getMonth() + 1) < 10) ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)), (date.getDate() < 10) ? '0' + date.getDate() : date.getDate()].join("-");
}

Tools.computeTimeObject = function (time) {
    return time.hours * 60 + time.minutes * 1;
}

Tools.computeTimeDate = function (time) {
    return time.getHours() * 60 + time.getMinutes();
}

Tools.checkTimeIntersection = function (startTime1, endTime1, startTime2, endTime2) {
    if (computeTimeObject(startTime1) <= computeTimeDate(startTime2) && computeTimeDate(startTime2) < computeTimeObject(endTime1)) return true;
    if (computeTimeDate(startTime2) <= computeTimeObject(startTime1) && computeTimeObject(startTime1) < computeTimeDate(endTime2)) return true;
    return false;
}

Tools.computePage = function (req) {
    return {
        skip: parseInt(req.query.skip) || 0,
        limit: parseInt(req.query.limit) || 10
    }
}

Tools.checkIntervalIntersection = function (start1, end1, start2, end2) {
    if ((start1 <= start2 && start2 < end1) || (start2 <= start1 && start1 < end2)) return true;
    return false;
}

Tools.availableInterval = function (intervalArray, startTime, endTime) {
    for (var i = 0; i < intervatArray.length; i++) {
        if (checkIntervalIntersection(intervalArray.start_time, intervalArray.end_time, startTime, endTime)) {
            return false;
        }
    }
    return true;
}

module.exports = Tools;
