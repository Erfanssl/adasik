const mongoose = require('mongoose');

const websitePageviewSchema = new mongoose.Schema({
    pageviewUrl: String,
    timespent: Number,
    ip: String
}, { timestamps: true });

const websitePageviewSessionSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    deviceType: {
        type: String,
        enum: ['desktop', 'mobile', 'tablet']
    },
    httpReferer: String,
    pageviews: [websitePageviewSchema]
}, { timestamps: true });

mongoose.model('WebsitePageviewSession', websitePageviewSessionSchema);
