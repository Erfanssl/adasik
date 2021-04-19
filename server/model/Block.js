const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        unique: true
    },
    blocks: [mongoose.Types.ObjectId],
    currentlyBlocking: Number, // this user blocked other users (active not all)
    userGotBlockedCounter: Number, // other users blocked this user
    userDidBlockCounter: Number // this user blocked other users (all of them)
}, { timestamps: true });

mongoose.model('Block', blockSchema);