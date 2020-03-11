var MarchineLearning = {}

var Tools = require('../tools/tools.js');
var Constants = require('../tools/constants.js');

var localData = [];
var localIndex = -1;

var trainDataStreamBatch = function () {
    if (localData.length == 0) return;
    localIndex++;
    if (localIndex == localData.length) localIndex = 0;

    if (localData[localIndex].position >= localData[localIndex].data.length) {
        localData[localIndex].stream.endInputs();
        localData.splice(localIndex, 1);
        localIndex--;
        return;
    }

    for (var d = 0; localData[localIndex].position + d < localData[localIndex].data.length && d < Constants.MachineLearningMaxTrainingBatch; d++) {
        localData[localIndex].stream.write(localData[localIndex].data[d + localData[localIndex].position]);
    }
    localData[localIndex].position += Constants.MachineLearningMaxTrainingBatch;
    setImmediate(trainDataStreamBatch);
}

MarchineLearning.trainDataStream = function (trainingStream, trainData) {
    if (trainData.length == 0) return;
    localData.push({
        stream: trainingStream,
        data: trainData,
        position: 0
    });
    setImmediate(trainDataStreamBatch);
}

MarchineLearning.normalizeValue = function (value) {
    return Math.max(0.0, Math.min(1.0, parseFloat(value)));
}

module.exports = MarchineLearning;
