const mongoose = require('mongoose')
require('dotenv').config()

const mongoURI = `${process.env.DATABASE}`

const connectToMongo = async ()=>{
    await mongoose.connect(mongoURI)
    console.log("Connected to mongo")
}

module.exports =  connectToMongo;


// mongodb+srv://bhavesh:bhavesh12345@cluster0.ck26fwh.mongodb.net/?retryWrites=true&w=majority