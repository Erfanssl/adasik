const mongoose = require('mongoose');

const activeChallengeSchema = new mongoose.Schema({
    home: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'You should provide who starts the challenge']
        },
        gamesInRounds: [new mongoose.Schema({
            gameId: mongoose.Schema.Types.ObjectId,
            finish: Boolean,
            score: Number,
            start: {
                type: Date,
                default: 0
            },
            round: Number,
            booster: Number,
            consecutiveTrue: Number,
            averageResponseTime: Number,
            right: Number,
            wrong: Number,
            maxBooster: Number,
            isOpen: {
                type: Boolean,
                default: true
            },
            oneTab: {
                type: Boolean,
                default: false
            }
        }, { timestamps: true })]
    },
    away: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'You should provide who is challenged']
        },
        gamesInRounds: [new mongoose.Schema({
            gameId: mongoose.Schema.Types.ObjectId,
            finish: Boolean,
            score: Number,
            start: {
                type: Date,
                default: 0
            },
            round: Number,
            booster: Number,
            consecutiveTrue: Number,
            averageResponseTime: Number,
            right: Number,
            wrong: Number,
            maxBooster: Number,
            isOpen: {
                type: Boolean,
                default: true
            },
            oneTab: {
                type: Boolean,
                default: false
            }
        }, { timestamps: true })]
    },
    turn: {
        type: String,
        enum: ['home', 'away'],
        required: [true, 'You should provide whose turn is it']
    },
    opponentChallengeId: mongoose.Schema.Types.ObjectId,
    url: String,
    pending: Boolean
}, { timestamps: true });

const inactiveChallengeSchema = new mongoose.Schema({
    home: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'You should provide who starts the challenge']
        },
        gamesInRounds: [new mongoose.Schema({
            gameId: mongoose.Schema.Types.ObjectId,
            finish: Boolean,
            score: Number,
            start: {
                type: Date,
                default: 0
            },
            round: Number
        }, { timestamps: true })],
        result: {
            type: String,
            enum: ['win', 'lose', 'draw']
        },
        increment: Number
    },
    away: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'You should provide who is challenged']
        },
        gamesInRounds: [new mongoose.Schema({
            gameId: mongoose.Schema.Types.ObjectId,
            finish: Boolean,
            score: Number,
            start: {
                type: Date,
                default: 0
            },
            round: Number
        }, { timestamps: true })],
        result: {
            type: String,
            enum: ['win', 'lose', 'draw']
        },
        increment: Number
    },
    opponentChallengeId: mongoose.Schema.Types.ObjectId,
    url: String,
    // gamesInRounds: [String], // name of the game in each round
    result: {
        type: String,
        enum: ['win', 'lose', 'draw']
    },
    close: {
        type: Boolean,
        default: false
    },
    increment: Number,
    endType: {
        type: String,
        enum: ['normal', 'time']
    }
}, { timestamps: true });


const challengeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        unique: true
    },
    challenges: {
        active: [activeChallengeSchema],
        inactive: [inactiveChallengeSchema]
    },
    requests: [mongoose.Schema.Types.ObjectId],
    userRequestCounter: { // user sends
        pending: Number,
        accepted: Number,
        rejected: Number
    }
}, { timestamps: true });

mongoose.model('Challenge', challengeSchema);