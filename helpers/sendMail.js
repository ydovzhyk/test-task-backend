require("dotenv").config();
const sgMail = require("@sendgrid/mail");

const { SENDGRID_API_KEY, SENDGRID_SENDER, USER_EMAIL } = process.env;

const sendMail = async (text) => {
  sgMail.setApiKey(SENDGRID_API_KEY);

  const msg = {
    to: USER_EMAIL ? USER_EMAIL : "ydovzhyk@gmail.com",
    from: SENDGRID_SENDER,
    subject: "Новий користувач записався на зустріч",
    text: text,
    html: `<p>${text}</p>`,
  };

  try {
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

module.exports = sendMail;
