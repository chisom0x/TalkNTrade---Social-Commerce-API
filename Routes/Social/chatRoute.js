const express = require('express');
const router = express.Router()
const chatController = require('../../Controller/Social/chatController')
const upload = require('../../Middlewares/multer')

router.post('/send-message/:receiverId', chatController.sendMessage)
router.post('/send-image/:receiverId', upload.array('image'), chatController.sendImage)
router.get('/conversations/user', chatController.getUserConversations)
router.get('/conversations/:conversationId', chatController.getConversation)
router.delete('/delete-message/:messageId', chatController.deleteMessage)
router.delete('/delete-image/:messageId', chatController.deleteImage)



module.exports = router
