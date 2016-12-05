var email = require('mailer');
var Constants = require('../tools/constants.js');

var Email = {};
Email.send = function(email_address, cc_email_address, subject, text, html) {
    email.send({
        host: Constants.EmailHost,
        port: Constants.EmailPort,
        ssl: Constants.EmailSSL,
        domain: Constants.EmailDomain,
        to: email_address,
        cc: cc_email_address,
        from: Constants.EmailUserName,
        subject: subject,
        text: text,
        html: html,
        authentication: Constants.EmailAuthentication,
        username: Constants.EmailUserName,
        password: Constants.EmailPassword
    }, function(err, result) {
        //if (err) return next(err);
    });
}

Email.sendValidation = function(email_address, user, company_code) {
    Email.send(
        email_address,
        '',
        'Registration validation for App1',
        'Automatic message from App1',
        '<span>Dear customer, thank-you for registering with our website, your initial password is: ' +
        Constants.InitialPassword +
        '</span><br><span>Please validate your email by clicking on the following link</span><br><a href="http://' +
        Constants.WebAddress + '/authentication/validate?user=' + user + '&code=' +
        company_code + '">Validate registration</a>');
}

Email.sendShare = function(email_address, cc_email_address, form_id, datamodel_id, data_id, profile_id) {
    Email.send(
        email_address,
        cc_email_address,
        'App1 - Shared form',
        'Automatic message from App1',
        '<span>A form has been shared with you, to access it please click on the following link:</span><br><a href="http://' +
        Constants.WebAddress + '/authentication/open?form_id=' + form_id + '&datamodel_id=' +
        datamodel_id + '&data_id=' +
        data_id +
        '&profile_id=' +
        profile_id + '">Open form</a>');
}

module.exports = Email;
