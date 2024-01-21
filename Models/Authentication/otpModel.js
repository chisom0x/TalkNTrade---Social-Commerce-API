const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const otpSchema = new Schema({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
},
  value: Number,
  expiresAt: Date,
});

const OTPModel = mongoose.model('OTP', otpSchema);

module.exports = OTPModel;