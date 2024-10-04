// const mongoose = require("mongoose");
// const app = require("./app");

// mongoose.set('strictQuery', false);
// const { DB_HOST, PORT = 4000 } = process.env;

// mongoose
//   .connect(DB_HOST)
//   .then(() =>
//     app.listen(PORT, () => console.log("Database connection successful"))
//   )
//   .catch((error) => {
//     console.log(error.message);
//     process.exit(1);
//   });

const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const initializeWebSocket = require("./websocket.js");

mongoose.set("strictQuery", false);
require("dotenv").config();

const { DB_HOST, PORT = 4000 } = process.env;

// Підключення до MongoDB
mongoose
  .connect(DB_HOST)
  .then(() => {
    console.log("Database connection successful");

    // Створення HTTP-сервера
    const server = http.createServer(app);

    // Ініціалізація WebSocket-сервера
    const io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    // Ініціалізація WebSocket функціоналу
    initializeWebSocket(io);

    // Запуск сервера
    server.listen(PORT, () => {
      console.log(`Server listening at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error.message);
    process.exit(1);
  });
