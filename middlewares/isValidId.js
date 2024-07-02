const { isValidObjectId } = require("mongoose");
const { RequestError } = require("../helpers");

const isValidId = (req, res, next) => {
  const eventId = req.params.eventId || req.body.eventId;
  const userId = req.params.userId || req.body.userId;

  try {
    const objectId = isValidObjectId(eventId) ? eventId : userId;
    if (!isValidObjectId(objectId)) {
      throw new Error("is not a valid ObjectId");
    }
    next();
  } catch (error) {
    next(RequestError(400, error.message));
  }
};

module.exports = isValidId;
