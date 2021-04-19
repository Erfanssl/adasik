const mongoose = require('mongoose');

const modifiedPropertySchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    property: String,
    value: String
}, { timestamps: true });

mongoose.model('ModifiedProperty', modifiedPropertySchema);