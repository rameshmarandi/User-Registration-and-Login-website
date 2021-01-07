const mongoose = require('mongoose');

mongoose.connect(process.env.DB_HOST,{
    useCreateIndex:true,
    useUnifiedTopology:true,
    useNewUrlParser: true
}).then(() =>{
    console.log("Connection Successful");
}).catch(()=>{
    console.log("No Connection");
})