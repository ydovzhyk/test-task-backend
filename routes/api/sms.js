const express = require("express");
const { sendSMS } = require("../../helpers/sendSMS");

const router = express.Router();

router.post("/send-sms", async (req, res) => {
  const { to, body } = req.body;

  try {
    const message = await sendSMS(to, body);
    console.log(`SMS sent: ${message.sid}`);
    res.status(200).send(`SMS sent: ${message.sid}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error sending SMS");
  }
});

module.exports = router;
