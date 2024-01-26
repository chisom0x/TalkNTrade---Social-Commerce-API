const mongoose = require('mongoose')


const messageSchema = new mongoose.Schema({
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to User model
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
    },
    images: [{type: String}],
    timestamp: {
      type: Date,
      default: Date.now,
    },
  });
  

const Message = mongoose.model('Message', messageSchema)
module.exports = Message