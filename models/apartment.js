const Joi = require("joi");
const { Schema, model } = require("mongoose");

const { handleSaveErrors } = require("../helpers");

const emailRegexp = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
const phoneRegexp = /^\+?[\d\s\-()]{10,15}$/;

const apartmentSchema = new Schema(
  {
    dateCreated: {
      type: Date,
      default: Date.now,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
    },
    location: {
      city: {
        type: String,
        required: true,
      },
      street: {
        type: String,
        required: true,
      },
      building: {
        type: String,
        required: true,
      },
      apartment: {
        type: String,
        required: false,
      },
    },
    geoCoords: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
      comments: {
        type: String,
        required: true,
      },
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    owner: {
      email: {
        type: String,
        required: [true, 'Email is required'],
        match: emailRegexp,
      },
      name: {
        type: String,
        required: [true, 'Name is required'],
      },
      phone: {
        type: String,
        required: [true, 'Phone is required'],
        match: phoneRegexp,
      },
      id: {
        type: String,
        required: true,
      },
    },
    accommodation: {
      livingRooms: {
        type: String,
        required: true,
      },
      qtyAdults: {
        type: String,
        required: true,
      },
      qtyChildrens: {
        type: String,
        required: true,
      },
    },
    price: {
      value: {
        type: String,
        required: [true, 'Value is required'],
      },
      currency: {
        type: String,
        required: [true, 'Currency is required'],
      },
    },
    category: {
      type: String,
      required: false,
    },
    servicesList: {
      type: [String],
      default: [],
      required: false,
    },
    mainImage: {
      type: String,
      required: false,
    },
    imagesLink: {
      type: [String],
      default: [],
      required: false,
    },
    bookingDates: {
      type: [String],
      required: false,
    },
    ranking: {
      type: Number,
      default: 0,
      required: false,
    },
    usersFeedback: {
      type: [
        {
          reviewOwnerName: {
            type: String,
            required: true,
          },
          reviewOwnerCountry: {
            type: String,
            required: true,
          },
          reviewData: {
            type: String,
            required: true,
          },
          reviewDate: {
            type: String,
            required: true,
          },
          reviewOwnerPhoto: {
            type: String,
            required: true,
          },
          ranking: {
            type: String,
            required: true,
          },
        },
      ],
      default: [],
      required: false,
    },
  },

  { minimize: false }
)

apartmentSchema.post("save", handleSaveErrors);

const Apartment = model("apartment", apartmentSchema);

const addApartmentSchema = Joi.object({
  title: Joi.string().required(),
  location: Joi.object({
    city: Joi.string().required(),
    street: Joi.string().required(),
    building: Joi.string().required(),
    apartment: Joi.string().allow(""),
  }),
  geoCoords: Joi.object({
    lat: Joi.number().required(),
    lng: Joi.number().required(),
    comments: Joi.string().required(),
  }),
  description: Joi.string().required(),
  owner: Joi.object({
    email: Joi.string().regex(emailRegexp).required(),
    name: Joi.string().required(),
    phone: Joi.string().regex(phoneRegexp).required(),
  }),
  price: Joi.object({
    value: Joi.string().required(),
    currency: Joi.string().required(),
  }),
  category: Joi.string().allow(""),
  servicesList: Joi.string().allow(""),
  mainImage: Joi.string().allow(""),
});

const checkApartmentSchema = Joi.object({
  city: Joi.string().allow('').optional(),
  numberAdults: Joi.number().integer().min(1).optional(),
  numberChildren: Joi.number().integer().min(0).optional(),
  numberRooms: Joi.number().integer().min(1).optional(),
  petsAllowed: Joi.boolean().optional(),
  dateFrom: Joi.string().required(),
  dateTo: Joi.string().required(),
  days: Joi.number().integer().min(1).optional(),
  propertyType: Joi.string().allow('').optional(),
  apartmentId: Joi.string().allow('').optional(),
})

const likeApartmentSchema = Joi.object({
  propertyId: Joi.string().required(),
});

const schemas = {
  addApartmentSchema,
  checkApartmentSchema,
  likeApartmentSchema,
}

module.exports = {
  Apartment,
  schemas,
};
