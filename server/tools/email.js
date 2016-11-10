var email = require('mailer');
var Constants = require('../tools/constants.js');

var Email = {};
Email.sendValidation = function(email_address, user, company_code) {
    email.send({
        host: Constants.EmailHost,
        port: Constants.EmailPort,
        ssl: Constants.EmailSSL,
        domain: Constants.EmailDomain,
        to: email_address,
        from: Constants.EmailUserName,
        subject: 'Registration validation for App1',
        text: 'Automatic message from App1',
        html: '<span>Dear customer, thank-you for registering with our website, your initial password is: ' +
            Constants.InitialPassword +
            '</span><br><span>Please validate your email by clicking on the following link</span><br><a href="http://' +
            Constants.WebAddress + '/authentication/validate?user=' + user + '&code=' +
            company_code + '">Validate registration</a>',
        authentication: Constants.EmailAuthentication,
        username: Constants.EmailUserName,
        password: Constants.EmailPassword
    }, function(err, result) {
        //if (err) return next(err);
    });
}
module.exports = Email;
