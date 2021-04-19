const jwt = require('jsonwebtoken');
const keys = require('../config/keys');
const decrypt = require('../utils/decrypt');
const store = require('../utils/store');

function onMainSocketConnect(socket) {
    socket.on('encryptedMessage', onEncryptedMessage);
}

async function onEncryptedMessage(message) {
    if (message.text) {
        const decryptedMessage = decrypt(message.text);
        const messageJwt = jwt.sign({ username: decryptedMessage }, keys.JWT_SOCKET_SECRET);
        // we send this to the server to make sure we're authenticated
        const authorization = 'Bearer ' + messageJwt;

        return store.authorization = {
            [decryptedMessage]: authorization
        };
    }
}

module.exports = {
    onMainSocketConnect
};