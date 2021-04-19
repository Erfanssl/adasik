const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middlewares/auth');
const currentUser = require('../middlewares/currentUser');

const signOutRouter = express.Router();
const CookieSession = mongoose.model('CookieSession');

signOutRouter.get('/', currentUser, auth, async (req, res) => {
    try {
        // delete the session in the database associate to the user
        await CookieSession.deleteOne({ _id: req.user.sessionId });

        // clean the cookie in the browser
        req.session = null;

        return res.send({ 'Message': 'Successfully signed out the user.' });
    } catch (err) {
        return res.status(500).send({ 'Error': 'Unable to sign the user out.' });
    }
});

module.exports = signOutRouter;