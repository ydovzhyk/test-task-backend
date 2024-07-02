const Joi = require("joi");
const { Schema, model } = require("mongoose");

const { handleSaveErrors } = require("../helpers");

const messageSchema = new Schema(
  {
    subject: {
      type: String,
      required: true,
    },
    dateCreated: {
      type: Date,
      default: Date.now,
    },
    textSender: {
      type: String,
      required: true,
    },
    textReceiver: {
      type: String,
      required: true,
    },
    sender: {
      type: String,
      required: true,
    },
    receiver: {
      type: String,
      required: true,
    },
    addInformation: {
      type: Object,
      default: {},
    },
  },

  { minimize: false }
);

messageSchema.post("save", handleSaveErrors);

const Message = model("message", messageSchema);

const addMessageSchema = Joi.object({});

const schemasMessage = {
  addMessageSchema,
};

module.exports = {
  Message,
  schemasMessage,
};
