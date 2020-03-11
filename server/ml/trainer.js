var brain = require('brain.js');

// provide optional config object (or undefined). Defaults shown.
const config = {
    binaryThresh: 0.5,
    hiddenLayers: [3], // array of ints for the sizes of the hidden layers in the network
    activation: 'sigmoid', // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh'],
    leakyReluAlpha: 0.01, // supported for activation type 'leaky-relu'
}

// create a simple feed forward neural network with backpropagation
const net = new brain.NeuralNetwork(config)

net.train([
    {
        input: [0, 0],
        output: [0]
    },
    {
        input: [0, 1],
        output: [1]
    },
    {
        input: [1, 0],
        output: [1]
    },
    {
        input: [1, 1],
        output: [0]
    },
])

const output = net.run([1, 0]) // [0.987]



/*
var net2 = new brain.NeuralNetwork();

var inputData = [{
        input: [0.2, 0.5, true, (1 / 130)],
        output: [1]
    },
    {
        input: [0.2, 0.5, true, (1 / 85)],
        output: [1]
    },
    {
        input: [0.2, 0.5, true, (1 / 87)],
        output: [1]
    },
    {
        input: [0.2, 0.5, true, (1 / 32)],
        output: [1]
    },
    {
        input: [0.2, 0.5, true, (1 / 32)],
        output: [1]
    },
    {
        input: [0.2, 0.5, true, (1 / 32)],
        output: [1]
    },
    {
        input: [0.2, 0.5, true, (1 / 32)],
        output: [1]
    },
    {
        input: [0.2, 0.5, true, (1 / 32)],
        output: [1]
    },
    {
        input: [0.2, 0.5, true, (1 / 32)],
        output: [1]
    },
    {
        input: [0.2, 0.5, true, (1 / 32)],
        output: [1]
    },
    {
        input: [0.2, 0.5, true, (1 / 32)],
        output: [1]
    },
    {
        input: [0.2, 0.5, true, (1 / 32)],
        output: [1]
    },
    {
        input: [0.2, 0.5, true, (1 / 32)],
        output: [1]
    },
    {
        input: [0.2, 0.5, true, (1 / 98)],
        output: [1]
    },
    {
        input: [0.2, 0.5, true, (1 / 54)],
        output: [1]
    },
    {
        input: [0.2, 0.5, true, (1 / 23)],
        output: [1]
    },
    {
        input: [0.2, 0.5, true, (1 / 29)],
        output: [1]
    },
    {
        input: [0.2, 0.5, false, (1 / 4343434)],
        output: [0]
    },
    {
        input: [0.2, 0.5, false, (1 / 123)],
        output: [0]
    },
    {
        input: [0.2, 0.5, false, (1 / 173)],
        output: [0]
    },
    {
        input: [0.2, 0.5, false, (1 / 92)],
        output: [0]
    },
    {
        input: [0.2, 0.5, false, (1 / 45)],
        output: [0]
    },
    {
        input: [0.2, 0.5, false, (1 / 31)],
        output: [0]
    },
    {
        input: [0.2, 0.5, false, (1 / 17)],
        output: [0]
    },
    {
        input: [0.2, 0.5, false, (1 / 103)],
        output: [0]
    },
    {
        input: [0.2, 0.5, false, (1 / 25)],
        output: [0]
    },
    {
        input: [0.2, 0.5, false, (1 / 7843434)],
        output: [0]
    },
    {
        input: [0.2, 0.5, true, (1 / 5543434)],
        output: [0]
    },
    {
        input: [0.2, 0.5, true, (1 / 7863434)],
        output: [0]
    },
    {
        input: [0.2, 0.5, true, (1 / 7883434)],
        output: [0]
    },
    {
        input: [0.2, 0.5, false, (1 / 6343434)],
        output: [0]
    },
    {
        input: [0.2, 0.5, true, (1 / 5343434)],
        output: [0]
    },
    {
        input: [0.2, 0.5, true, (1 / 9343434)],
        output: [0]
    },
    {
        input: [0.2, 0.5, true, (1 / 6843434)],
        output: [0]
    },
    {
        input: [0.2, 0.5, true, (1 / 5643434)],
        output: [0]
    },
    {
        input: [0.2, 0.5, true, (1 / 7243434)],
        output: [0]
    },
    {
        input: [0.2, 0.5, true, (1 / 7443434)],
        output: [0]
    },
    {
        input: [0.2, 0.5, false, (1 / 3343434)],
        output: [0]
    }];
console.log(net2.train(inputData, {
    errorThresh: 0.005, // error threshold to reach
    iterations: 1000000, // maximum training iterations
    log: true, // console.log() progress periodically
    logPeriod: 100000, // number of iterations between logging
    learningRate: 0.3 // learning rate
}));
//console.log(net2.run([0.2, 0.5, false, (1 / 5534343)])); // { white: 0.99, black: 0.002 }
console.log(net2.run([0.2, 0.5, true, (1 / 33)])); // { white: 0.99, black: 0.002 }
*/

/*
net.train([{
        input: {
            "_user": "581b42609c0b1d3268168f81",
            "type": "4",
            "date": "2017-12-19T23:00:00.000Z",
            "amount": {
                "value": 58.58,
                "currency": "EUR"
            },
            "_updated_at": "2018-01-16T17:26:23.702Z",
            "_company_code": "00000",
        },
        output: {
            accepted: 1
        }
    },
    {
        input: {
            "_user": "581b42609c0b1d3268168f81",
            "type": "3",
            "date": "2018-05-01T22:00:00.000Z",
            "description": "Gjg si kfxd",
            "amount": {
                "value": 150,
                "currency": "EUR"
            },
            "_updated_at": "2018-05-02T10:17:06.208Z",
            "_company_code": "00000",
        },
        output: {
            accepted: 1
        }
    },
    {
        input: {
            "_user": "581b42609c0b1d3268168f81",
            "type": "2",
            "date": "2018-05-14T22:00:00.000Z",
            "description": "sfdsfdsfdsf",
            "amount": {
                "value": 4343434,
                "currency": "EUR"
            },
            "_created_at": "2018-05-14T14:01:28.772Z",
            "_updated_at": "2018-05-14T14:01:53.271Z",
            "_company_code": "00000",
        },
        output: {
            accepted: 0
        }
    }]);

var output = net.run({
    "_id": "5d9c94e4ad03127575d634ab",
    "_user": "581b42609c0b1d3268168f81",
    "type": "5",
    "date": "2019-10-08T22:00:00.000Z",
    "amount": {
        "value": 2689898,
        "currency": "EUR"
    },
    "_created_at": "2019-10-08T13:53:40.237Z",
    "_updated_at": "2019-10-08T13:53:40.237Z",
    "_company_code": "00000",
    "__v": 0,
    "images": []
}); // { white: 0.99, black: 0.002 }

*/

/*
var net3 = new brain.NeuralNetwork();
console.log(net3.train([{
        input: [0, 0],
        output: {
            ok: 0,
            xx: 1
        }
    },
    {
        input: [0, 1],
        output: {
            ok: 1,
            xx: 1
        }
    },
    {
        input: [1, 0],
        output: {
            ok: 1,
            xx: 1
        }
    },
    {
        input: [1, 1],
        output: {
            ok: 0,
            xx: 1
        }
    }]));

console.log(net3.run([0.2, 0])); // [0.987]
*/
