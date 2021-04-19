const statusHandler = require('../utils/statusHandler');
const store = require('../utils/store');
const messengerStore = store.messenger;

async function onMessengerSocketConnect(socket) {
    statusHandler('http://127.0.0.1:3000/api/messengerStatus', socket, 'messenger');

    socket.on('messageSent', ({ message, fromUsername, toUsername, userInfo }) => {
        // we check if the user is online, we should change the status of the message to delivered
        if (messengerStore[toUsername]) {
            // means receiver is online
            socket.to(messengerStore[toUsername]).emit('messageReceive', { message, fromUsername, userInfo });
        }
    });

    socket.on('messageUpdatedSent', ({ message, toUsername, isLast }) => {
        // we check if the user is online, we should change the status of the message to delivered
        if (messengerStore[toUsername]) {
            // means receiver is online
            socket.to(messengerStore[toUsername]).emit('messageUpdatedReceive', { message, isLast });
        }
    });

    socket.on('messageDeleted', ({ toUsername, message, isLast }) => {
        // we check if the user is online, we should change the status of the message to delivered
        if (messengerStore[toUsername]) {
            // means receiver is online
            socket.to(messengerStore[toUsername]).emit('messageDeletedReceive', { message, isLast });
        }
    });

    socket.on('messageReceiveStatus', ({ fromUsername, message, status }) => {
        if (messengerStore[fromUsername]) {
            // to check if receiver is online (which is actually the sender of the initial message)
            socket.to(messengerStore[fromUsername]).emit('messageDeliveredStatus', {
                messageId: message._id,
                personId: message.to,
                status
            });
        }
    });

    socket.on('messageSeenClient', ({ username, personId, messageId }) => {
        if (messengerStore[username]) {
            socket.to(messengerStore[username]).emit('messageSeenServer', {
                personId,
                messageId
            });
        }
    });

    // for handling is typing functionality
    socket.on('typing', ({ fromUsername, toUsername, isTyping, fullName }) => {
        if (messengerStore[toUsername]) {
            socket.to(messengerStore[toUsername]).emit('typing', { fromUsername, isTyping, fullName });
        }
    });

    // for handling is recording functionality
    socket.on('recording', ({ fromUsername, toUsername, isRecording, fullName }) => {
        if (messengerStore[toUsername]) {
            socket.to(messengerStore[toUsername]).emit('recording', { fromUsername, isRecording, fullName });
        }
    });
}


module.exports = {
    onMessengerSocketConnect
};