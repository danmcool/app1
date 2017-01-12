#!/usr/bin/env node

var http = require('http');
http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(80);

var app = require('./app');
var fs = require('fs');
var https = require('https');
var ssl = {
    key: fs.readFileSync('./server/ssl/app1-key.pem', 'utf8'),
    cert: fs.readFileSync('./server/ssl/app1-cert.crt', 'utf8'),
    ca: fs.readFileSync('./server/ssl/app1-intermediate-cert.crt', 'utf8')
};
var server = https.createServer(ssl, app);
var port = 443;

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function onError(error) {
  if (error.syscall != 'listen') {
    throw error;
  }
  switch (error.code) {
    case 'EACCES':
      console.error('Port ' + port + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error('Port ' + port + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  var addr = server.address();
  console.info('Listening on port ' + addr.port);
}
