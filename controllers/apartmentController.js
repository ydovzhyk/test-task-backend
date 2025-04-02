const fs = require("fs");
const { Apartment } = require("../models/apartment");
const { User } = require("../models/user");
const { bucket } = require("../firebaseConfig");
const moment = require("moment");
const { allReviews } = require('../feedback')

const {
  RequestError,
  sendMail,
  updatePhoto,
  deletePhoto,
} = require("../helpers");

const createApartment = async (req, res, next) => {
  const {
    title,
    location,
    description,
    owner,
    accommodation,
    price,
    category,
    servicesList,
    mainImage,
    geoCoords,
  } = req.body;
  const { _id } = req.user;
  const finalLocation = JSON.parse(location);
  const finalOwner = {
    ...JSON.parse(owner),
    id: _id,
  };
  const finalPrice = JSON.parse(price);
  const finalAccommodation = JSON.parse(accommodation);
  const finalGeoCoords = JSON.parse(geoCoords);
  const finalServicesList = servicesList.split(",");

  const files = req.files || [];
  const mainImageFile = files.find((file) => file.originalname === mainImage);

  try {
    let mainImageUrl = "";
    if (mainImageFile) {
      const mainImageStorageFile = bucket.file(
        `apartment/images/${Date.now()}_${mainImageFile.originalname}`
      );
      await mainImageStorageFile.save(fs.readFileSync(mainImageFile.path));
      mainImageUrl = await mainImageStorageFile.getSignedUrl({
        action: "read",
        expires: "03-01-2500",
      });
      mainImageUrl = mainImageUrl[0];
    }

    const imageUploadPromises = files
      .filter((file) => file !== mainImageFile)
      .map(async (file) => {
        const storageFile = bucket.file(
          `apartment/images/${Date.now()}_${file.originalname}`
        );
        await storageFile.save(fs.readFileSync(file.path));
        const imageUrl = await storageFile.getSignedUrl({
          action: "read",
          expires: "03-01-2500",
        });
        return imageUrl[0];
      });

    const imagesLink = await Promise.all(imageUploadPromises);

    files.forEach((file) => {
      fs.unlink(file.path, (err) => {
        if (err) {
          // eslint-disable-next-line no-console
          console.error(`Помилка при видаленні файлу ${file.path}:`, err)
        }
      });
    });

    const newApartment = new Apartment({
      title,
      location: finalLocation,
      description,
      owner: finalOwner,
      accommodation: finalAccommodation,
      price: finalPrice,
      category: category,
      servicesList: finalServicesList,
      mainImage: mainImageUrl,
      imagesLink,
      geoCoords: finalGeoCoords,
      
    });

    const savedApartment = await newApartment.save();

    await User.findByIdAndUpdate(
      _id,
      { $push: { apartmentList: savedApartment._id } },
      { new: true }
    );

    res
      .status(201)
      .json({ message: "Your apartments have been added to the database." });
  } catch (error) {
    res.status(400).send({
      message:
        "There was an error saving the apartments, please try again later.",
    });
  }
};

const getFiltredApartmentsList = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const city = req.query.city || "Всі міста";
    const price = parseInt(req.query.price) || 0;

    const limit = 12;
    const skip = (page - 1) * limit;

    const query = {};

    if (city !== "Всі міста") {
      query["location.city"] = city;
    }
    query["price.value"] = { $gte: price };

    const [apartments, totalApartments] = await Promise.all([
      Apartment.find(query).skip(skip).limit(limit),
      Apartment.countDocuments(query),
    ]);
    const totalPages = Math.ceil(totalApartments / limit);

    res.status(200).json({
      apartments,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    next(error);
  }
};

const getApartmentById = async (req, res, next) => {
  // const getRandomInt = (min, max) => {
  //   return Math.floor(Math.random() * (max - min + 1)) + min
  // }

  // const shuffleArray = (array) => {
  //   return [...array].sort(() => 0.5 - Math.random())
  // }
  try {
    const { id } = req.params
    const apartment = await Apartment.findById(id)

    if (!apartment) {
      return res.status(404).json({ message: 'Apartment not found' })
    }
    // Generate random number of feedbacks between 11 and 25
    // const apartments = await Apartment.find()

    // for (const apartment of apartments) {
    //   const numberOfFeedbacks = getRandomInt(11, 25)
    //   const shuffled = shuffleArray(allReviews)
    //   const selectedFeedbacks = shuffled.slice(0, numberOfFeedbacks)

    //   const averageRanking =
    //     selectedFeedbacks.reduce(
    //       (acc, item) => acc + parseFloat(item.ranking),
    //       0
    //     ) / selectedFeedbacks.length

    //   apartment.usersFeedback = selectedFeedbacks
    //   apartment.ranking = Number(averageRanking.toFixed(1))

    //   await apartment.save()
    // }

    res.status(200).json(apartment)
  } catch (error) {
    next(error);
  }
};

const checkApartmentAvaibility = async (req, res, next) => {
  try {
    const {
      city,
      dateFrom,
      dateTo,
      numberRooms,
      numberAdults,
      numberChildren,
      petsAllowed,
      days,
      propertyType,
      apartmentId,
    } = req.body

    let apartment = await Apartment.findById(apartmentId)

    if (!apartment) {
      return res.status(404).json({
        message: 'Apartment not found.',
        status: false,
      })
    }

    if (!apartment.accommodation || !apartment.accommodation.livingRooms) {
      apartment.accommodation = {
        livingRooms: '1',
        qtyAdults: '2',
        qtyChildrens: '1',
      }
    }

    if (!apartment.bookingDates) {
      apartment.bookingDates = []
    }

    apartment = await apartment.save()

    // 🔹 Створюємо об'єкт для відповіді
    const responseData = {
      dateFrom,
      dateTo,
      numberRooms,
      numberAdults,
      numberChildren,
      apartmentId,
    }

    // 🔹 1. Перевірка відповідності кількості кімнат, дорослих та дітей
    const { livingRooms, qtyAdults, qtyChildrens } = apartment.accommodation
    if (
      Number(livingRooms) < Number(numberRooms) ||
      Number(qtyAdults) < Number(numberAdults) ||
      Number(qtyChildrens) < Number(numberChildren)
    ) {
      return res.status(200).json({
        message:
          'Unfortunately, the apartment does not meet the selected criteria.',
        status: false,
        ...responseData,
      })
    }

    // 🔹 2. Перевірка можливості проживання з тваринами
    if (petsAllowed && !apartment.servicesList.includes('Pets Allowed')) {
      return res.status(200).json({
        message: 'Unfortunately, this apartment does not allow pets.',
        status: false,
        ...responseData,
      })
    }

    // 🔹 3. Перевірка наявності дат у bookingDates
    const requestedDates = []
    const currentDate = moment(dateFrom, 'MM/DD/YYYY')

    while (currentDate.isSameOrBefore(moment(dateTo, 'MM/DD/YYYY'))) {
      requestedDates.push(currentDate.format('MM/DD/YYYY'))
      currentDate.add(1, 'days')
    }

    const isAvailable = requestedDates.every(
      (date) => !apartment.bookingDates.includes(date)
    )

    if (!isAvailable) {
      return res.status(200).json({
        message:
          'Unfortunately, the apartment is not available for the selected dates.',
        status: false,
        ...responseData,
      })
    }

    // 🔹 4. Успішна відповідь
    return res.status(200).json({
      message: 'The apartment is available for the selected criteria.',
      status: true,
      ...responseData,
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error checking apartment availability:', error)
    next(error)
  }
}


const mongoose = require("mongoose");

const likeApartment = async (req, res, next) => {
  try {
    const { _id } = req.user;
    let { propertyId: id } = req.body;

    // Конвертуємо id у ObjectId, якщо він ще не у цьому форматі
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid property ID format." });
    }
    id = new mongoose.Types.ObjectId(id);

    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isLiked = user.likedApartments.some((aptId) => aptId.equals(id));

    await User.findByIdAndUpdate(
      _id,
      isLiked
        ? { $pull: { likedApartments: id } } // Видаляємо, якщо є
        : { $addToSet: { likedApartments: id } }, // Додаємо, якщо ще немає
      { new: true }
    );

    res.status(200).json({
      message: isLiked
        ? "This property has been removed from your upcoming trips."
        : "This property has been saved to your upcoming trips.",
    });
  } catch (error) {
    next(error);
  }
};

const getTypesApartmentArray = async (req, res, next) => {
  try {
    const categories = [
      "hotel",
      "apartment",
      "resort",
      "cottages",
      "holiday home",
      "villas",
    ];

    const propertyTypesArray = await Promise.all(
      categories.map(async (category) => {
        const result = await Apartment.aggregate([
          { $match: { category } },
          { $sample: { size: 1 } },
        ]);

        return result.length > 0 ? result[0] : null;
      })
    );

    const filteredArray = propertyTypesArray.filter(Boolean);

    res.status(200).json({ propertyTypes: filteredArray });
  } catch (error) {
    next(error);
  }
};



module.exports = {
  createApartment,
  getFiltredApartmentsList,
  getApartmentById,
  checkApartmentAvaibility,
  likeApartment,
  getTypesApartmentArray,
};
