const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    username: String,
    comment: String,
    commentId: { type: mongoose.Schema.ObjectId, ref: "Comment" }
});

const CommentSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    username: String,
    comment: String,
    commentId: { type: mongoose.Schema.ObjectId, ref: "Comment" },
    replies: [ReplySchema]
});

const PostSchema = new mongoose.Schema({
    firstname: { type: String },
    lastname: { type: String },
    username: { type: String },
    userId: { type: mongoose.Schema.ObjectId },
    content: { type: String },
    image: [{ type: String }],
    comments: [CommentSchema],
    numberOfComments: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    createdOn: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

PostSchema.virtual('formattedCreatedOn').get(function() {
    return this.createdOn.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });
});

PostSchema.virtual('formattedCreatedAt').get(function () {
    return this.createdAt.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true, 
    });
});

const Post = mongoose.model('Post', PostSchema);
module.exports = Post;
