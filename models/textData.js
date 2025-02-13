const Joi = require("joi");
const { Schema, model } = require("mongoose");

const { handleSaveErrors } = require("../helpers");

const textDataSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    transcription: {
      type: Array,
      required: true,
    },
    translation: {
      type: Array,
      required: true,
    },
  },
  { minimize: false }
);

textDataSchema.post("save", handleSaveErrors);

const TextData = model("textData", textDataSchema);

const addTextDataSchema = Joi.object({
  date: Joi.string().required(),
  topic: Joi.string().required(),
  transcription: Joi.array().required(),
  translation: Joi.array().required(),
});

const schemas = {
  addTextDataSchema,
};

module.exports = {
  TextData,
  schemas,
};
