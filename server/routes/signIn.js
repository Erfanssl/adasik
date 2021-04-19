const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');

const signInRouter = express.Router();
const User = mongoose.model('User');
const WebsitePageviewSession = mongoose.model('WebsitePageviewSession');

signInRouter.post('/', async (req, res) => {
    try {
        const { identifier, password } = req.body;
        const isEmail = identifier.includes('@');

        let user;

        // checking if there is such a user
        if (isEmail) {
            user = await User.findOne({ email: identifier });
        } else {
            user = await User.findOne({ username: identifier });
            if (!user) user = await User.findOne({ phoneNumber: identifier });
        }

        if (!user) return res.status(400).send({ 'InfoError': 'Wrong Information provided. Please change them' });

        // checking if the password does match
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) return res.status(400).send({ 'InfoError': 'Wrong Information provided. Please change them' });

        // we generate the jwt base on the session to store in the browser
        const cookieJwt = await User.handleJwt(user._id, user.email);

        // handling websiteSession related to website views
        if (req.session.pageViewSession) {
            const websiteSessionId = jwt.verify(req.session.pageViewSession, keys.JWT_PAGEVIEW_SESSION_SECRET).id;

            // we update the userId property of that pageViewSession
            await WebsitePageviewSession.updateOne({ _id: websiteSessionId }, {
                $set: {
                    userId: user._id
                }
            });
        }

        req.session.jwt = cookieJwt;

        return res.send({ Message: 'Successfully signed the user in' });
    } catch (err) {
        return res.status(500).send({ Error: 'Unable to Sign You In. Please try again.' });
    }
});

module.exports = signInRouter;