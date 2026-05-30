const db = require("../config/db")

// add new booking
    exports.createBooking=async(req,res)=>{
try{ const {field_id, date,time_slot,duration}=req.body
    const user_id=req.user.id

    // check time booking
    const [existing]=await db.query("SELECT id FROM bookings WHERE field_id=? AND date=? AND time_slot=? AND status != 'cancelled'",[field_id,date,time_slot])
    if(existing.length>0){return res.status(400).json({mesaage:"هذا الوقت محجوز مسبقاً"})}
    
    // price total
    const [field]=await db.query("SELECT price_per_hour FROM fields WHERE id=?",[field_id])
    const total =field[0].price_per_hour*duration

    // add booking
    const [result]=await db.query("INSERT INTO bookings(field_id, user_id,date,time_slot,duration,total)VALUES(?,?,?,?,?,?)",[field_id,user_id,date,time_slot,duration,total])

    res.status(201).json({message:"تم الحجز بنجاح",id:result.insertId})
    }catch(err){
        res.status(500).json({message:err.message})
    }}

// get booking to player
    exports.getMyBookings=async(req,res)=>{
    try{
        const user_id =req.user.id
        const [bookings]=await db.query("SELECT bookings.*,fields.name,fields.location FROM bookings JOIN fields ON bookings.field_id =fields.id WHERE bookings.user_id=?",[user_id])
        res.json({success:true,data:bookings})
    }catch(err){res.status(500).json({message:err.message})}
    }

// get all bookings for admin or awner
    exports.getAllBookings=async(req,res)=>{
    try{
        const [bookings] =await db.query("SELECT bookings.*,fields.name,fields.location,users.name AS player_name FROM bookings JOIN fields ON bookings.field_id=fields.id JOIN users ON bookings.user_id = users.id")
        res.json({success:true,data:bookings})}
    catch(err){return res.status(500).json({message:err.message})}
    }

//change state bookings 
    exports.updateBookingStatus=async(req,res)=>{
    try{
        const status =req.body.status
        const id = req.params.id
        await db.query("UPDATE bookings SET status=? WHERE id =?",[status,id])
        res.json({success:true,message:"تم تحديث الحالة"})
    }
    catch(err){return res.status(500).json({message:err.message})}
    }

// cancelBookings
    exports.cancelBooking=async(req,res)=>{
    try{
        const id = req.params.id
        const user_id= req.user.id

        // check if booking your this player
        const [booking]= await db.query("SELECT id FROM bookings WHERE id =? AND user_id=?",[id, user_id])
        if(booking.length===0 ){return res.status(404).json({message:"الحجز غير موجود"})}
        await db.query("UPDATE bookings SET status='cancelled' where id=?",[id])
        res.json({success:true,message:"تم إلغاء الحجز"})
    }
    catch(err){return res.status(500).json({message:err.message})}
    }