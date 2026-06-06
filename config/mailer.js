const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
    }
});

// ✅ اختبار الاتصال
transporter.verify((err, success) => {
    if (err) console.log('Email error:', err.message);
    else console.log('Email ready ✅');
});

module.exports = transporter;