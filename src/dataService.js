const firebase = require('firebase/app');
require('firebase/database');

const config = {
    apiKey: "AIzaSyCbNn1VD1ZJQQ5bWUJ2Z5dgQnk1Lz3MIfs",
    authDomain: "jdc-fe-dev1-dailyreport.firebaseapp.com",
    databaseURL: "https://jdc-fe-dev1-dailyreport.firebaseio.com",
    storageBucket: "jdc-fe-dev1-dailyreport.appspot.com",
};

const app = firebase.initializeApp(config)

export default app.database();