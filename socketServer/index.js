const express = require('express');
const socketio = require('socket.io');
const { onMainSocketConnect } = require('./namespaces/main');
const { onPageviewSocketConnect } = require('./namespaces/pageview');
const { onStatusSocketConnect } = require('./namespaces/status');
const { onGameSocketConnect } = require('./namespaces/game');
const { onMessengerSocketConnect } = require('./namespaces/messengerStatus');
// const mainSocketConnection = require('./utils/mainSocketConnection');
const makeRequest = require('./utils/makeRequest');
const jwt = require('jsonwebtoken');
const keys = require('./config/keys');
const store = require('./utils/store');

const app = express();

const namespaces = {
    main: '/',
    pageview: '/pageview',
    status: '/status',
    messenger: '/messenger',
    game: '/game'
}

const httpServer = app.listen(4500, () => {
    console.log('Socket Server is up on port 4500');
});

const io = socketio(httpServer, {
    cors: {
        origin: 'http://127.0.0.1:3000',
        methods: ['GET', 'POST']
    }
});

// contains main socket connection and other connection that depend on its information
// mainSocketConnection(io);

// namespaces that they don't need main socket connection information
io.of('/pageview').on('connection', onPageviewSocketConnect);

io.of('/status').on('connection', onStatusSocketConnect);
io.of('/messenger').on('connection', onMessengerSocketConnect);
io.of('/game').on('connection', onGameSocketConnect);


setInterval(() => {
    // we send the data to the route in the back-end
    // constructing data
    const data = {};
    Object.values(namespaces).forEach(n => {
        data[n] = io.of(n).sockets.size;
    });

    const dataJwt = jwt.sign(data, keys.JWT_ONLINE_SECRET);

    makeRequest('http://127.0.0.1:3000/api/online', 'post', {
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: dataJwt })
    });
}, 600000);