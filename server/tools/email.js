var nodemailer = require('nodemailer');
var ical = require('ical-generator');
var Constants = require('../tools/constants.js');

var Email = {};

var transporter = nodemailer.createTransport({
    host: 'ssl0.ovh.net',
    port: 465,
    secure: true,
    //service: 'Gmail',
    auth: {
        user: process.env.APP1_EMAIL_USERNAME,
        pass: process.env.APP1_EMAIL_PASSWORD
    },
    //debug: true,
    logger: false
});

var EmailUserName = process.env.APP1_EMAIL_USERNAME;

Email.send2 = function (emailAddress, ccEmailAddress, subject, text, html, ical_content) {
    var message = {
        from: EmailUserName,
        to: emailAddress,
        cc: ccEmailAddress,
        subject: subject,
        text: text,
        html: html,
        icalEvent: {
            method: 'request',
            content: ical_content
        }
    }
    transporter.sendMail(message, function (error, info) {
        if (error) {
            console.log('Error occurred' + error.message);
            return;
        }
    });
}

Email.sendAttachments = function (emailAddress, ccEmailAddress, subject, html, fileName, attachment) {
    var message = {
        from: EmailUserName,
        to: emailAddress,
        cc: ccEmailAddress,
        subject: subject,
        html: html,
        attachments : [ {
            filename: fileName,
            content: attachment,
            encoding: 'base64'
            }
        ]
    }
    transporter.sendMail(message, function (error, info) {
        if (error) {
            console.log('Error occurred' + error.message);
            return;
        }
    });
}

Email.send = function (emailAddress, ccEmailAddress, subject, text, html) {
    transporter.sendMail({
        from: EmailUserName,
        to: emailAddress,
        cc: ccEmailAddress,
        subject: subject,
        text: text,
        html: html,
    }, function (err, result) {});
}

Email.sendValidation = function (emailAddress, user, companyCode, newPassword) {
    Email.send(
        emailAddress,
        '',
        'Registration validation for App1',
        'Automatic message from App1',
        '<span><p>Dear customer, thank-you for registering with our website, your initial password is: ' +
        newPassword +
        '</p></span><br><span><p><b>Please validate your email by clicking on the following link</b></p></span><br><a href="https://' +
        process.env.APP1_SERVER_NAME + '/authentication/validate?user=' + user + '&code=' +
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

Email.sendShare = function (email_address, cc_email_address, profile_id, message) {
    Email.send(
        email_address, cc_email_address, 'App1 - Shared workflow',
        'Automatic message from App1',
        message + '<br><a href="https://' + process.env.APP1_SERVER_NAME + '/authentication/open?pid=' + profile_id + '">https://' +
        process.env.APP1_SERVER_NAME + '/authentication/open?pid=' + profile_id + '</a>');
}
Email.sendSharePublic = function (email_address, profile_id, app_name, profile_name) {
    Email.send(
        email_address, '', 'App1 - Shared workflow',
        'Automatic message from App1',
        '<span><p>Dear customer,</p><br><p>Please use the following link to share the ' + app_name + ' application`s workflow, using public profile ' + profile_name + ' :</p></span><br><a href="https://' + process.env.APP1_SERVER_NAME + '/authentication/open?pid=' + profile_id + '">https://' +
        process.env.APP1_SERVER_NAME + '/authentication/open?pid=' + profile_id + '</a>');
}
Email.sendSharePrivate = function (email_address, profile_id, app_name, profile_name) {
    Email.send(
        email_address, '', 'App1 - Shared workflow',
        'Automatic message from App1',
        '<span><p>Dear customer,</p><br><p>Please use the following link to share the ' + app_name + ' application`s workflow, using private profile ' + profile_name + ' :</p></span><br><a href="https://' + process.env.APP1_SERVER_NAME + '/authentication/open?pid=' + profile_id + '">https://' +
        process.env.APP1_SERVER_NAME + '/authentication/open?pid=' + profile_id + '</a>');
}

Email.sendCalendar = function (email_address, projectName, startDate, endDate, allDay, userName) {
    try {
        cal = ical({
            domain: process.env.APP1_SERVER_NAME,
            prodId: '//App1//calendar//EN',
            events: [{
                start: new Date(startDate),
                end: new Date(endDate),
                allDay: allDay,
                timestamp: new Date(),
                summary: projectName,
                organizer: userName + '<' + email_address + '>'
            }]
        });

        Email.send2(
            email_address,
            '',
            projectName,
            'Dear ' + userName + ', this is the calendar invitation for ' + projectName + ', please add this to your calendar!',
            '<html><body><p>Dear ' + userName + ', this is the calendar invitation for ' + projectName + ', please add this to your calendar.</p></body></html>',
            new Buffer(cal.toString()).toString()
        );
    } catch (e) {
        console.log('Calendar error ' + e);
    }
}

Email.prepareMessage = function (text, userData) {
    if (!text) return '';
    return text.replace(/@@user/g, ((userData.firstname ? userData.firstname : '') + ' ' + (userData.lastname ? userData.lastname : ''))).replace(/@@company/g, (userData.company && userData.company.name ? userData.company.name : ''));
}


module.exports = Email;
