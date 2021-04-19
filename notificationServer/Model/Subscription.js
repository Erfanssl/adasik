const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    userId: {
        type: String,
        index: true
    },
    endpoint: String,
    keys: {
        auth: String,
        p256dh: String
    }
});

mongoose.model('Subscription', subscriptionSchema);