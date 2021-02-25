const jwt = require('jsonwebtoken');
const Register = require("../models/register");


const auth = async (req,res ,next) =>{
    try{
        const token  = req.cookies.jwt // Getting the token stored inside the cookies

        const userVerify = jwt.verify(token,process.env.SECRET_KEY);
        console.log(userVerify);

        const user =  await Register.findOne({_id:userVerify._id}); // Get the user
                                                                      // dtails ussing token id
        console.log(user);

        req.token = token;
        req.user = user; // Using these two we can delete the cookie.
        
        next();

    }catch(e){
        res.status(401).send(e);
    }
}

module.exports = auth;