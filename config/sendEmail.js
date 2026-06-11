/*const transporter = require('./mailer');

async function sendBookingEmail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: `"ملاعبي" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log('Email sent to:', to);
  } catch (err) {
    console.log('Email failed:', err.message);
  }
}

// إيميل قبول الحجز
function confirmedEmail(playerName, fieldName, date, timeSlot) {
    return `
    <div style="font-family: Arial; direction: rtl; padding: 20px;">
        <h2 style="color: #16a34a;">✅ تم قبول حجزك!</h2>
        <p>مرحباً <strong>${playerName}</strong></p>
        <p>تم قبول حجزك في <strong>${fieldName}</strong></p>
        <p>📅 التاريخ: <strong>${date}</strong></p>
        <p>⏰ الوقت: <strong>${timeSlot}</strong></p>
        <p style="color: #16a34a;">نراك قريباً! ⚽</p>
    </div>
    `;
}

// إيميل رفض الحجز
function rejectedEmail(playerName, fieldName, date, timeSlot) {
    return `
    <div style="font-family: Arial; direction: rtl; padding: 20px;">
        <h2 style="color: #dc2626;">❌ تم رفض حجزك</h2>
        <p>مرحباً <strong>${playerName}</strong></p>
        <p>للأسف تم رفض حجزك في <strong>${fieldName}</strong></p>
        <p>📅 التاريخ: <strong>${date}</strong></p>
        <p>⏰ الوقت: <strong>${timeSlot}</strong></p>
        <p>يمكنك الحجز في وقت آخر 🙏</p>
    </div>
    `;
}

module.exports = { sendBookingEmail, confirmedEmail, rejectedEmail };*/