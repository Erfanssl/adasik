const statusHandler = require('../utils/statusHandler');
const store = require('../utils/store');

const statusStore = store.status;
const messengerStore = store.messenger;

async function onStatusSocketConnect(socket) {
    statusHandler('http://127.0.0.1:3000/api/status', socket, 'general');

    socket.on('new-message', ({ toUsername }) => {
        if (!messengerStore[toUsername] && statusStore[toUsername]) {
            socket.to(statusStore[toUsername]).emit('new-message', { id: socket.id });
        }
    });

    socket.on('friend-request', ({ toUsername }) => {
        if (statusStore[toUsername]) {
            socket.to(statusStore[toUsername]).emit('friend-request');
        }
    });

    socket.on('challenge-request', ({ toUsername }) => {
        if (statusStore[toUsername]) {
            socket.to(statusStore[toUsername]).emit('challenge-request');
        }
    });

    socket.on('challenge-turn', ({ toUsername }) => {
        if (statusStore[toUsername]) {
            socket.to(statusStore[toUsername]).emit('challenge-turn');
        }
    });
}

module.exports = {
    onStatusSocketConnect
};