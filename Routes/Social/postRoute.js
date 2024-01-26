const express = require('express')
const router = express.Router()
const postController = require('../../Controller/Social/postController')
const upload = require('../../Middlewares/multer')

router.post('/add-post', upload.array('image'), postController.addPost)
router.get('/', postController.getPosts)
router.get('/friends-posts', postController.getPostsFromFriends)
router.get('/:postId', postController.getPost)
router.delete('/delete-post/:postId', postController.deletePost)
router.post('/like/:postId', postController.likePost)
router.post('/comment/:postId', postController.addComment)
router.post('/:postId/comments/:commentId/reply', postController.addReply)
router.delete('/:postId/comments/:commentId', postController.deleteComment);

router.post('/addimage', upload.array('image'), postController.addImage)


module.exports = router;