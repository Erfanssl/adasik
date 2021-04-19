const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    message: String,
    type: {
        type: String,
        enum: ['regular', 'reply', 'update', 'replyUpdate', 'deleteForMe', 'deleteForEveryone']
    },
    from: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'You need to provide who is this message from']
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'You need to provide who this message goes to']
    },
    status: {
        type: String,
        enum: ['seen', 'sent', 'delivered']
    },
    side: {
        type: String,
        enum: ['host', 'guest']
    },
    isBuf: Boolean,
    reply: mongoose.Schema.Types.ObjectId, // id of the message that user replied to if status is reply
    toMessageId: {
        type: mongoose.Schema.Types.ObjectId, // id of the same message of who users is talking to
        index: true
    }
}, { timestamps: true });


const messageHolderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        unique: true
    },
    persons: [{
        userId: mongoose.Schema.Types.ObjectId,
        username: String,
        messages: [messageSchema],
        unseen: Number
    }]
}, { timestamps: true });

mongoose.model('Messenger', messageHolderSchema);