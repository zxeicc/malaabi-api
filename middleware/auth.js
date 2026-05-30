const jwt= require("jsonwebtoken")


const auth =(req,res,next)=>{
    console.log(req.headers.authorization);
    const authHeader=req.headers.authorization;
    if(!authHeader){return res.status(401).json({message:"no token provided"})}
    const token = authHeader.split(" ")[1]
    try{const decoded =jwt.verify(token,process.env.JWT_SECRET)
        req.user=decoded
        
    next()
    }
    catch(error){return res.status(401).json({message:"invalid token"})}
    

}
module.exports=auth;