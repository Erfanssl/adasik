const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const keys = require('../config/keys');

const CookieSession = mongoose.model('CookieSession');
const User = mongoose.model('User');

const currentUser = async (req, res, next) => {
    try {
        const authorizationHeader = req.headers['authorization'];

        if (!req.session?.jwt && !authorizationHeader) {
            req.currentUser = null;

            return next();
        }

        if (req.session?.jwt) {
            // we get the sessionId from the jwt
            const sessionId = jwt.verify(req.session?.jwt, keys.JWT_COOKIE_SECRET).id;

            // we get the user info from the session in the database
            const userSession = await CookieSession.findOne({_id: sessionId});

            const userJwt = userSession.info;

            const {id, email} = jwt.verify(userJwt, keys.JWT_SESSION_SECRET);

            const user = await User.findOne({_id: id, email});

            if (!user) {
                req.currentUser = null;

                return next();
            }

            req.user = {
                id,
                username: user.username,
                sessionId
            };

            req.currentUser = req.user;
        }

        if (authorizationHeader) {
            const userJwt = authorizationHeader.replace('Bearer ', '');
            const username = jwt.verify(userJwt, keys.JWT_SOCKET_SECRET).username;

            const user = await User.findOne({username});

            if (!user) {
                req.currentUser = null;

                return next();
            }

            req.user = {
                id: user._id,
                username: user.username
            };

            req.currentUser = req.user;
        }

        next();
    } catch (err) {
        return res.status(401).send({'Error': 'You are not logged in.'});
    }
};

module.exports = currentUser;