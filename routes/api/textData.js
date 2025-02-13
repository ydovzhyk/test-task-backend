const express = require("express");
const { ctrlWrapper } = require("../../helpers");
const ctrl = require("../../controllers/textDataController");

const { validateBody, isValidId, authorize } = require("../../middlewares");
const { schemas } = require("../../models/textData");

const router = express.Router();

router.post(
  "/create",
  authorize,
  validateBody(schemas.addTextDataSchema),
  ctrlWrapper(ctrl.createTextData)
);

router.get("/search", authorize, ctrlWrapper(ctrl.searchTextData));

// router.delete(
//   "/delete/:textDataId",
//   authorize,
//   isValidId,
//   ctrlWrapper(ctrl.deleteTextData)
// );

module.exports = router;
