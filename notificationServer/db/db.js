const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://dbMrUser:H16$78Mf3@cluster0.cdsnt.mongodb.net/adasik_notification_one?retryWrites=true&w=majority', {
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
