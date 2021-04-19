const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        unique: true
    },
    totalScore: [Number],
    trainingScore: [Number],
    rank: [Number],
    assignment: [Number]
});

mongoose.model('History', historySchema);