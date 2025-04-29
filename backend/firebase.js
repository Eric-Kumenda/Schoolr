const admin = require('firebase-admin');
const serviceAccount = require('./config/schoolr-32521-firebase-adminsdk-fbsvc-fe74339684.json'); // Download from Firebase console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = db;
