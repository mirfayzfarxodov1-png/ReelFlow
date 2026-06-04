const admin = require('firebase-admin');
const serviceAccount = require('./config/firebase-adminsdk.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://reelflow.firebaseio.com'
});

const messaging = admin.messaging();

module.exports = { admin, messaging };
