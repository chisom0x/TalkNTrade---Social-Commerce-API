const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    firstname: {
        type: String
    },
    lastname: {
        type: String
    },
    username: {
        type: String,
        unique: true
    },
    email: {
        type: String,
        unique: true
    },
    profilePhoto: {
        type: String
    },
    password: {
        type: String,
    },
    verifiedEmail: {
        type: Boolean
    },
    posts: [{type: String}],
    friends: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      }],
    friendRequests: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      }],
    sentFriendRequests: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
     }],
    store: {
        type: String
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
})

userSchema.pre('save', async function(next) {
    this.password = await bcrypt.hash(this.password, 12)
    next();
})

userSchema.methods.correctPassword = async function(
    candidatePassword,
    userPassword
){
    return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex')
    this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')
    console.log({resetToken}, this.passwordResetToken)
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken
}

const User = mongoose.model('User', userSchema)
module.exports = User