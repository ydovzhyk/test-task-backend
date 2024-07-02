const Joi = require("joi");
const { Schema, model } = require("mongoose");

const { handleSaveErrors } = require("../helpers");

const orderSchema = new Schema(
  {
    dateCreated: {
      type: Date,
      default: Date.now,
    },
    apartmentId: {
      type: String,
      required: true,
    },
    guestId: {
      type: String,
      required: true,
    },
    guestEmail: {
      type: String,
      required: true,
    },
    guestName: {
      type: String,
      required: true,
    },
    dateFrom: {
      type: String,
      required: true,
    },
    dateTo: {
      type: String,
      required: true,
    },
    numberRooms: {
      type: String,
      required: true,
    },
    numberAdults: {
      type: String,
      required: true,
    },
    numberChildren: {
      type: String,
      required: true,
    },
  },
  { minimize: false }
);

orderSchema.post("save", handleSaveErrors);

const Order = model("order", orderSchema);

const addOrderSchema = Joi.object({
  apartmentId: Joi.string().required(),
  guestId: Joi.string().required(),
  guestEmail: Joi.string().required(),
  guestName: Joi.string().required(),
  dateFrom: Joi.string().required(),
  dateTo: Joi.string().required(),
  numberRooms: Joi.number().required(),
  numberAdults: Joi.number().required(),
  numberChildren: Joi.number().required(),
});

const schemas = {
  addOrderSchema,
};

module.exports = {
  Order,
  schemas,
};
