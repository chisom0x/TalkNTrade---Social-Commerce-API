const express = require('express')
const authrouter = require('./Routes/Authentication/authRoute')
const friendrouter = require('./Routes/Social/friendsRoute')
const postrouter = require('./Routes/Social/postRoute')
const chatrouter = require('./Routes/Social/chatRoute')
const cookieParser = require('cookie-parser')

const app = express();

app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth', authrouter);
app.use('/api/friends', friendrouter)
app.use('/api/posts', postrouter)
app.use('/api/chat', chatrouter)

module.exports = app;