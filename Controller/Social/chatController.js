const Message = require('../../Models/Social/chatModel')
const Conversation = require('../../Models/Social/conversationModel')
const User = require('../../Models/Authentication/userModel')
const AppError = require('../../Utils/errorResponse')
const cloudinary = require('../../Utils/cloudinary')
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const fs = require('fs')
const mongoose = require('mongoose');

exports.sendMessage = async (req, res, next) => {
    try{
    const io = req.app.io;
    const cookie = req.cookies.jwt;
    const decoded = await promisify(jwt.verify)(cookie, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id)
    const sender = user.id
    const receiver = req.params.receiverId
    const { content } = req.body
    const newMessage = await Message.create({sender, receiver, content})
    const conversation = await Conversation.findOne({
        participants: { $all: [sender, receiver] }
    });

    if (!conversation) {
        await Conversation.create({
            participants: [sender, receiver],
            messages: [newMessage._id]
        });
    } else {
        conversation.messages.push(newMessage._id);
        await conversation.save();
    }

    io.to(sender).to(receiver).emit('new-message', {
        ...newMessage
    });

    res.status(201).json({ status: 'success', data: newMessage });

    } catch(err) {
        console.log(err)
        next (new AppError(500, 'something went wrong!'))
       }
}

exports.getConversation = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const conversation = await Conversation.findById(conversationId).populate('messages');

        if (!conversation) {
            return next (new AppError(401, 'conversation not found'))
        }

        res.status(200).json({ status: 'success', data: conversation });
    } catch (error) {
        console.error(error);
         next (new AppError(401, 'something went wrong'))
    }
};

exports.getUserConversations = async (req, res, next) => {
    try {
        const cookie = req.cookies.jwt;
        const decoded = await promisify(jwt.verify)(cookie, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);
        const userId = user.id;

        const conversations = await Conversation.find({
            participants: userId
        })
        .populate({
            path: 'participants',
            select: 'firstname lastname',
        })
        .populate('messages');

        conversations.forEach(conversation => {
            conversation.participants.sort((a, b) => {
                if (a._id.toString() === userId) {
                    return -1;
                } else if (b._id.toString() === userId) {
                    return 1;
                } else {
                    return 0;
                }
            });
        });

        res.status(200).json({ status: 'success', data: conversations });
    } catch (error) {
        console.error(error);
         next (new AppError(401, 'something went wrong'))
    }
};

exports.deleteMessage = async (req, res, next) => {
    try {
        const io = req.app.io;
        const cookie = req.cookies.jwt;
        const decoded = await promisify(jwt.verify)(cookie, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);
        const userId = user.id;
        const  messageId  = req.params.messageId;

        const message = await Message.findById(messageId);

        if (message.sender !== userId) {
            return next(new AppError(400, 'Can not delete message sent by another user'))
        }

        const deletedMessage = await Message.findByIdAndDelete(messageId);


        io.to(message.sender).to(message.receiver).emit('delete-message', messageId);

        res.status(200).json({ status: 'success', data: null });
    } catch (error) {
        console.error(error);
         next (new AppError(401, 'something went wrong'))
    }
};

exports.sendImage = async (req, res, next) => {
    try{
        const io = req.app.io;
        const cookie = req.cookies.jwt;
        const decoded = await promisify(jwt.verify)(cookie, process.env.JWT_SECRET);

        if (!decoded) {
            return sendErrorResponse(res, 401, 'Unauthorized');
        }

        const user = await User.findById(decoded.id);
        const sender = user.id;
        const receiver = req.params.receiverId;
        const uploader = async (path) => await cloudinary.uploader.upload(path);
        const urls = [];

        for (const file of req.files) {
            const { path } = file;
            const newPath = await uploader(path);
            urls.push(newPath.secure_url);
            fs.unlinkSync(path);
        }

        const newMessage = await Message.create({
            sender,
            receiver,
            images: urls,
        });

        const conversation = await Conversation.findOne({
            participants: { $all: [sender, receiver] }
        });

        if (!conversation) {
            await Conversation.create({
                participants: [sender, receiver],
                messages: [newMessage._id]
            });
        } else {
            conversation.messages.push(newMessage._id);
            await conversation.save();
        }

        io.to(sender).to(receiver).emit('new-message', {
            ...newMessage
        });

        res.status(201).json({ status: 'success', data: newMessage });

    } catch (error) {
        console.error(error);
         next (new AppError(401, 'something went wrong'))
    }
}

exports.deleteImage = async (req, res, next) => {
    try {
        const io = req.app.io;
        const cookie = req.cookies.jwt;
        const decoded = await promisify(jwt.verify)(cookie, process.env.JWT_SECRET);

        if (!decoded) {
            return sendErrorResponse(res, 401, 'Unauthorized');
        }

        const user = await User.findById(decoded.id);
        const userId = user.id;
        const { messageId } = req.params;

        const message = await Message.findById(messageId);

        if (message.sender.toString() !== userId) {
            return next(new AppError(400, 'Can not delete message sent by another user'))
        }

        const deletedMessage = await Message.findById(messageId);

        io.to(message.sender).to(message.receiver).emit('delete-message', messageId);

        res.status(200).json({ status: 'success' });
    } catch (error) {
        console.error(error);
         next (new AppError(401, 'something went wrong'))
    }
};
