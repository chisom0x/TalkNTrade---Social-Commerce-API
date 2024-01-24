const User = require('../../Models/Authentication/userModel')
const AppError = require('../../Utils/errorResponse')
const jwt = require('jsonwebtoken')
const {promisify} = require('util')

exports.sendFriendRequest = async (req, res, next) => {
  try{
    const cookie = req.cookies.jwt
    const decoded = await promisify(jwt.verify)(
      cookie,
      process.env.JWT_SECRET
    );
    const sender = decoded.id;
    const recieverId = req.params.recieverId
    await User.findByIdAndUpdate(recieverId, {friendRequests: sender},  {new: true} );
    await User.findByIdAndUpdate(sender, {sentFriendRequests: recieverId}, {new: true})
    res.status(200).json({
        status: 'Success',
        message: 'friend request sent successfully!'
    })
  }  catch(err) {
    console.log(err)
    next (new AppError(500, 'something went wrong!'))
   }
}

exports.cancelFriendRequest = async (req, res, next) => {
    try {
    const cookie = req.cookies.jwt
    const decoded = await promisify(jwt.verify)(
      cookie,
      process.env.JWT_SECRET
    );
    const senderId = decoded.id;
    const sender = await User.findById(senderId)
    const recieverId = req.params.recieverId
    const reciever = await User.findById(recieverId)

    sender.sentFriendRequests = sender.sentFriendRequests.filter(id => !recieverId.includes(id))
    reciever.friendRequests = reciever.friendRequests.filter(id => !senderId.includes(id))
    await reciever.save()
    await sender.save()
    res.status(200).json({
        status: 'Success',
        message: 'friend request canceled successfully!'
    })
    }  catch(err) {
        console.log(err)
        next (new AppError(500, 'something went wrong!'))
       }
}

exports.declineFriendRequest = async (req, res) => {
    try {
        const cookie = req.cookies.jwt
        const decoded = await promisify(jwt.verify)(
          cookie,
          process.env.JWT_SECRET
        );
        const recieverId = decoded.id;
        const reciever = await User.findById(recieverId)
        const senderId = req.params.senderId
        const sender = await User.findById(senderId)

        reciever.friendRequests = reciever.friendRequests.filter(id => !senderId.includes(id))
        sender.sentFriendRequests = sender.sentFriendRequests.filter(id => !recieverId.includes(id))
        

        await reciever.save()
        await sender.save()
        res.status(200).json({
            status: 'Success',
            message: 'friend request canceled successfully!'
        })
    } catch(err) {
        console.log(err)
        next (new AppError(500, 'something went wrong!'))
       }
} 

exports.acceptFriendRequest = async (req, res, next) => {
    try{

        const cookie = req.cookies.jwt
        const decoded = await promisify(jwt.verify)(
          cookie,
          process.env.JWT_SECRET
        );
        const recieverId = decoded.id;
        const reciever = await User.findById(recieverId)
        const senderId = req.params.senderId
        const sender = await User.findById(senderId)
        // one persons friend isnt updating
        await User.findByIdAndUpdate(recieverId, {friends: senderId}, {new: true})
        await User.findByIdAndUpdate(senderId, {friends: recieverId}, {new: true})
        // this did not work
        sender.sentFriendRequests = sender.sentFriendRequests.filter(id => !recieverId.includes(id))
        reciever.friendRequests = reciever.friendRequests.filter(id => !senderId.includes(id))

        await reciever.save()
        await sender.save()
        res.status(200).json({
            status: 'Success',
        })

    } catch(err) {
        console.log(err)
        next (new AppError(500, 'something went wrong!'))
       }
}

exports.friendRequests = async (req, res, next) => {
  try{
    const cookie = req.cookies.jwt
    const decoded = await promisify(jwt.verify)(
      cookie,
      process.env.JWT_SECRET
    );
    const userId = decoded.id;
    const currentUser = await User.findById(userId)
    const friendRequests =  currentUser.friendRequests
    if(friendRequests.length === 0){
        res.status(200).json({
            status: 'Success',
            results: friendRequests.length,
            message: 'you have 0 friend requests'
        })
    }
    res.status(200).json({
        status: 'Success',
        results: friendRequests.length,
        data: friendRequests
    })
  } catch(err) {
    console.log(err)
    next (new AppError(500, 'something went wrong!'))
   }
}

exports.friends = async (req, res, next) => {
    try{
      const cookie = req.cookies.jwt
      const decoded = await promisify(jwt.verify)(
        cookie,
        process.env.JWT_SECRET
      );
      const userId = decoded.id;
      const currentUser = await User.findById(userId)
      const friends =  currentUser.friends
     
      res.status(200).json({
          status: 'Success',
          results: friends.length,
          data: friends
      })
    } catch(err) {
      console.log(err)
      next (new AppError(500, 'something went wrong!'))
     }
  }