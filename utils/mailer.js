// mailer.js

// require our mailgun dependencies
const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');

// auth with our mailgun API key and domain
const auth = {
  auth: {
    api_key: process.env.MAILGUN_API_KEY,
    domain: process.env.EMAIL_DOMAIN
  }
}

// create a mailer
const nodemailerMailgun = nodemailer.createTransport(mg(auth));

// Debug logging for email configuration
console.log('🔧 Mailer Configuration:');
console.log('API Key loaded:', process.env.MAILGUN_API_KEY ? 'Yes' : 'No');
console.log('Email Domain:', process.env.EMAIL_DOMAIN);

// export our send mail function
module.exports.sendMail = (user, req, res) => {
    // send an email to the user's email with a provided template
    nodemailerMailgun.sendMail({
        from: `no-reply@${process.env.EMAIL_DOMAIN}`,
        to: user.email, // An array if you have multiple recipients.
        subject: 'Pet Purchased!',
        template: {
            name: 'email.handlebars',
            engine: 'handlebars',
            context: user
        }
    // One mail is sent, redirect to the purchased pet's page
    }).then(info => {
        console.log('✅ SUCCESS! Email sent successfully!');
        console.log('Response: ' + info);
        res.redirect(`/pets/${req.params.id}`);
    // Catch error and redirect to the purchased pet's page
    }).catch(err => {
        console.log('❌ EMAIL ERROR Details:');
        console.log('Error message:', err.message);
        console.log('Error code:', err.code);
        console.log('Full error:', err);
        res.redirect(`/pets/${req.params.id}`);
    });
}
