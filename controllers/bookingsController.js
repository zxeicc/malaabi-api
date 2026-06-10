const db = require("../config/db")
const nodemailer = require("nodemailer")
 
// email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})
 
// add new booking
exports.createBooking = async (req, res) => {
  try {
    const { field_id, date, time_slot, duration } = req.body
    const user_id = req.user.id
 
    const [existing] = await db.query(
      "SELECT id FROM bookings WHERE field_id=? AND date=? AND time_slot=? AND status != 'cancelled'",
      [field_id, date, time_slot]
    )
    if (existing.length > 0) {
      return res.status(400).json({ message: "هذا الوقت محجوز مسبقاً" })
    }
 
    const [field] = await db.query("SELECT price_per_hour FROM fields WHERE id=?", [field_id])
    const total = field[0].price_per_hour * duration
 
    const [result] = await db.query(
      "INSERT INTO bookings(field_id, user_id, date, time_slot, duration, total) VALUES(?,?,?,?,?,?)",
      [field_id, user_id, date, time_slot, duration, total]
    )
 
    res.status(201).json({ message: "تم الحجز بنجاح", id: result.insertId })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
 
// get bookings for player
exports.getMyBookings = async (req, res) => {
  try {
    const user_id = req.user.id
    const [bookings] = await db.query(
      "SELECT bookings.*, fields.name, fields.location FROM bookings JOIN fields ON bookings.field_id = fields.id WHERE bookings.user_id=?",
      [user_id]
    )
    res.json({ success: true, data: bookings })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
 
// get all bookings for admin
exports.getAllBookings = async (req, res) => {
  try {
    const [bookings] = await db.query(
      "SELECT bookings.*, fields.name, fields.location, users.name AS player_name FROM bookings JOIN fields ON bookings.field_id = fields.id JOIN users ON bookings.user_id = users.id"
    )
    res.json({ success: true, data: bookings })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
 
// change booking status + send email
exports.updateBookingStatus = async (req, res) => {
  try {
    const status = req.body.status
    const id = req.params.id
 
    await db.query("UPDATE bookings SET status=? WHERE id=?", [status, id])
 
    // get booking details + player email
    const [rows] = await db.query(
      `SELECT bookings.*, fields.name AS field_name, fields.location,
       users.email AS player_email, users.name AS player_name
       FROM bookings
       JOIN fields ON bookings.field_id = fields.id
       JOIN users ON bookings.user_id = users.id
       WHERE bookings.id = ?`,
      [id]
    )
 
    if (rows.length > 0) {
      const booking = rows[0]
      const isConfirmed = status === "confirmed"
 
      const subject = isConfirmed
        ? "✅ تم قبول حجزك في ملاعبي"
        : "❌ تم رفض حجزك في ملاعبي"
 
      const html = isConfirmed
        ? `
          <div style="font-family:Arial,sans-serif;direction:rtl;max-width:500px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
            <div style="background:linear-gradient(135deg,#16a34a,#14532d);padding:24px;text-align:center">
              <h1 style="color:white;margin:0;font-size:24px">⚽ ملاعبي</h1>
            </div>
            <div style="padding:24px">
              <h2 style="color:#16a34a">✅ تم قبول حجزك!</h2>
              <p style="color:#374151">مرحباً <strong>${booking.player_name}</strong>،</p>
              <p style="color:#374151">يسعدنا إبلاغك بأن حجزك تم قبوله بنجاح.</p>
              <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:16px 0">
                <p style="margin:6px 0;color:#374151">🏟️ <strong>الملعب:</strong> ${booking.field_name}</p>
                <p style="margin:6px 0;color:#374151">📍 <strong>الموقع:</strong> ${booking.location}</p>
                <p style="margin:6px 0;color:#374151">📅 <strong>التاريخ:</strong> ${String(booking.date).split("T")[0]}</p>
                <p style="margin:6px 0;color:#374151">⏰ <strong>الوقت:</strong> ${booking.time_slot}</p>
                <p style="margin:6px 0;color:#374151">⏱ <strong>المدة:</strong> ${booking.duration} ساعة</p>
                <p style="margin:6px 0;color:#16a34a;font-size:18px"><strong>💰 الإجمالي: ${booking.total} ر.س</strong></p>
              </div>
              <p style="color:#6b7280;font-size:13px">شكراً لاستخدامك منصة ملاعبي ⚽</p>
            </div>
          </div>`
        : `
          <div style="font-family:Arial,sans-serif;direction:rtl;max-width:500px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
            <div style="background:linear-gradient(135deg,#16a34a,#14532d);padding:24px;text-align:center">
              <h1 style="color:white;margin:0;font-size:24px">⚽ ملاعبي</h1>
            </div>
            <div style="padding:24px">
              <h2 style="color:#dc2626">❌ تم رفض حجزك</h2>
              <p style="color:#374151">مرحباً <strong>${booking.player_name}</strong>،</p>
              <p style="color:#374151">نأسف لإبلاغك بأن حجزك في <strong>${booking.field_name}</strong> بتاريخ <strong>${String(booking.date).split("T")[0]}</strong> الساعة <strong>${booking.time_slot}</strong> تم رفضه.</p>
              <p style="color:#374151">يمكنك اختيار وقت آخر والمحاولة مجدداً.</p>
              <p style="color:#6b7280;font-size:13px">شكراً لاستخدامك منصة ملاعبي ⚽</p>
            </div>
          </div>`
 
      // send email (don't block response if fails)
      transporter.sendMail({
        from: `"ملاعبي ⚽" <${process.env.EMAIL_USER}>`,
        to: booking.player_email,
        subject,
        html
      }).catch(err => console.error("Email error:", err.message))
    }
 
    res.json({ success: true, message: "تم تحديث الحالة" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
 
// cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const id = req.params.id
    const user_id = req.user.id
 
    const [booking] = await db.query(
      "SELECT id FROM bookings WHERE id=? AND user_id=?",
      [id, user_id]
    )
    if (booking.length === 0) {
      return res.status(404).json({ message: "الحجز غير موجود" })
    }
 
    await db.query("UPDATE bookings SET status='cancelled' WHERE id=?", [id])
    res.json({ success: true, message: "تم إلغاء الحجز" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}