const express = require("express");
const { ctrlWrapper } = require("../../helpers");
const ctrl = require("../../controllers/ordersController");

const { validateBody, authorize } = require("../../middlewares");
const { schemas } = require("../../models/order");

const router = express.Router();

// *Add order
router.post(
  "/create",
  authorize,
  validateBody(schemas.addOrderSchema),
  ctrlWrapper(ctrl.createOrder)
);

module.exports = router;
