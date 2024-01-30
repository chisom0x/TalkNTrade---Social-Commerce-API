const express = require('express')
const authrouter = require('./Routes/Authentication/authRoute')
const friendrouter = require('./Routes/Social/friendsRoute')
const postrouter = require('./Routes/Social/postRoute')
const chatrouter = require('./Routes/Social/chatRoute')
const marketplacerouter = require('./Routes/Marketplace/marketplaceRoutes')
const cookieParser = require('cookie-parser')

const app = express();

app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth', authrouter);
app.use('/api/friends', friendrouter)
app.use('/api/posts', postrouter)
app.use('/api/chat', chatrouter)
app.use('/api/market', marketplacerouter)

module.exports = app;