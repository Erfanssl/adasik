const mongoose = require('mongoose');

const rankingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        unique: true
    },
    rank: {
        type: Number,
        index: true
    },
    totalScore: {
        type: Number,
        index: true
    }
}, { timestamps: true });

mongoose.model('Ranking', rankingSchema);