const express = require("express");
const { ctrlWrapper } = require("../../helpers");
const ctrl = require("../../controllers/chatController");

const {
  authorize,
} = require("../../middlewares");
const router = express.Router();

// *Get user chats
router.get('/getChats', authorize, ctrlWrapper(ctrl.getUserChats));

module.exports = router