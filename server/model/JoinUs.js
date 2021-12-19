const mongoose = require('mongoose');

const joinUsSchema = new mongoose.Schema({
    name: String,
    userId: mongoose.Schema.Types.ObjectId,
    message: String
});

mongoose.model('JoinUs', joinUsSchema);
