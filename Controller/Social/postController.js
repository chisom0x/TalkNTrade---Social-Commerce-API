const Post = require('../../Models/Social/postModel')
const User = require('../../Models/Authentication/userModel')
const AppError = require('../../Utils/errorResponse')
const cloudinary = require('../../Utils/cloudinary')
const upload = require('../../Middlewares/multer')
const jwt = require('jsonwebtoken')
const {promisify} = require('util')
const fs = require('fs')
const mongoose = require('mongoose');

exports.addPost = async (req, res, next) => {
   try {
    const cookie = req.cookies.jwt
    const decoded = await promisify(jwt.verify)(cookie, process.env.JWT_SECRET)
    const userId = decoded.id
    const user = await User.findById(userId)
    const firstname = user.firstname
    const lastname = user.lastname
    const username = user.username
    const {content} = req.body
    const uploader = async (path) => await cloudinary.uploader.upload(path);
    const urls = [];
    for (const file of req.files) {
        const { path } = file;
        const newPath = await uploader(path);
        urls.push(newPath.secure_url);
        fs.unlinkSync(path);
    }
    const newPost = await Post.create({
        firstname: firstname,
        lastname: lastname,
        username: username,
        userId: userId,
        content,
        image: urls
    })
     newPost.formattedCreatedOn;
     newPost.formattedCreatedAt;
     await User.findByIdAndUpdate(userId, {posts: newPost._id}, {new: true})
    res.status(201).json({
        status: 'success',
        data: newPost
    })
   } catch(err) {
    console.log(err)
    next (new AppError(500, 'something went wrong!'))
   }
}

exports.getPosts = async (req, res, next) => {
   try {
    const post = await Post.find()
    res.status(200).json({
        status: 'success',
        data: post
    })
   }  catch(err) {
    console.log(err)
    next (new AppError(500, 'something went wrong!'))
   }
}

exports.getPostsFromFriends = async (req, res, next) => {
    try {
        const cookie = req.cookies.jwt
        const decoded = await promisify(jwt.verify)(cookie, process.env.JWT_SECRET)
        const userId = decoded.id
        const user = await User.findById(userId)
        const friendId = user.friends
        const friend = await User.findById(friendId)
        const postId = friend.posts
        const post = await Post.findById(postId)
        res.status(200).json({
            status: 'success',
            data: post
        })
    }  catch(err) {
     console.log(err)
     next (new AppError(500, 'something went wrong!'))
    }
 }

exports.getPost = async (req, res) => {
    try{
    const postId = req.params.postId
        const post = await Post.findById(postId)
        res.status(200).json({
            status: 'success',
            data: post
        })
    } catch(err) {
        console.log(err)
        next (new AppError(500, 'something went wrong!'))
       }
   
}

exports.deletePost = async (req, res, next) => {
    try{
        const cookie = req.cookies.jwt
        const decoded = await promisify(jwt.verify)(cookie, process.env.JWT_SECRET)
        const userId = decoded.id
        const user = await User.findById(userId)
        const postId = req.params.postId

        await Post.findByIdAndDelete(postId)

        if (Array.isArray(user.posts)) {
            user.posts = user.posts.filter(id => id.toString() !== postId.toString());
        } else {
            console.error('sender.sentFriendRequests is not an array');
        }
            res.status(200).json({
                status: 'success',
                message: 'Post deleted successfully.',
            });
    } catch(err) {
        console.log(err)
        next (new AppError(500, 'something went wrong!'))
       }
}

exports.likePost = async (req, res) => {
    try {
        const postId = req.params.postId;
        const like = await Post.findByIdAndUpdate(
            postId,
            { $inc: { likes: 1 } },
            { new: true }
        );
        res.status(200).json({
            status: 'success',
        });
    } catch(err) {
        console.log(err)
        next (new AppError(500, 'something went wrong!'))
       }
};

exports.addComment = async (req, res) => {
    try {
    const cookie = req.cookies.jwt
    const decoded = await promisify(jwt.verify)(cookie, process.env.JWT_SECRET)
    const userId = decoded.id
    const user = await User.findById(userId)
    const firstname = user.firstname
    const lastname = user.lastname
    const username = user.username
    const {comment} = req.body
    const postId = req.params.postId

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const newComment = {
            firstname: firstname,
            lastname: lastname,
            username: username,
            comment,
            commentId: new mongoose.Types.ObjectId(),
            userId
        };

        post.comments.push(newComment);

        await post.save();

        res.status(201).json({ message: "Comment added", comment: newComment });
    }  catch(err) {
        console.log(err)
        next (new AppError(500, 'something went wrong!'))
       }
};

exports.addReply = async (req, res) => {
    try {
        const cookie = req.cookies.jwt
        const decoded = await promisify(jwt.verify)(cookie, process.env.JWT_SECRET)
        const userId = decoded.id
        const user = await User.findById(userId)
        const firstname = user.firstname
        const lastname = user.lastname
        const username = user.username
        const postId = req.params.postId;
        const commentId = req.params.commentId;
        const {comment} = req.body
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const commentIndex = post.comments.findIndex(c => c.commentId.toString() === commentId);
        if (commentIndex === -1) {
            return res.status(404).json({ message: "Comment not found" });
        }

        const newReply = {
            firstname: firstname,
            lastname: lastname,
            username: username,
            comment,
            commentId: new mongoose.Types.ObjectId(),
            userId
        };

        post.comments[commentIndex].replies.push(newReply);

        await post.save();

        res.status(201).json({ message: "Reply added", reply: newReply });
    }  catch(err) {
        console.log(err)
        next (new AppError(500, 'something went wrong!'))
       }
};

exports.deleteComment = async (req, res) => {
    try {
        const postId = req.params.postId;
        const commentId = req.params.commentId;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const commentIndex = post.comments.findIndex(c => c.commentId.toString() === commentId);
        if (commentIndex === -1) {
            return res.status(404).json({ message: "Comment not found" });
        }

        post.comments.splice(commentIndex, 1);

        await post.save();

        res.status(200).json({ message: "Comment deleted" });
    } catch(err) {
        console.log(err)
        next (new AppError(500, 'something went wrong!'))
       }
};

// sample using cloudinary to upload images
exports.addImage = async (req, res, next) => {
    try {
        const uploader = async (path) => await cloudinary.uploader.upload(path);
        const urls = [];

        for (const file of req.files) {
            const { path } = file;
            const newPath = await uploader(path);
            urls.push(newPath.secure_url);
            fs.unlinkSync(path);
        }

        res.status(200).json({
            message: "Images Uploaded Successfully",
            data: urls
        });
    } catch (err) {
        console.log(err);
        next(new AppError(500, 'Something went wrong!'));
    }
}
