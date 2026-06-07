const express = require("express");
const role = require("./middleware/role");
require("dotenv").config();
const cors = require("cors");
const auth = require("./middleware/auth");
const bookingsRoutes = require('./routes/bookingsRoutes');
const fieldsRoute = require('./routes/fieldsRoutes');
const authRoutes = require("./routes/authRoutes");
const app = express();
app.use(cors());
app.use(express.json());
app.get("/",(req,res)=>{
    res.send("api is working")
})
app.use('/api/bookings', bookingsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/fields",fieldsRoute)
app.get("/profile", auth, (req, res) => {
    res.json({
        message: "protected route"
    });
});
app.get("/owner-dashboard",auth,role("owner"),(req, res) => {
        res.json({
            message: "welcome owner"
        });
});
app.get("/player-dashboard",auth,role("player"),(req,res)=>{
        res.json({
            message:"welcome player"
        });
});
app.get("/admin-dashboard",auth,role("admin"),(req, res) => {
        res.json({
            message: "welcome admin"
        });
});
app.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`);})