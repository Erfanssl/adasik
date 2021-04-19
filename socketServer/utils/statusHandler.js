const store = require('./store');
const decrypt = require('../utils/decrypt');
const keys = require('../config/keys');
const jwt = require('jsonwebtoken');

const makeRequest = require('../utils/makeRequest');
const statusStore = store.status;
const messengerStore = store.messenger;

function statusHandler(url, socket, type) {
    try {
        socket.on('data', (data) => {
            if (data && data.text) {
                const username = decrypt(data.text);

                if (type === 'messenger') messengerStore[username] = socket.id;
                else statusStore[username] = socket.id;
                // statusStore[username] = socket.id;

                const messageJwt = jwt.sign({ username }, keys.JWT_SOCKET_SECRET);
                // we send this to the server to make sure we're authenticated
                const authorization = 'Bearer ' + messageJwt;

                makeRequest(url, 'post', {
                    headers: {
                        Authorization: authorization,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ status: 'online' })
                })
                    .then(users => {
                        // we only try to send information to messenger namespace
                        if (type === 'messenger') {
                            users = JSON.parse(users);
                            // we get their socketId in the statusStore then we tell them that the user is online
                            const usersId = users.map(u => messengerStore[u]);

                            usersId.forEach(id => {
                                if (id) {
                                    socket.to(id).emit('userOnline', username);
                                }
                            });
                        }
                    })
                    .catch(err => {
                        throw err;
                    });


                // when client gets disconnected
                socket.on('disconnect', () => {
                    makeRequest(url, 'POST', {
                        headers: {
                            Authorization: authorization,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ status: 'offline' })
                    })
                        .then(users => {
                            if (statusStore[username]) delete statusStore[username];
                            if (type === 'messenger') {
                                if (messengerStore[username]) delete messengerStore[username];
                                users = JSON.parse(users);
                                // we get their socketId in the statusStore then we tell them that the user is offline
                                const usersId = users.map(u => messengerStore[u]);

                                usersId.forEach(id => {
                                    if (id) {
                                        socket.to(id).emit('userOffline', username);
                                    }
                                });
                            }
                        });
                });


            }
        });
    } catch (err) {

    }
}

module.exports = statusHandler;