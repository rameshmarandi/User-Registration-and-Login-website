require('dotenv').config()
const express = require('express');
const app = express();
const path = require('path');
const hbs = require('hbs');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const auth = require("./middleware/auth")
require("./db/conn")
const Register = require("./models/register");
const port = process.env.PORT || 3000;

// Paths
 const static_path = path.join(__dirname, "../public");
 const template_path = path.join(__dirname, "../templates/views");
 const partials_path = path.join(__dirname, "../templates/partials");
// End Paths

// Methods use

app.use(express.static(static_path));
app.use(cookieParser());
app.set('view engine', 'hbs');
app.set("views" ,template_path );
hbs.registerPartials(partials_path);
// Json data return from input form

app.use(express.json());
app.use(express.urlencoded({extended:false})); // It is for input form
//  End Methods use


app.get("/", (req, res) =>{
    res.render("index");
});

app.get("/secret", auth ,(req, res) =>{  // Here we are calling auth function.
    // console.log(`The secret ${req.cookies.jwt}`);
    res.render("secret");
});
// /Logout
app.get("/logout", auth ,async (req, res) =>{  
    try{    
     
        //    console.log(req.user);
      // Define the code to delet the tokens from Database
      // Code for Logout single device

      req.user.tokens = req.user.tokens.filter(( currentToken) =>{
                 return currentToken.token !== req.token;
      })
     

 // Lougout from Multiples device

//  req.user.tokens = [];

 //End


        res.clearCookie("jwt");

        console.log("Logout Successful");
        await req.user.save(); // After delete the cookie we want to save inside the database.
        res.render("login");
    }catch(e){
        res.status(500).send(e);
    }
});

app.get("/register", (req, res) =>{
    res.render("register");
})
//  create a new user in our database

app.post("/register", async (req, res) =>{
    try{
       const password = req.body.password;
       const cpassword = req.body.confirmpassword;

       if(password  === cpassword){
           const ResgisterEmp = new Register({
            firstname : req.body.firstname,
            lastname : req.body.lastname,
            email: req.body.email,
            phone: req.body.phone,
            password : password,
            confirmpassword : cpassword,
            gender : req.body.gender
           });
           
//Calling the Token function Here...

        const token =  await ResgisterEmp.generateAuthToken();

          //Defining the Cookies

          res.cookie("jwt" , token , {
              expires: new Date(Date.now() + 30000),
              httpOnly: true
          });
          console.log(cookie);

           //Save the data into Database
           const registered = await ResgisterEmp.save();
        //    console.log(`This data is ${registered}`);
           res.status(201).render("index");
           

       }else{
           res.send("Incorrect Password");
       }

    }catch(e){
        res.status(400).send(e);
    }
})

app.get('/login', (req, res) =>{
    res.render("login");
})

// Checking Login details page


app.post('/login', async (req, res) =>{
    try{

     const email= req.body.email;
     const password = req.body.password;
    const userEmail = await Register.findOne({email:email});

    const isMatch =await bcrypt.compare(password, userEmail.password);

    //Generating Token during User Login
    const token =  await userEmail.generateAuthToken();
    // console.log(token);
    res.cookie("jwt" , token , {
        expires: new Date(Date.now() + 60000),
        httpOnly: true,
        // secure : true
    });

    // console.log(cookie);



    if(isMatch){
        res.status(201).render("index");
    }else{
        res.send("Invalid login Details");
    }



    }catch(e){
        res.status(404).send(e);
    }
})

//Server Port 
app.listen(port,() =>{
    console.log(`Server running at ${port}`);
})