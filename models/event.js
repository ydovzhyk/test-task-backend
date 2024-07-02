const Joi = require("joi");
const { Schema, model } = require("mongoose");

const { handleSaveErrors } = require("../helpers");

const eventSchema = new Schema(
  {
    subject_ukr: {
      type: String,
      required: [true, "Subject is required"],
    },
    description_ukr: {
      type: String,
      required: [true, "Description is required"],
    },
    subject_rus: {
      type: String,
      required: [true, "Subject is required"],
    },
    description_rus: {
      type: String,
      required: [true, "Description is required"],
    },
    date: {
      type: String,
      required: [true, "Date is required"],
    },
    photo: {
      type: String,
    },
  },

  { minimize: false }
);

eventSchema.post("save", handleSaveErrors);

const Event = model("event", eventSchema);

const addEventSchema = Joi.object({
  subject_ukr: Joi.string().required(),
  description_ukr: Joi.string().required(),
  subject_rus: Joi.string().required(),
  description_rus: Joi.string().required(),
  date: Joi.string().required(),
  photo: Joi.any().meta({ index: true }).optional(),
});

const editEventSchema = Joi.object({
  subject_ukr: Joi.string().required(),
  description_ukr: Joi.string().required(),
  subject_rus: Joi.string().required(),
  description_rus: Joi.string().required(),
  date: Joi.string().required(),
  photo: Joi.any().meta({ index: true }).optional(),
  id: Joi.string().required(),
});

const eventsData = Joi.object({
  date: Joi.string().required(),
});

const schemasEvent = {
  addEventSchema,
  eventsData,
  editEventSchema,
};

module.exports = {
  Event,
  schemasEvent,
};
