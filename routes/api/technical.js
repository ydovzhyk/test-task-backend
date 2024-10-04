const express = require("express");
const { ctrlWrapper } = require("../../helpers");
const ctrl = require("../../controllers/technicalController");

const {
  validateBody,
  isValidId,
  authorize,
  upload,
} = require("../../middlewares");
const { schemas } = require("../../models/appointment");
const { schemasEvent } = require("../../models/event");
const { schemasReview } = require("../../models/review");
const router = express.Router();

// *Add appointment
router.post(
  "/appointment",
  validateBody(schemas.addAppointmentSchema),
  ctrlWrapper(ctrl.addAppointment)
);

// *Add event
router.post(
  "/event",
  authorize,
  upload.single("photo"),
  validateBody(schemasEvent.addEventSchema),
  ctrlWrapper(ctrl.addEvent)
);

// *Get events dates and data
router.get(
  "/events/:date",
  //   validateBody(schemasEvent.eventsData),
  ctrlWrapper(ctrl.getEventsData)
);

// *Delete event
router.delete(
  "/event/delete/:eventId",
  authorize,
  isValidId,
  ctrlWrapper(ctrl.deleteEvnet)
);

// *Edit event
router.post(
  "/event/edit",
  authorize,
  upload.single("photo"),
  validateBody(schemasEvent.editEventSchema),
  ctrlWrapper(ctrl.editEvent)
);

// *Add review
router.post(
  "/review",
  authorize,
  upload.single("photo"),
  validateBody(schemasReview.addReviewSchema),
  ctrlWrapper(ctrl.addReview)
);

// *Edit review
router.post(
  "/review/edit",
  authorize,
  upload.single("photo"),
  validateBody(schemasReview.editReviewSchema),
  ctrlWrapper(ctrl.editReview)
);

router.get("/reviews", ctrlWrapper(ctrl.getReviewsList));

module.exports = router;
