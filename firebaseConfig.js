const admin = require("firebase-admin");
const serviceAccount = require("./apartment-rent-yd-firebase-adminsdk-y9fjl-b85fd05347.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "apartment-rent-yd.appspot.com",
});

const bucket = admin.storage().bucket();

module.exports = { admin, bucket };
