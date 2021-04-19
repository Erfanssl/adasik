const mongoose = require('mongoose');

const friendSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        unique: true
    },
    pending: [mongoose.Schema.Types.ObjectId],
    friends: [mongoose.Schema.Types.ObjectId],
    userReceivedRequestCounter: { // user receives
        accepted: Number,
        rejected: Number
    },
    userSentRequestCounter: {
        pending: Number,
        accepted: Number,
        rejected: Number
    }
}, { timestamps: true });

mongoose.model('Friend', friendSchema);