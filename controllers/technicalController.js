const fs = require("fs");
const { Appointment } = require("../models/appointment");
const { Event } = require("../models/event");
const { Review } = require("../models/review");

const {
  RequestError,
  sendMail,
  sendSMS,
  updatePhoto,
  deletePhoto,
} = require("../helpers");

const addAppointment = async (req, res, next) => {
  const { phone, parentName, childrenName, question, fromPage } = req.body;
  try {
    const newAppointment = await Appointment.create({
      phone,
      parentName,
      childrenName,
      question: question ? question : "",
      fromPage: fromPage ? fromPage : "",
    });

    let text = `Добрий день,`;
    text += `<br><br>користувач ${newAppointment.parentName} записався на зустріч з вами на рахунок його дитини ${newAppointment.childrenName}. Телефон для зв'язку: ${newAppointment.phone}.`;
    if (question) {
      text += `<br><br>Також, користувач ${newAppointment.parentName} залишив запитання: ${newAppointment.question}.`;
    }
    text += `<br><br>Переглянути увесь список користувачів записаних на зустріч, ви можете на сторінці "Зустрічі" адміністративного режиму сайту <a href="https://middleway.in.ua/?password=12345">посилання</a>.`;

    let textSMS = `Добрий день,`;
    textSMS += " ";
    textSMS += `користувач ${newAppointment.parentName} записався на зустріч з вами на рахунок його дитини ${newAppointment.childrenName}. Телефон для зв'язку: ${newAppointment.phone}.`;
    if (question) {
      text += `Також, користувач ${newAppointment.parentName} залишив запитання: ${newAppointment.question}.`;
    }
    textSMS += " ";
    textSMS += ` Переглянути увесь список користувачів записаних на зустріч, ви можете на сторінці "Зустрічі" адміністративного режиму сайту https://middleway.in.ua/?password=12345`;

    const resultMail = await sendMail(text);
    const resultSMS = await sendSMS(textSMS);

    if (resultMail && resultSMS && newAppointment) {
      res.status(201).send({
        message:
          "ДЯКУЄМО ЗА ЗВЕРНЕННЯ! Ваша заявка відправлена, ми зв’яжемося з вами найближчим часом.",
      });
    } else {
      throw new Error("Failed to send email");
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message:
        "Виникла помилка відправлення заявки, спробуйте інший спосіб зв'язатися з нами.",
    });
    return;
  }
};

const addEvent = async (req, res, next) => {
  try {
    const { subject_ukr, description_ukr, subject_rus, description_rus, date } =
      req.body;

    const photo = req.file;
    let newEvent = null;

    if (photo) {
      const tempUpload = await updatePhoto(photo);

      const img = fs.readFileSync(tempUpload, "base64");
      const final_img = {
        contentType: req.file.mimetype,
        image: Buffer.from(img, "base64"),
      };

      const photoURL =
        "data:image/png;base64," +
        Buffer.from(final_img.image).toString("base64");

      newEvent = await Event.create({
        subject_ukr,
        description_ukr,
        subject_rus,
        description_rus,
        date,
        photo: photoURL,
      });

      await deletePhoto(tempUpload);
    } else {
      newEvent = await Event.create({
        subject_ukr,
        description_ukr,
        subject_rus,
        description_rus,
        date,
        photo: "",
      });
    }

    if (!newEvent) {
      throw new Error("Виникла помилка створення події, спробуйте пізніше.");
    } else {
      res.status(201).send({
        message: "Ваша подія успішно створена.",
      });
    }
  } catch (error) {
    res.status(400).send({
      message: "Виникла помилка створення події, спробуйте пізніше.",
    });
    return;
  }
};

const editEvent = async (req, res, next) => {
  try {
    const {
      id,
      subject_ukr,
      description_ukr,
      subject_rus,
      description_rus,
      date,
    } = req.body;

    let currentEvent = await Event.findById(id);

    if (!currentEvent) {
      res.status(404).send({
        message: "Такої події у базі не знайдено",
      });
    }

    const photo = req.file;

    if (photo) {
      const tempUpload = await updatePhoto(photo);

      const img = fs.readFileSync(tempUpload, "base64");
      const final_img = {
        contentType: req.file.mimetype,
        image: Buffer.from(img, "base64"),
      };

      const photoURL =
        "data:image/png;base64," +
        Buffer.from(final_img.image).toString("base64");

      currentEvent.subject_ukr = subject_ukr;
      currentEvent.description_ukr = description_ukr;
      currentEvent.subject_rus = subject_rus;
      currentEvent.description_rus = description_rus;
      currentEvent.date = date;
      currentEvent.photo = photoURL;

      await currentEvent.save();

      await deletePhoto(tempUpload);
    } else {
      currentEvent.subject_ukr = subject_ukr;
      currentEvent.description_ukr = description_ukr;
      currentEvent.subject_rus = subject_rus;
      currentEvent.description_rus = description_rus;
      currentEvent.date = date;

      await currentEvent.save();
    }

    res.status(201).send({
      message: "Подія успішно відредагована.",
    });
  } catch (error) {
    res.status(400).send({
      message: "Виникла помилка створення події, спробуйте пізніше.",
    });
    return;
  }
};

const getEventsData = async (req, res, next) => {
  try {
    const { date } = req.params;
    const month = date.split(".")[1];
    let events = await Event.find({ date: { $regex: `${month}\\.` } });

    events.sort((a, b) => {
      const [dayA, monthA, yearA] = a.date.split(".").map(Number);
      const [dayB, monthB, yearB] = b.date.split(".").map(Number);

      const dateA = new Date(yearA, monthA - 1, dayA);
      const dateB = new Date(yearB, monthB - 1, dayB);

      return dateA - dateB;
    });

    const eventsDates = events.map((event) => {
      const [day, month, year] = event.date.split(".");
      return new Date(year, month - 1, day);
    });

    res.status(200).send({
      events: events,
      eventsDates: eventsDates,
    });
  } catch (error) {
    res.status(400).send({
      message: "Виникла помилка отримання подій, спробуйте пізніше.",
    });
  }
};

const deleteEvnet = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    await Event.deleteOne({ _id: eventId });

    res.status(200).send({
      message: "Подія успішно видалена.",
    });
  } catch (error) {
    res.status(400).send({
      message: "Виникла помилка видалення подій, спробуйте пізніше.",
    });
  }
};

const addReview = async (req, res, next) => {
  try {
    const { nameOwnerReview, dataSource, review, date } = req.body;

    const photo = req.file;
    let newReview = null;

    if (photo) {
      const tempUpload = await updatePhoto(photo);

      const img = fs.readFileSync(tempUpload, "base64");
      const final_img = {
        contentType: req.file.mimetype,
        image: Buffer.from(img, "base64"),
      };

      const photoURL =
        "data:image/png;base64," +
        Buffer.from(final_img.image).toString("base64");

      newReview = await Review.create({
        nameOwnerReview,
        dataSource: dataSource ? dataSource : "",
        review,
        date,
        photo: photoURL,
      });

      await deletePhoto(tempUpload);
    } else {
      newReview = await Event.create({
        nameOwnerReview,
        dataSource: dataSource ? dataSource : "",
        review,
        date,
        photo: "",
      });
    }

    if (!newReview) {
      throw new Error("Виникла помилка створення відгуку, спробуйте пізніше.");
    } else {
      res.status(201).send({
        message: "Відгук успішно створено.",
      });
    }
  } catch (error) {
    res.status(400).send({
      message: "Виникла помилка створення відгуку, спробуйте пізніше.",
    });
    return;
  }
};

const getReviewsList = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = 5;
  try {
    const totalReviews = await Review.countDocuments();

    const reviews = await Review.find()
      .sort({ dateCreated: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage);

    res.status(200).json({
      reviews,
      totalPagesReview: Math.ceil(totalReviews / perPage),
    });
  } catch (erroer) {
    res.status(400).send({
      message:
        "Виникла помилка отримання інформації про відгуки, спробуйте пізніше.",
    });
    return;
  }
};

module.exports = {
  addAppointment,
  addEvent,
  getEventsData,
  deleteEvnet,
  editEvent,
  addReview,
  getReviewsList,
};
