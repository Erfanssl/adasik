const mongoose = require('mongoose');

const allTestSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true
    },
    attempts: Number,
    type: String,
    information: String,
    icon: String
}, { timestamps: true });

mongoose.model('AllTest', allTestSchema);