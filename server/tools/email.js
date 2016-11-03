var email = require('mailer');
var Constants = require('../tools/constants.js');

var Email = {};
Email.sendValidation = function(email_address, user, company_code) {
    email.send({
        host: 'smtp.gmail.com',
        port: '465',
        ssl: true,
        domain: 'gmail.com',
        to: email_address,
        from: 'app1.noreply@gmail.com',
        subject: 'Registration validation for App1',
        text: 'Automatic message from App1',
        html: '<span>Dear customer, thank-you for registering with our website, your initial password is: ' +
            Constants.InitialPassword +
            '</span><br><span>Please validate your email by clicking on the following link</span><br><a href="http://' +
            Constants.WebAddress + '/authentication/validate?user=' + user + '&code=' +
            company_code + '">Validate registration</a>',
        authentication: 'login',
        username: 'app1.noreply@gmail.com',
        password: 'Admin;app1'
    }, function(err, result) {
        //if (err) return next(err);
    });
}
module.exports = Email;
