const mongoose = require('mongoose');

const allGameSchema = new mongoose.Schema({
    name: String,
    type: String,
    howToPlay: String,
    bestPlayers: [
        {
            userId: mongoose.Schema.Types.ObjectId,
            score: Number
        }
    ],
    categories: [{
        name: String,
        sign: String,
        coefficient: Number
    }],
    information: String,
    icon: String,
    url: String
}, { timestamps: true });

mongoose.model('AllGame', allGameSchema);