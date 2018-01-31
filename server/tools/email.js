var email = require('mailer');
var nodemailer = require('nodemailer');
var ical = require('ical-generator');
var Constants = require('../tools/constants.js');

var Email = {};

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: Constants.EmailUserName,
        pass: Constants.EmailPassword
    },
    logger: true, // log to console
    debug: true // include SMTP traffic in the logs
});

Email.send2 = function (email_address, cc_email_address, subject, text, html, ical_content) {
    var message = {
        from: Constants.EmailUserName,
        to: email_address,
        subject: subject,
        text: text,
        icalEvent: {
            method: 'request',
            // content can be a string, a buffer or a stream
            // alternatively you could use `path` that points to a file or an url
            content: ical_content
        }
    }

    console.log('Sending Mail');
    transporter.sendMail(message, function (error, info) {
        if (error) {
            console.log('Error occurred');
            console.log(error.message);
            return;
        }
        console.log('Message sent successfully!');
        console.log('Server responded with "%s"', info.response);
    });
}

Email.send = function (email_address, cc_email_address, subject, text, html) {
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
    }, function (err, result) {
        //if (err) return next(err);
    });
}

Email.sendValidation = function (emailAddress, user, companyCode, newPassword) {
    Email.send(
        emailAddress,
        '',
        'Registration validation for App1',
        'Automatic message from App1',
        '<span><p>Dear customer, thank-you for registering with our website, your initial password is: ' +
        newPassword +
        '</p></span><br><span><p><b>Please validate your email by clicking on the following link</b></p></span><br><a href="http://' +
        Constants.WebAddress + '/authentication/validate?user=' + user + '&code=' +
        companyCode + '"><p><b>Validate registration</b></p></a>');
}

Email.sendSAMLNewUser = function (email_address, user, company_code) {
    Email.send(
        email_address,
        '',
        'Registration validation for App1',
        'Automatic message from App1',
        '<span><p>Dear user, thank-you for registering with our website, your initial password is: ' +
        Constants.InitialPassword +
        '</p></span>');
}

Email.sendShare = function (email_address, cc_email_address, data_id, profile_id) {
    Email.send(
        email_address,
        cc_email_address,
        'App1 - Shared form',
        'Automatic message from App1',
        '<p>A form has been shared with you, to access it please click on the following link:</p><br><a href="http://' +
        Constants.WebAddress + '/client/open?form_id=' + form_id + '&datamodel_id=' +
        datamodel_id + '&data_id=' +
        data_id +
        '&profile_id=' +
        profile_id + '">Open form</a><br><br><p>You are required to register on App1 in order to access the form!</p>' +
        '<br><a href="http://' + Constants.WebAddress + '">App1</a>');
}

Email.sendSharePublic = function (email_address, profile_id, app_name, profile_name) {
    Email.send(
        email_address, '', 'App1 - Shared workflow',
        'Automatic message from App1',
        '<span><p>Dear customer, please use the following link to share the ' + app_name + ' application`s workflow, using public profile ' + profile_name + ' :</p></span><br><a href="http://' + Constants.WebAddress + '/authentication/open?pid=' + profile_id + '">http://' +
        Constants.WebAddress + '/authentication/open?pid=' + profile_id + '</a>');
}

Email.sendCalendar = function (email_address, projectName, startDate, endDate, userName) {
    try {
        var endDateNextDay = new Date(endDate);
        endDateNextDay.setMilliseconds(endDateNextDay.getMilliseconds() + 24 * 60 * 60 * 1000 - 1);
        cal = ical({
            domain: Constants.WebAddress,
            prodId: '//App1//calendar//EN',
            events: [{
                start: new Date(startDate),
                end: endDateNextDay,
                timestamp: new Date(),
                summary: projectName,
                organizer: userName + '<' + email_address + '>'
        }]
        });

        Email.send2(
            email_address,
            '',
            projectName,
            'Dear ' + userName + ', this is the project invitation for ' + projectName + ' please add this to your calendar!',
            '<html><body><p>Dear ' + userName + ', this is the project invitation for ' + projectName + ' please add this to your calendar.</p></body></html>',
            new Buffer(cal.toString()).toString()
        );
    } catch (e) {
        console.log(e);
    }
}

module.exports = Email;
