require('./db/db');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieSession = require('cookie-session');
const path = require('path');
const compression = require('compression');
// const rateLimiter = require('express-rate-limit');

const dashboardRouter = require('./routes/dashboard');
const profileRouter = require('./routes/profile');
const messengerRouter = require('./routes/messenger');
const challengeRouter = require('./routes/challenge');
const friendRouter = require('./routes/friend');
const statisticsRouter = require('./routes/statistics');
const gameRouterRouter = require('./routes/game');
const signUpRouter = require('./routes/signUp');
const signInRouter = require('./routes/signIn');
const signOutRouter = require('./routes/signOut');
const pageViewRouter = require('./routes/pageView');
const testRouter = require('./routes/test');
const getRouter = require('./routes/get');
const statusRouter = require('./routes/status');
const messengerStatusRouter = require('./routes/messengerStatus');
const onlineRouter = require('./routes/online');
const trainingRouter = require('./routes/training');
const settingRouter = require('./routes/setting');
const receiveRouter = require('./routes/receive');
const innerRouter = require('./routes/inner');
const joinUsRouter = require('./routes/joinUs');

const app = express();
// const limiter = rateLimiter({
//     windowMs: 2 * 60 * 1000, // 2 minutes
//     max: 200
// });

app.use(helmet({
    contentSecurityPolicy: false
}));
// app.use(helmet.contentSecurityPolicy({
//     directives: {
//         defaultSrc: ["'self'"],
//         connectSrc: ["'self'", "ws://127.0.0.1:4500"]
//     }
// }));
app.use(cors());
app.use(compression());
// app.use(limiter);
app.use(express.json());

app.use(cookieSession({
    name: 'adasik:sess',
    // secure: process.env.NODE_ENV !== 'test',
    maxAge: 5 * 1000 * 60 * 60 * 24,
    secret: 'adasik'
}));

app.use('/api/dashboard', dashboardRouter);
app.use('/api/profile', profileRouter);
app.use('/api/messenger', messengerRouter);
app.use('/api/challenge', challengeRouter);
app.use('/api/friend', friendRouter);
app.use('/api/statistics', statisticsRouter);
app.use('/api/game', gameRouterRouter);
app.use('/api/auth/signUp', signUpRouter);
app.use('/api/auth/signIn', signInRouter);
app.use('/api/auth/signOut', signOutRouter);
app.use('/api/pageview', pageViewRouter);
app.use('/api/test', testRouter);
app.use('/api/get', getRouter);
app.use('/api/status', statusRouter);
app.use('/api/messengerStatus', messengerStatusRouter);
app.use('/api/online', onlineRouter);
app.use('/api/training', trainingRouter);
app.use('/api/setting', settingRouter);
app.use('/api/receive', receiveRouter);
app.use('/api/inner', innerRouter);
app.use('/api/joinUs', joinUsRouter);

app.use(express.static(path.join(__dirname, 'client', 'public')));
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'public', 'index.html'));
});

app.listen(3000, () => {
    console.log('API server is up on port 3000');
});
