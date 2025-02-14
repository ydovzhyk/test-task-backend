require("dotenv").config();
const sgMail = require("@sendgrid/mail");
const { SENDGRID_API_KEY, SENDGRID_SENDER } = process.env;

const sendMail = async (
  email,
  serverUrl,
  verificationToken,
  referer,
  message,
  logo
) => {
  sgMail.setApiKey(SENDGRID_API_KEY);

  const msg = {
    to: email,
    from: SENDGRID_SENDER,
    subject: message.title,
    text: message.text,
    html: `
      <div style="background-color: #0f1d2d; padding: 30px; border-radius: 10px; text-align: center; color: #ffffff; font-family: Arial, sans-serif;">
        <div style="margin-bottom: 20px;">
          <a href="${referer}" target="_blank">
            <img src="${logo}" alt="Site Logo" style="max-width: 150px; height: auto;">
          </a>
        </div>
        <h2 style="color: #ffffff; font-size: 24px;">${message.title}</h2>
        <p style="color: #d1d1d1; font-size: 16px;">${message.text}</p>
        <a href="${serverUrl}/auth/${verificationToken}?url=${referer}" target="_blank" 
          style="display: inline-block; padding: 12px 12px; background-color: #ff662d; color: #ffffff; font-size: 16px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
          Confirm Email
        </a>
        <p style="margin-top: 20px; font-size: 14px; color: #bbbbbb;">
          If you didn’t request this, you can ignore this email.
        </p>
      </div>
    `,
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
