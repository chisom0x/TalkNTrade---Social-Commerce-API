const express = require('express')
const router = express.Router()
const friendsController = require('../../Controller/Social/friendsController')

router.post('/send-friend-request/:recieverId', friendsController.sendFriendRequest)
router.post('/cancel-friend-request/:recieverId', friendsController.cancelFriendRequest)
router.post('/decline-friend-request/:senderId', friendsController.declineFriendRequest)
router.post('/accept-friend-request/:senderId', friendsController.acceptFriendRequest)
router.get('/friend-requests', friendsController.friendRequests)
router.get('/', friendsController.friends)

module.exports = router