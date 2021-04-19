const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://cluster0.iyigi.mongodb.net/adasik_one', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.once('open', () => {
    console.log('Connected to database');
});

mongoose.connection.on('error', err => {
    console.log('Error in connecting to database is: ', err);
});

require('../model/CookieSession');
require('../model/ModifiedProperty');
require('../model/User');
require('../model/Messenger');
require('../model/Friend');
require('../model/Challenge');
require('../model/Game');
require('../model/Test');
require('../model/History');
require('../model/DailyAssignment');
require('../model/WebsitePageviewSession');
require('../model/Online');
require('../model/AllGame');
require('../model/ChallengeQueue');
require('../model/Ranking');
require('../model/Setting');
require('../model/Block');
require('../model/Like');
require('../model/Report');
require('../model/AllTest');
require('../model/DeletedUser');