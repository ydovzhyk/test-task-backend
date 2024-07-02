const fs = require("fs");
const { Apartment } = require("../models/apartment");
const { User } = require("../models/user");
const { Order } = require("../models/order");
const { Message } = require("../models/message");
const moment = require("moment");

const createOrder = async (req, res, next) => {
  const {
    apartmentId,
    guestId,
    guestEmail,
    guestName,
    dateFrom,
    dateTo,
    numberRooms,
    numberAdults,
    numberChildren,
  } = req.body;

  try {
    const newOrder = new Order({
      apartmentId,
      guestId,
      guestEmail,
      guestName,
      dateFrom,
      dateTo,
      numberRooms,
      numberAdults,
      numberChildren,
    });

    const savedOrder = await newOrder.save();
    const apartment = await Apartment.findById(apartmentId);
    const receiver = await User.findById(apartment.owner.id);
    const sender = await User.findById(guestId);

    const startDate = moment(dateFrom, "DD.MM.YYYY");
    const endDate = moment(dateTo, "DD.MM.YYYY");
    const duration = endDate.diff(startDate, "days");
    const totalPrice = Number(duration) * Number(apartment.price.value);

    const newMessage = new Message({
      subject: "Нове замовлення на помешкання",
      textSender: `Добрий день, ви забронювали житло у м.${apartment.location.city} в період з ${dateFrom} по ${dateTo}. Загальна вартість проживання становить ${totalPrice} ${apartment.price.currency}. Очикуйте на підвердження бронювання від власника.`,
      textReceiver: `Добрий день, користувач ${
        sender.username
      } зробив бронювання вашого житла за адресою м.${
        apartment.location.city
      }, вул. ${apartment.location.street}, буд. ${
        apartment.location.building
      } ${
        apartment.location.apartment
          ? `, кв. ${apartment.location.apartment}`
          : ""
      }. Перегляньте бронювання та підтвердість чи спростуйте його.`,
      sender: guestId,
      receiver: apartment.owner.id,
      addInformation: { apartment: apartmentId },
    });

    const savedMessage = await newMessage.save();

    console.log(savedMessage);

    const updateUser = await User.findByIdAndUpdate(
      guestId,
      { $push: { ordersForRent: savedOrder._id } },
      { new: true }
    );

    res.status(201).json({ message: "Ваші апартаменти додано у базу" });
  } catch (error) {
    res.status(400).send({
      message: "Виникла помилка збереження апартаментів, спробуйте пізніше",
    });
  }
};

module.exports = {
  createOrder,
};
