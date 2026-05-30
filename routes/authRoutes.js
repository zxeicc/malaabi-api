const express = require("express")
const router = express.Router()
const { body, validationResult } = require("express-validator")
const authController = require("../controllers/authController")

// قواعد التحقق
const registerRules = [
    body("name").notEmpty().withMessage("الاسم مطلوب"),
    body("email").isEmail().withMessage("البريد غير صحيح"),
    body("password").isLength({ min: 6 }).withMessage("كلمة المرور 6 أحرف على الأقل"),
    body("role").isIn(["player", "admin", "owner"]).withMessage("الدور غير صحيح")
]

const loginRules = [
    body("email").isEmail().withMessage("البريد غير صحيح"),
    body("password").notEmpty().withMessage("كلمة المرور مطلوبة")
]

// middleware التحقق
const validate = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    next()
}

router.post("/register", registerRules, validate, authController.register)
router.post("/login", loginRules, validate, authController.login)

module.exports = router;