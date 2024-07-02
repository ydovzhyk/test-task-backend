const express = require("express");
const { ctrlWrapper } = require("../../helpers");
const ctrl = require("../../controllers/apartmentController");

const {
  validateBody,
  isValidId,
  authorize,
  upload,
  uploadFiles,
} = require("../../middlewares");
const { schemas } = require("../../models/apartment");

const router = express.Router();

// *Add apartment
router.post(
  "/create",
  uploadFiles.array("files"),
  authorize,
  //   validateBody(schemas.addApartmentSchema),
  ctrlWrapper(ctrl.createApartment)
);

//*Get filtred apartment
router.get("/filter", ctrlWrapper(ctrl.getFiltredApartmentsList));

//*Get apartment by Id
router.get("/:id", ctrlWrapper(ctrl.getApartmentById));

//*check avaibility apartment
router.post(
  "/check",
  validateBody(schemas.checkApartmentSchema),
  ctrlWrapper(ctrl.checkApartmentAvaibility)
);

module.exports = router;
