const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config({path: './config.env'})
const app = require('./app')

const DB = process.env.DATABASE

mongoose.connect(DB).then(()=>console.log('Database Connected!'))

const port = 8080
app.listen(port, ()=>{
    console.log(`App listening on ${port}`)
})