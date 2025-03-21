const { Schema, model } = require('mongoose')

const messageWSSchema = new Schema(
  {
    chatId: { type: String, required: true },
    senderId: { type: String, required: true },
    text: { type: String, required: true },
    senderAvatar: { type: String, default: '' },
    senderName: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
  },
  { minimize: false }
)

const MessageWS = model('MessageWS', messageWSSchema)
module.exports = { MessageWS }
