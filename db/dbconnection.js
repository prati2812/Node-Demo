const mongoose = require('mongoose');
require('dotenv').config();

async function dbconnect(){
     mongoose.connect(process.env.DB_URL)
    .then(()=>{
         console.log("Database connected");
    })
    .catch((error)=>{
         console.log(error);
    })
}


module.exports = dbconnect