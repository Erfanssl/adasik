const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    gameId: mongoose.Schema.Types.ObjectId,
    type: {
        type: String,
        enum: ['training', 'challenge']
    },
    right: Number,
    wrong: Number,
    averageResponseTime: Number,
    maxBooster: Number,
    scoreChangedInType: {
        detailed: [{ name: String, amount: Number }],
        abstract: [{ name: String, amount: Number }]
    },
    score: {
        type: Number,
        required: true
    }
}, { timestamps: true });

const gameHolderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        unique: true
    },
    games: [gameSchema]
}, { timestamps: true });

mongoose.model('Game', gameHolderSchema);
