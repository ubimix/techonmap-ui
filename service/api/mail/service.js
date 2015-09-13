var _ = require('underscore');
var Mosaic = require('mosaic-commons');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

module.exports = {
    hello : rest('/hello', 'GET', function(params) {
        return 'Hello';
    }),
    save : rest('/save/*id', 'PUT', function(resource) {
        console.log('SAVED RESOURCE: ', resource);
        return resource;
    }),
    sendMail : rest('/send', 'POST', function(params) {
        var message = {
            user : {
                name : params.name,
                email : params.email
            },
            subject : params.reason,
            content : params.content
        };
        console.log('>>>', message);
        var transporter = nodemailer.createTransport(smtpTransport({
            host : 'localhost',
            port : 25
        }));

        // setup e-mail data with unicode symbols
        var mailOptions = {
            from : message.user.name + ' <' + message.user.email + '>',
            to : 'slauriere@ubimix.com',
            subject : message.subject,
            text : message.content
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Message sent: ' + info.response);
            }
        });

        return {
            result : 'ok'
        };
    })
};

/**
 * This utility function "annotates" the specified object methods by the
 * corresponding REST paths and HTTP methods.
 */
function rest(path, http, method) {
    method.http = http.toLowerCase();
    method.path = path;
    return method;
}
