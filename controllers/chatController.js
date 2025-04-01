const { Chat } = require("../models/chat");

const {
  RequestError,
} = require("../helpers");

const getUserChats = async (req, res, next) => {
    const userId = req.user._id.toString()

    const chats = await Chat.find({ users: userId }).sort({ lastMessageAt: -1 })

    res.status(200).json(chats)
}

module.exports = {
  getUserChats,
}