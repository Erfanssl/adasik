const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        unique: true
    },
    messenger: [String],
    privacy: [String],
    changedTimes: Number
}, { timestamps: true });

mongoose.model('Setting', settingSchema);