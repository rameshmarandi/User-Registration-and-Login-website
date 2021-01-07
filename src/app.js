require('dotenv').config()
const express = require('express');
const app = express();
const path = require('path');
const hbs = require('hbs');
const bcrypt = require('bcryptjs');
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
           //Save the data into Database
           const registered = await ResgisterEmp.save();
           console.log(`This data is ${registered}`);
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