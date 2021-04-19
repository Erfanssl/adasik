const mongoose = require('mongoose');

const onlineSchema = new mongoose.Schema({
    visitors: {}
}, { timestamps: true });

mongoose.model('Online', onlineSchema);