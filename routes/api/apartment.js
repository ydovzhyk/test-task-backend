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

// *Get filtred apartment
router.get("/filter", ctrlWrapper(ctrl.getFiltredApartmentsList));

// *Сheck avaibility apartment
router.post(
  "/check",
  validateBody(schemas.checkApartmentSchema),
  ctrlWrapper(ctrl.checkApartmentAvaibility)
);

// *Like apartment
router.post(
  "/like",
  authorize,
  validateBody(schemas.likeApartmentSchema),
  ctrlWrapper(ctrl.likeApartment)
);

// *Get types apartment array
router.get("/type", ctrlWrapper(ctrl.getTypesApartmentArray));

// *Get apartment by Id
router.get("/:id", ctrlWrapper(ctrl.getApartmentById));


module.exports = router;
