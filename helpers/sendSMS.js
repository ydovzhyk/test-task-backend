const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const sendSMS = (body) => {
  return client.messages.create({
    body: body,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: process.env.USER_PHONE_NUMBER,
  });
};

module.exports = sendSMS;
