// dependencies
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var path = require('path');

mongoose.Promise = global.Promise;

// connect to mongo db -> apps is the name of app1 data
var mongodbUri = 'mongodb://app1:' + process.env.APP1_DB_PASSWORD + '@' + process.env.APP1_DB_ADDRESS + ':' + process.env.APP1_DB_PORT + '/apps';
mongoose.connect(mongodbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// require routes
var api = require('./routes/api.js');
var data = require('./routes/data.js');
var file = require('./routes/file.js');
var client = require('./routes/client.js');
var design = require('./routes/design.js');
var authentication = require('./routes/authentication.js');

// init metadata and sessions
require('./tools/init_objects.js');

// create instance of express
var app = express();
//app.use(compression())

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var SessionCache = require('./tools/session_cache.js');
var Constants = require('./tools/constants.js');

// define middleware
app.use(express.static(path.join(__dirname, '../client')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());

function allowedPath(req) {
    if (req.path.startsWith('/client') || req.path.startsWith('/api')) {
        return false;
    }
    return true;
}

function nocache(req, res) {
    /*    if (req.path.startsWith('/data') || req.path.startsWith('/api') || req.path.startsWith('/file') || req.path.startsWith('/client') || req.path.startsWith('/authentication')) {
            res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
            res.header('Expires', '-1');
            res.header('Pragma', 'no-cache');
        }*/
}

app.use(function (req, res, next) {
    if (allowedPath(req)) {
        nocache(req, res);
        next();
    } else {
        SessionCache.isActive(req, function (active) {
            if (active) {
                nocache(req, res);
                next();
            } else {
                return res.status(401).redirect('/');
            }
        });
    }
});

// routes
app.use('/authentication', authentication);
app.use('/client/design', design);
app.use('/client/data', data);
app.use('/client/file', file);
app.use('/client', client);
app.use('/api', api);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '../client')));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '../client', 'register.html'));
});

app.get('/admin', function (req, res) {
    res.sendFile(path.join(__dirname, '../client', 'index_admin.html'));
});
// error hndlers
app.use(function (req, res, next) {
    var err = new Error('Not Found URL:' + req.path);
    err.status = 404;
    next(err);
});

app.use(function (err, req, res) {
    res.status(err.status || 500);
    res.end(JSON.stringify({
        message: err.message,
        error: {}
    }));
});

//process.on('uncaughtException', function (err) {
//    console.log(err);
//});

module.exports = app;
