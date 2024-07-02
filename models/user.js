const Joi = require("joi");
const { Schema, model } = require("mongoose");

const { handleSaveErrors } = require("../helpers");

const emailRegexp =
  /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "User Name is required"],
      minlength: 2,
      maxLength: 25,
    },
    name: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: emailRegexp,
    },
    phone: {
      type: String,
      default: "",
    },
    aboutUser: {
      type: String,
      default: "",
    },
    passwordHash: {
      type: String,
      required: [true, "Set password for user"],
      minlength: 6,
    },
    userAvatar: {
      type: String,
    },
    apartmentList: {
      type: [String],
      default: [],
      required: false,
    },
    ordersForRent: {
      type: [String],
      default: [],
      required: false,
    },
    messages: {
      type: [
        {
          allMessages: {
            type: [String],
            default: [],
          },
          newMessages: {
            type: [String],
            default: [],
          },
        },
      ],
      default: [],
    },
  },

  { minimize: false }
);

userSchema.post("save", handleSaveErrors);

const User = model("user", userSchema);

const registerSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().min(6).required(),
  username: Joi.string().required(),
  userAvatar: Joi.string().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().min(6).required(),
});

const refreshTokenSchema = Joi.object({
  sid: Joi.string().required(),
});

const editUserSchema = Joi.object({
  aboutUser: Joi.string().allow(null, ""),
  email: Joi.string().pattern(emailRegexp).required().allow(null, ""),
  name: Joi.string().allow(null, ""),
  phone: Joi.string().allow(null, ""),
  userAvatar: Joi.string().required().allow(null, ""),
  username: Joi.string().required().allow(null, ""),
});

const schemas = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  editUserSchema,
};

module.exports = {
  User,
  schemas,
};
