const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS
  }
});

setTimeout(() => {
  transporter.verify((err, success) => {
    if (err) console.log('Email error:', err.message);
    else console.log('Email ready ✅');
  });
}, 3000);

module.exports = transporter;