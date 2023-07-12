const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET_KEY;

const fetchuser = async (req,res,next)=>{
    //Get the user from JWT token and add id to req object
    const token = req.header('auth-token');
    if(!token){
        res.status(401).json({error: "Please authenticate using a valid token!"});
    }

    try{
        const data = jwt.verify(token, JWT_SECRET);
        // console.log(data.user.id)
        req.user = data.user;
        // console.log(req.user)
        next();
    }catch (error) {
        console.log(error);
        res.status(401).json({error: "Please authenticate using a valid token!"});
    } 
}

module.exports = fetchuser;