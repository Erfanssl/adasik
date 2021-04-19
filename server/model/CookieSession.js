const mongoose = require('mongoose');

const cookieSessionSchema = new mongoose.Schema({
    info: String,
    expire: {
        type: Date,
        default: Date.now() + (5 * 1000 * 60 * 60 * 24) /* 5 days */
    }
}, { timestamps: true });

mongoose.model('CookieSession', cookieSessionSchema);