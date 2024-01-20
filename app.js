const express = require('express')
const authrouter = require('./Routes/Authentication/authRoute')
const cookieParser = require('cookie-parser')

const app = express();

app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth', authrouter);

module.exports = app;