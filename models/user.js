const Joi = require("joi");
const { Schema, model } = require("mongoose");
const { handleSaveErrors } = require("../helpers");

// const emailRegexp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const emailRegexp = /^([^\s@]+@[^\s@]+\.[^\s@]+|\w{4}-\s?\w{5}@gmail\.com)$/

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, 'User Name is required'],
      minlength: 2,
      maxlength: 25,
    },
    surname: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      unique: true,
      match: emailRegexp,
    },
    phone: {
      type: String,
      default: '',
      match: /^\+?[1-9]\d{1,14}$/,
    },
    passwordHash: {
      type: String,
      required: [true, 'Set password for user'],
      minlength: 6,
    },
    userAvatar: {
      type: String,
      default: '',
    },
    accessCode: {
      type: String,
      default: '',
    },
    country: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    sex: {
      type: String,
      enum: ['male', 'female', ''],
      default: '',
    },
    role: {
      type: String,
      enum: ['doctor', 'patient'],
      default: 'patient',
    },
    aboutUser: {
      type: String,
      default: '',
      maxlength: 500,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    chats: {
      type: [Schema.Types.ObjectId],
      ref: 'Chat',
      default: [],
    },
    apartmentList: {
      type: [Schema.Types.ObjectId],
      ref: 'Apartment',
      default: [],
    },
    likedApartments: {
      type: [Schema.Types.ObjectId],
      ref: 'Apartment',
      default: [],
    },
    ordersForRent: {
      type: [Schema.Types.ObjectId],
      ref: 'Order',
      default: [],
    },
    verificationToken: {
      type: String,
      default: '',
    },
    newMessages: {
      type: [Schema.Types.ObjectId],
      ref: 'Message',
      default: [],
    },
    textDataList: {
      type: [String],
      default: [],
    },
  },
  { minimize: false, timestamps: true }
)

userSchema.post("save", handleSaveErrors);

const User = model("user", userSchema);

const registerSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().min(6).required(),
  username: Joi.string().required(),
  userAvatar: Joi.string().required(),
  sex: Joi.string().optional()
})

const registerIncognitoSchema = Joi.object({
  accessCode: Joi.string().required(),
  password: Joi.string().required(),
  username: Joi.string().required(),
  userAvatar: Joi.string().required(),
})

const checkAccessCodeSchema = Joi.object({
  accessCode: Joi.string().required(),
})

const loginSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().min(6).required(),
});

const loginIncognitoSchema = Joi.object({
  accessCode: Joi.string().required(),
  password: Joi.string().min(6).required(),
})

const refreshTokenSchema = Joi.object({
  sid: Joi.string().required(),
});

const editUserSchema = Joi.object({
  username: Joi.string().min(2).max(25).optional().allow(""),
  surname: Joi.string().min(2).max(50).optional().allow(""),
  email: Joi.string().optional().allow(""),
  phone: Joi.string().optional().allow(""),
  userAvatar: Joi.string().optional().allow(""),
  country: Joi.string().optional().allow(""),
  city: Joi.string().optional().allow(""),
  address: Joi.string().optional().allow(""),
  sex: Joi.string().valid("male", "female", "").optional().allow(""),
  aboutUser: Joi.string().max(500).optional().allow(""),
  password: Joi.string().optional().allow(""),
});

const verifyEmailSchema = Joi.object({
  email: Joi.string().email().required(),
  location: Joi.string().optional(),
  message: Joi.object({
    text: Joi.string().required(),
    title: Joi.string().required(),
  }).required(),
});


const schemas = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  editUserSchema,
  verifyEmailSchema,
  checkAccessCodeSchema,
  registerIncognitoSchema,
  loginIncognitoSchema,
}

module.exports = {
  User,
  schemas,
};
