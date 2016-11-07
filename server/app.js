// dependencies
var express = require('express');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//var expressSession = require('express-session');
var mongoose = require('mongoose');
var path = require('path');

// mongoose
mongoose.connect('mongodb://localhost/apps');

// require routes
var metadata = require('./routes/metadata');
var data = require('./routes/data');
var file = require('./routes/file');
var client = require('./routes/client');
var authentication = require('./routes/authentication');

// create instance of express
var app = express();

// user schema/model
var Session = require('./tools/session');

// define middleware
app.use(express.static(path.join(__dirname, '../client')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());

function allowedPath(req) {
    if (req.path.startsWith("/data") || req.path.startsWith("/api") || req.path.startsWith("/file") || req.path.startsWith("/client")) {
        return false;
    }
    return true;
}

function hasPermission(req) {
    if (Session.isActive(req.cookies.app1_token)) {
        return true;
    } else {
        return false;
    }
}

app.use(function (req, res, next) {
    if (allowedPath(req) || hasPermission(req)) {
        next();
    } else {
        return res.status(401).json({
            err: "Path not allowed or no permission to access!"
        });
    }
});

// routes
app.use('/data', data);
app.use('/file', file);
app.use('/client', client);
app.use('/authentication', authentication);
app.use('/api', metadata);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '../client')));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '../client', 'index.html'));
});
app.get('/admin', function (req, res) {
    res.sendFile(path.join(__dirname, '../client', 'index_admin.html'));
});

// error hndlers
app.use(function (req, res, next) {
    var err = new Error('Not Found');
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

module.exports = app;
