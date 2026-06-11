const db = require('../config/db');

// GET — جلب كل الملاعب
const getFields = async (req, res) => {
  try {
    const [fields] = await db.query('SELECT * FROM fields');

    for (let field of fields) {
      const [slots] = await db.query(
        'SELECT time_slot FROM field_time_slots WHERE field_id = ?',
        [field.id]
      );
      field.timeSlots = slots.map(s => s.time_slot);
    }

    res.json({ success: true, data: fields });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST — إضافة ملعب
// POST
const createField = async (req, res) => {
  const { name, location, price_per_hour, type, capacity, rating, available, color, timeSlots, image } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO fields (name, location, price_per_hour, type, capacity, rating, available, color, image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, location, price_per_hour, type, capacity, rating ?? 4.5, available ?? true, color, image || null]
    );

    const fieldId = result.insertId;
    if (timeSlots && timeSlots.length > 0) {
      const slots = typeof timeSlots === 'string' ? JSON.parse(timeSlots) : timeSlots;
      const slotValues = slots.map(t => [fieldId, t]);
      await db.query('INSERT INTO field_time_slots (field_id, time_slot) VALUES ?', [slotValues]);
    }

    res.status(201).json({ success: true, message: 'تم إضافة الملعب', id: fieldId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT
const updateField = async (req, res) => {
  const { name, location, price_per_hour, type, capacity, rating, available, color, timeSlots, image } = req.body;
  try {
    await db.query(
      `UPDATE fields SET name=?, location=?, price_per_hour=?, type=?, capacity=?,
      rating=?, available=?, color=?, image=? WHERE id=?`,
      [name, location, price_per_hour, type, capacity, rating, available, color, image || null, req.params.id]
    );

    if (timeSlots) {
      const slots = typeof timeSlots === 'string' ? JSON.parse(timeSlots) : timeSlots;
      await db.query('DELETE FROM field_time_slots WHERE field_id = ?', [req.params.id]);
      if (slots.length > 0) {
        const slotValues = slots.map(t => [req.params.id, t]);
        await db.query('INSERT INTO field_time_slots (field_id, time_slot) VALUES ?', [slotValues]);
      }
    }

    res.json({ success: true, message: 'تم تعديل الملعب' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT — تعديل ملعب
/*const updateField = async (req, res) => {
  const { name, location, price_per_hour, type, capacity, rating, available, color, timeSlots } = req.body;
  try {
    await db.query(
      `UPDATE fields SET name=?, location=?, price_per_hour=?, type=?, capacity=?,
      rating=?, available=?, color=? WHERE id=?`,
      [name, location, price_per_hour, type, capacity, rating, available, color, req.params.id]
    );

    if (timeSlots) {
      await db.query('DELETE FROM field_time_slots WHERE field_id = ?', [req.params.id]);
      if (timeSlots.length > 0) {
        const slotValues = timeSlots.map(t => [req.params.id, t]);
        await db.query('INSERT INTO field_time_slots (field_id, time_slot) VALUES ?', [slotValues]);
      }
    }

    res.json({ success: true, message: 'تم تعديل الملعب' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};*/

// DELETE — حذف ملعب
const deleteField = async (req, res) => {
  try {
    // احذف حجوزات الملعب أولاً
    await db.query('DELETE FROM bookings WHERE field_id = ?', [req.params.id]);
    // ثم احذف الملعب
    await db.query('DELETE FROM fields WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'تم حذف الملعب' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ تصدير بنفس الأسماء اللي يطلبها الـ route
module.exports = { getFields, createField, updateField, deleteField };

