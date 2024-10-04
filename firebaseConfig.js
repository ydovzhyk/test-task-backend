const admin = require("firebase-admin");

const serviceAccount = {
  type: "service_account",
  project_id: "apartment-rent-yd",
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email:
    "firebase-adminsdk-y9fjl@apartment-rent-yd.iam.gserviceaccount.com",
  client_id: "118316312367783203782",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-y9fjl%40apartment-rent-yd.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "apartment-rent-yd.appspot.com",
});

const bucket = admin.storage().bucket();

module.exports = { admin, bucket };
