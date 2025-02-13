const fs = require("fs");
const { TextData } = require("../models/textData");
const { User } = require("../models/user");
const moment = require("moment");

const createTextData = async (req, res, next) => {
  const { date, topic, transcription, translation } = req.body;
  const { _id } = req.user;

  try {
    const newTextData = new TextData({
      date,
      topic,
      transcription,
      translation,
    });

    const savedTextData = await newTextData.save();

    await User.findByIdAndUpdate(_id, {
      $push: { textDataList: savedTextData._id },
    });

    res.status(201).json({
      message: "The record has been successfully added to the database.",
    });
  } catch (error) {
    res.status(400).send({
      message:
        "An error occurred while creating the record, please try again later.",
    });
  }
};

const searchTextData = async (req, res, next) => {
  const { text, page = 1 } = req.query;
  const limit = 5;
  const skip = (page - 1) * limit;

  try {
    const results = await TextData.find({
      _id: { $in: req.user.textDataList },
      $or: [
        { topic: { $regex: text, $options: "i" } },
        { transcription: { $regex: text, $options: "i" } },
        { translation: { $regex: text, $options: "i" } },
      ],
    })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    console.log(results);

    res.status(200).json({
      results,
      totalPages: Math.ceil(results.length / limit),
    });
  } catch (error) {
    console.error("Search error: ", error);
    res.status(500).send({
      message:
        "An error occurred while searching for information, please try again later.",
    });
  }
};

module.exports = {
  createTextData,
  searchTextData,
};
