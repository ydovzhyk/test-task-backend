const { Schema, model } = require('mongoose')

const chatSchema = new Schema(
  {
    users: { type: [String], required: true }, // Масив з ID двох користувачів
    propertyId: { type: String, required: true }, // ID помешкання
    lastMessage: { type: String, default: '' }, // Останнє повідомлення
    newMessagesUserOne: { type: [String], default: [] },
    newMessagesUserTwo: { type: [String], default: [] },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { minimize: false }
)

const Chat = model('Chat', chatSchema)
module.exports = { Chat }
