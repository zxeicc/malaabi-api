const express=require("express")
const router = express.Router()
const auth =require("../middleware/auth")
const role =require("../middleware/role")
const { createBooking, getMyBookings, getAllBookings, updateBookingStatus, cancelBooking }= require("../controllers/bookingsController")


const { body, validationResult } = require("express-validator")

const bookingRules = [
    body("field_id").notEmpty().withMessage("الملعب مطلوب"),
    body("date").isDate().withMessage("التاريخ غير صحيح"),
    body("time_slot").notEmpty().withMessage("الوقت مطلوب"),
    body("duration").isInt({ min: 1, max: 5 }).withMessage("المدة بين 1 و 5 ساعات")
]

const validate = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    next()
}
// player 
router.post("/", auth, role("player"), bookingRules, validate, createBooking)
router.get("/my",auth,role("player"),getMyBookings)
router.put("/cancel/:id",auth,role("player"),cancelBooking)

// admin and awner
router.get("/",auth,role("admin","owner"),getAllBookings)
router.put("/:id/status",auth,role("admin","owner"),updateBookingStatus)

module.exports=router;