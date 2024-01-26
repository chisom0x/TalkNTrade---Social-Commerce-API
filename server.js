const mongoose = require('mongoose')
const dotenv = require('dotenv')
const http = require('http');
const { Server } = require('socket.io')

dotenv.config({path: './config.env'})
const app = require('./app')
const server = http.createServer(app)

const DB = process.env.DATABASE

mongoose.connect(DB).then(()=>console.log('Database Connected!'))

const io = new Server(server)
app.io = io;

io.on('connection', (socket) => {
    socket.on('send-message', async ({sender, reciever, content}) => {
        const newMessage = await Message.create({sender})
        io.to(sender).to(reciever).emit('new-message', newMessage)
    })
})


const port = 8080
app.listen(port, ()=>{
    console.log(`App listening on ${port}`)
})