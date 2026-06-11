const db = require("../config/db")
const { sendBookingEmail, confirmedEmail, rejectedEmail } = require("../config/sendEmail")
 
// add new booking
exports.createBooking = async (req, res) => {
  try {
    const { field_id, date, time_slot, duration } = req.body
    const user_id = req.user.id
    const [existing] = await db.query(
      "SELECT id FROM bookings WHERE field_id=? AND date=? AND time_slot=? AND status != 'cancelled'",
      [field_id, date, time_slot]
    )
    if (existing.length > 0) return res.status(400).json({ message: "هذا الوقت محجوز مسبقاً" })
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
 
    const [rows] = await db.query(
      `SELECT bookings.*, fields.name AS field_name,
       users.email AS player_email, users.name AS player_name
       FROM bookings
       JOIN fields ON bookings.field_id = fields.id
       JOIN users ON bookings.user_id = users.id
       WHERE bookings.id = ?`, [id]
    )
 
    if (rows.length > 0) {
      const b = rows[0]
      const date = String(b.date).split("T")[0]
      console.log("Sending email to:", b.player_email, "status:", status)
      if (status === "confirmed") {
        const date = String(b.date).split("T")[0]
        await sendBookingEmail(b.player_email, "✅ تم قبول حجزك في ملاعبي", confirmedEmail(b.player_name, b.field_name, date, b.time_slot))
      } else if (status === "rejected") {
        await sendBookingEmail(b.player_email, "❌ تم رفض حجزك في ملاعبي", rejectedEmail(b.player_name, b.field_name, date, b.time_slot))
      }
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
    const [booking] = await db.query("SELECT id FROM bookings WHERE id=? AND user_id=?", [id, user_id])
    if (booking.length === 0) return res.status(404).json({ message: "الحجز غير موجود" })
    await db.query("UPDATE bookings SET status='cancelled' WHERE id=?", [id])
    res.json({ success: true, message: "تم إلغاء الحجز" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}