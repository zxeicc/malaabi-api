const db=require("../config/db")
const bcrypt=require("bcryptjs")
const jwt=require("jsonwebtoken");

exports.register=async(req,res)=>{
    const {name,email,password,role,phone}=req.body;

    // check email 
    try{
        const [existing]=await db.query("SELECT id FROM users WHERE email =?",[email])
        if(existing.length>0){return res.status(400).json({message:"Email already exists"})}
                console.log('email:', email);        // ← أضف
        console.log('existing:', existing); 
    // password uniq
    console.log('passed check');
        const hashedpassword=bcrypt.hashSync(password,10)
        console.log('hashed'); 
    // add user
        const [result] =await db.query("INSERT INTO users(name,email,password,role,phone)VALUES(?,?,?,?,?)",[name,email,hashedpassword,role || "player",phone||null])
        console.log('inserted:', result.insertId)
        res.json({message:"user created",userId:result.insertId})
    }catch(err){
        console.log('ERROR:', err.message);
        res.status(500).json({message:err.message})
    }};

// login
exports.login=async(req,res)=>{

    const {email,password}=req.body
    try{
    // check email
        const [result]= await db.query("SELECT * FROM users WHERE email=?",[email])
        if(result.length===0){return res.status(404).json({message:"user not found"})}
    
        const user =result[0]
    // check password 
        const isMatch = bcrypt.compareSync(password,user.password)
        if(!isMatch){return res.status(401).json({message:"password is wrong"})}
        
    //check JWT
        if(!process.env.JWT_SECRET){return res.status(500).json({message:"JWT_SECRET Mmissing"})}
    // sign
        const token =jwt.sign({id:user.id,role:user.role},process.env.JWT_SECRET,{expiresIn:"1d"})
        res.json({ message: "login success", token,user: { id: user.id, name: user.name, email: user.email, role: user.role }})
    }catch(err){return res.status(500).json({message:"err.message"})}
    
}