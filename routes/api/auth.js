const express = require("express");
const { ctrlWrapper } = require("../../helpers");
const ctrl = require("../../controllers/authController");

const {
  validateBody,
  authorize,
  authenticateRefresh,
  upload,
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

// get current user
router.post("/current", authorize, ctrlWrapper(ctrl.getUserController));

// edit user
router.post(
  "/edit",
  authorize,
  validateBody(schemas.editUserSchema),
  ctrlWrapper(ctrl.editUserController)
);

// verify email
router.post(
  "/verify",
  upload.single("file"),
  authorize,
  // validateBody(schemas.verifyEmailSchema),
  ctrlWrapper(ctrl.verificationController)
);

router.get("/:verificationToken", ctrlWrapper(ctrl.verifyController));

module.exports = router;
