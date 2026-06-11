const axios = require('axios');

async function sendMail({ to, subject, html }) {
  try {
    await axios.post('https://api.brevo.com/v3/smtp/email', {
      sender: { name: 'ملاعبي ⚽', email: 'bookingsstadiums@gmail.com' },
      to: [{ email: to }],
      subject,
      htmlContent: html
    }, {
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Email sent to:', to);
  } catch (err) {
    console.log('❌ Email error:', err.response?.data || err.message);
  }
}

module.exports = { sendMail };