const validateBody = require("./validateBody");
const validate = require("./validate");
const isValidId = require("./isValidId");
const authorize = require("./authorize");
const authenticateRefresh = require("./authenticateRefresh");
const upload = require("./upload");
const uploadFiles = require("./uploadFiles");
const passport = require("./google-auth");

module.exports = {
  authorize,
  validateBody,
  validate,
  isValidId,
  authenticateRefresh,
  uploadFiles,
  upload,
  passport,
};
