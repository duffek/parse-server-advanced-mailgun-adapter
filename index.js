var MailGun = require('mailgun-es6');


// fromAddress: can be in simple or complex styling
//   'who@domain.com' or 'Excited User <me@samples.mailgun.org>'
// domain: must be the exact domain from Mailgun Settings

var SimpleMailgunAdapter = mailOptions => {
    if (!mailOptions || !mailOptions.privateApiKey || !mailOptions.domain || !mailOptions.fromAddress) {
        throw 'AdvancedMailgunAdapter requires an API key, domain, and fromAddress.';
    }

    // setup Verifing Email subject and body
    mailOptions.verifyEmailSubject = mailOptions.verifyEmailSubject || 'Please verify your e-mail for %appname%';
    mailOptions.verifyEmailBody = mailOptions.verifyEmailBody || '\nYou are being asked to confirm the e-mail address %email% for %appname%.\n\n' +
                                                                 'To confirm the email please click this link:\n%link%\n\n' +
                                                                 'If you did not request this, please reach out to %appname% or ignore this email.';

    // setup Forgotten Password Email subject and body
    mailOptions.forgottenEmailSubject = mailOptions.forgottenEmailSubject || 'Password Reset Request for %appname%';
    mailOptions.forgottenEmailBody = mailOptions.forgottenEmailBody || '\nYou forgot your password for %appname%? No problem, it happens all the time!\n\n' +
                                                                       'Simply click here to reset your password:\n%link%\n\n' +
                                                                       'If you did not request this, please reach out to %appname% or ignore this email.';

    // initialize mailGun
    var mailGun = new MailGun({
        privateApi: mailOptions.privateApiKey,        
        domainName: mailOptions.domain
    });

    
    function getRecipient(user) {
        return user.get("email") || user.get('username')
    }


    var sendVerificationEmail = options => {
        var mailGunOptions = {
            to: [ getRecipient(options.user) ],
            from: mailOptions.fromAddress,
            subject: fillVariables(mailOptions.verifyEmailSubject, options),
        }

        if (mailOptions.verifyEmailBodyHTML) {
            mailGunOptions = Object.assign({}, mailGunOptions, { html: fillVariables(mailOptions.verifyEmailBodyHTML, options) });
        } else {
            mailGunOptions = Object.assign({}, mailGunOptions, { text: fillVariables(mailOptions.verifyEmailBody, options)});
        }
        
        return new Promise((resolve, reject) => {
            mailGun.sendEmail(mailGunOptions)
                .then(msg => {
                    console.log(msg);
                    resolve(msg);
                }) // logs response data
                .catch(err => {
                    console.log(err);
                    reject(err);
                }); // logs any error
        });
    }


    var sendPasswordResetEmail = options => {
        var mailGunOptions = {
            to: [ getRecipient(options.user) ],
            from: mailOptions.fromAddress,
            subject: fillVariables(mailOptions.forgottenEmailSubject, options),
        }

        if (mailOptions.forgottenEmailBodyHTML) {
            mailGunOptions = Object.assign({}, mailGunOptions, { html: fillVariables(mailOptions.forgottenEmailBodyHTML, options) });
        } else {
            mailGunOptions = Object.assign({}, mailGunOptions, { text: fillVariables(mailOptions.forgottenEmailBody, options)});
        }
        
        return new Promise((resolve, reject) => {
            mailGun.sendEmail(mailGunOptions)
                .then(msg => {
                    console.log(msg);
                    resolve(msg);
                }) // logs response data
                .catch(err => {
                    console.log(err);
                    reject(err);
                }); // logs any error
        });    
    }


    var sendMail = mail => {
        var mailGunOptions = {
            to: [ mail.to ],
            from: mailOptions.fromAddress,
            subject: mail.subject,
            html: mail.html,
            text: mail.text
        }

        return new Promise((resolve, reject) => {
            mailGun.sendEmail(mailGunOptions)
                .then(msg => {
                    console.log(msg);
                    resolve(msg);
                }) // logs response data
                .catch(err => {
                    console.log(err);
                    reject(err);
                }); // logs any error
        });  
    }

    function escapeRegExp(str) {
        return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    }
      
    function replaceAll(str, find, replace) {
        return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
    }
      
    function fillVariables(text, options) {
        text = replaceAll(text, "%username%", options.user.get("username"));
        text = replaceAll(text, "%email%", options.user.get("email"));
        text = replaceAll(text, "%appname%", options.appName);
        text = replaceAll(text, "%link%", options.link);
        return text;
    }

    return Object.freeze({
        sendVerificationEmail: sendVerificationEmail,
        sendPasswordResetEmail: sendPasswordResetEmail,
        sendMail: sendMail
    });
}

module.exports = SimpleMailgunAdapter

