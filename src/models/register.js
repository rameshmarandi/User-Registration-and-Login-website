const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const employeeSchema = new mongoose.Schema({
    firstname : {
        type : String,
        require:true
    },
    lastname : {
        type : String,
        require:true
    },
    email: {
        type :String,
        required:true,
        unique : [true, "invalid email"],
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid email");
            }
        }
    },
    phone:{
        type:Number,
        required : true,
        unique:true
    },
    password : {
        type : String,
        required:true
    },
    confirmpassword : {
        type : String,
        required:true
    },
    gender : {
        type : String,
        required:true
    },
    tokens :[{
        token : {
            type : String,
            required:true
        }
    }]
})
//Generate the Token code

employeeSchema.methods.generateAuthToken = async function(){
    const token = jwt.sign({_id:this._id}, process.env.SECRET_KEY);
    this.tokens = this.tokens.concat({token : token});
    await this.save();
    // console.log(token);
    return token;
}

// Hashing code Define 

employeeSchema.pre("save" , async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10);
        // this.confirmpassword = undefined; // If we write this we can not sotre confirmpassowrd.
        this.confirmpassword = await bcrypt.hash(this.password, 10);
    }
    
    next();

})
// Create a collection

const Register = new mongoose.model('Register' ,employeeSchema );
module.exports = Register;