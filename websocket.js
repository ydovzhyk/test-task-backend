const { Transcriber } = require('./helpers');
const { Chat } = require('./models/chat');
const { MessageWS } = require('./models/messageWS');
const { User } = require('./models/user');

const users = new Map() // { socketId: userId }

const initializeWebSocket = (io) => {
  io.on('connection', async (socket) => {
    const userId = socket.handshake.query.userId;
    users.set(socket.id, userId);
    // eslint-disable-next-line no-console
    console.log(`🟢 User connected: ${userId} (${socket.id})`);

    // Notify other users that user is online
    if (userId) {
      io.emit('user-online, userId');
    }

    // ------🔹 ЛОГІКА ТРАНСКРИПЦІЇ  ------
    const transcriber = new Transcriber()

    transcriber.on('transcriber-ready', () => {
      socket.emit('transcriber-ready', 'Ready')
    })

    transcriber.on('final', (transcript) => {
      socket.emit('final', transcript)
    })

    transcriber.on('final-transleted', (transletedResponse) => {
      socket.emit('final-transleted', transletedResponse)
    })

    transcriber.on('partial', (transcript) => {
      socket.emit('partial', transcript)
    })

    transcriber.on('error', (error) => {
      socket.emit('error', error)
    })

    transcriber.on('close', (data) => {
      socket.emit('close', data)
    })

    socket.on('incoming-audio', async (data) => {
      if (!transcriber.deepgramSocket) {
        await transcriber.startTranscriptionStream(
          data.sampleRate,
          data.inputLanguage
        )
        transcriber.send(data.audioData, data.targetLanguage)
      } else {
        transcriber.send(data.audioData, data.targetLanguage)
      }
    })

    socket.on('pause-deepgram', (data) => {
      transcriber.pauseTranscriptionStream(data)
    })

    socket.on('diconnect-deepgram', () => {
      transcriber.endTranscriptionStream()
    })

    // ------🔹 ЛОГІКА ЧАТУ  ------
    socket.on(
      'create-chat',
      async ({ userId, ownerId, apartmentId }, callback) => {
        try {
          let chat = await Chat.findOne({
            users: { $all: [userId, ownerId] },
            propertyId: apartmentId,
          })

          if (!chat) {
            chat = new Chat({
              users: [userId, ownerId],
              propertyId: apartmentId,
            })
            await chat.save()
          }

          // eslint-disable-next-line no-console
          console.log(`🆕 Chat created (or found): ${chat._id}`)

          // ✅ Відправляємо chatId у callback з `null` як перший параметр (без помилки)
          callback(null, { chatId: chat._id.toString() })
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Error creating chat:', error)
          callback(error, null)
        }
      }
    )

    // 🔹 Перевіряємо чи є чат
    socket.on(
      'check-chat',
      async ({ userId, ownerId, apartmentId }, callback) => {
        try {
          const chat = await Chat.findOne({
            users: { $all: [userId, ownerId] },
            propertyId: apartmentId,
          })
          if (!chat) {
            callback(null, null)
          } else {
            // eslint-disable-next-line no-console
            console.log(`Chat found): ${chat._id}`)
            callback(null, { chatId: chat._id.toString() })
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Error creating chat:', error)
          callback(error, null)
        }
      }
    )

    // 🔹 Збираємо всю переписку
    socket.on('conversation', async ({ chatId }, callback) => {
      try {
        const chat = await Chat.findById(chatId)
        if (!chat) {
          callback(null, null)
        }
        // Отримуємо всі повідомлення цього чату, сортуємо за датою створення
        const messages = await MessageWS.find({ chatId }).sort({ createdAt: 1 })
        // Додаємо користувача в кімнату WebSocket
        socket.join(chatId)
        // Повертаємо історію чату
        callback(null, { messages })
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching chat messages:', error)
        callback(error, null)
      }
    })

    // 🔹 Відправка повідомлення
    socket.on('message', async ({ chatId, senderId, text }, callback) => {
      try {
        const sender = await User.findById(senderId)
        if (!sender) {
          throw new Error(`Chat not found: ${chatId}`)
        }
        const chat = await Chat.findById(chatId)
        if (!chat) {
          throw new Error(`Chat not found: ${chatId}`)
        }
        const message = new MessageWS({
          chatId,
          senderId,
          text,
          senderAvatar: sender.userAvatar,
          senderName: sender.username,
        })
        await message.save()
        const senderIndex = chat.users.indexOf(senderId)
        const updateField =
          senderIndex === 0
            ? { $push: { newMessagesUserTwo: message._id } }
            : { $push: { newMessagesUserOne: message._id } }

        await Chat.findByIdAndUpdate(chatId, {
          ...updateField,
          lastMessage: text,
          lastMessageAt: Date.now(),
        })

        io.to(chatId).emit('message', { senderId, text, createdAt: new Date() })
        callback(null, { info: 'Message sent' })
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('❌ Error sending message:', error)
        callback(error, null)
      }
    })

    // 🔹 Отримуємо аватар власника помешкання
    socket.on(
      'owner-avatar',
      async ({ ownerId }, callback) => {
        try {
          const owner = await User.findById(ownerId)
          if (!owner) {
            callback(null, null)
          } else {
            callback(null, { info: { avatar: owner.userAvatar, name: owner.username } })
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Error creating chat:', error)
          callback(error, null)
        }
      }
    )

    socket.on('disconnect', () => {
      const userId = users.get(socket.id);
      users.delete(socket.id);
      // eslint-disable-next-line no-console
      console.log(`🔴 User disconnected: ${socket.id} (userId: ${userId})`)

      // Notify other users that user is offline
      if (userId) {
        io.emit('user-offline', userId)
      }
    })
  })

  return io
}

module.exports = initializeWebSocket
