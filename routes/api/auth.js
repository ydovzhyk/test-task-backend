const express = require("express");
const { ctrlWrapper } = require("../../helpers");
const ctrl = require("../../controllers/authController");

const {
  validateBody,
  isValidId,
  authorize,
  authenticateRefresh,
} = require("../../middlewares");
const { schemas } = require("../../models/user");
const router = express.Router();

// signup
router.post(
  "/register",
  validateBody(schemas.registerSchema),
  ctrlWrapper(ctrl.register)
);

// login
router.post(
  "/login",
  validateBody(schemas.loginSchema),
  ctrlWrapper(ctrl.login)
);

// logout
router.post("/logout", authorize, ctrlWrapper(ctrl.logout));

// refresh user
router.post(
  "/refresh",
  authenticateRefresh,
  validateBody(schemas.refreshTokenSchema),
  ctrlWrapper(ctrl.refresh)
);

module.exports = router;
