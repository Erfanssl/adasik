const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    target: mongoose.Schema.Types.ObjectId,
    reporter: mongoose.Schema.Types.ObjectId,
    isFriend: Boolean
}, { timestamps: true });

mongoose.model('Report', reportSchema);