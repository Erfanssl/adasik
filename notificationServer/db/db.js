const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/adasik_notification_test_one', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.once('open', () => {
    console.log('Connected to Adasik notification database');
});

mongoose.connection.on('error', err => {
    console.log('Error connecting to Adasik notification database: ', err);
});

require('../Model/Subscription');