const Joi = require("joi");
const { Schema, model } = require("mongoose");

const { handleSaveErrors } = require("../helpers");

const telRegexp = /^\+?3?8?\(?\d{3}\)?\d{3}(?:-?\d{2}){2}$/;

const appointmentSchema = new Schema(
  {
    phone: {
      type: String,
      required: [true, "Phone is required"],
      match: telRegexp,
    },
    parentName: {
      type: String,
      required: [true, "Parent Name is required"],
    },
    childrenName: {
      type: String,
      required: [true, "Children Name is required"],
    },
    question: {
      type: String,
      required: false,
    },
    fromPage: {
      type: String,
      required: false,
    },
    addComment: {
      type: String,
      required: false,
    },
    addCommentAuthor: {
      type: String,
      required: false,
    },
    dateCreated: {
      type: Date,
      default: Date.now,
    },
  },

  { minimize: false }
);

appointmentSchema.post("save", handleSaveErrors);

const Appointment = model("appointment", appointmentSchema);

const addAppointmentSchema = Joi.object({
  phone: Joi.string().pattern(telRegexp).required(),
  parentName: Joi.string().required(),
  childrenName: Joi.string().required(),
  question: Joi.string().allow(""),
  fromPage: Joi.string().allow(""),
});

const editAppointmentSchema = Joi.object({
  id: Joi.string().required(),
  comment: Joi.string().required(),
  commentAuthor: Joi.string().required(),
});

const schemas = {
  addAppointmentSchema,
  editAppointmentSchema,
};

module.exports = {
  Appointment,
  schemas,
};
