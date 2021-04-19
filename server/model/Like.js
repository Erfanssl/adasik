const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        unique: true
    },
    likes: [mongoose.Types.ObjectId],
    dislikes: [mongoose.Types.ObjectId],
    userLikes: [mongoose.Types.ObjectId], // done by the user
    userDislikes: [mongoose.Types.ObjectId] // done by the user
}, { timestamps: true });

mongoose.model('Like', likeSchema);