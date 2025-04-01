const { Schema, model } = require('mongoose')

const chatSchema = new Schema(
  {
    users: { type: [String], required: true },
    propertyId: { type: String, required: true },
    propertyPhoto: { type: String, default: '' },
    propertyTitle: { type: String, default: '' },
    lastMessage: { type: String, default: '' },
    newMessagesUserOne: { type: [String], default: [] },
    newMessagesUserTwo: { type: [String], default: [] },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { minimize: false }
)

const Chat = model('Chat', chatSchema)
module.exports = { Chat }
