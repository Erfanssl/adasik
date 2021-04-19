const jwt = require('jsonwebtoken');
const keys = require('../config/keys');
const decrypt = require('./decrypt');
const store = require('./store');

const { onStatusSocketConnect } = require('../namespaces/status');
const { onMessengerSocketConnect } = require('../namespaces/messengerStatus');
const { onGameSocketConnect } = require('../namespaces/game');

function mainSocketConnection(io) {
    io.on('connection', (socket) => {
        socket.on('encryptedMessage', onEncryptedMessage);

        async function onEncryptedMessage(message) {
            if (message.text) {
                const decryptedMessage = decrypt(message.text);
                const messageJwt = jwt.sign({ username: decryptedMessage }, keys.JWT_SOCKET_SECRET);
                // we send this to the server to make sure we're authenticated
                const authorization = 'Bearer ' + messageJwt;

                store.authorization = {
                    [decryptedMessage]: authorization
                };

                // we make sure to run these when we have a authorization token
                io.of('/status').on('connection', onStatusSocketConnect);
                io.of('/messenger').on('connection', onMessengerSocketConnect);
                io.of('/game').on('connection', onGameSocketConnect);
            }
        }
    });
}

module.exports = mainSocketConnection;