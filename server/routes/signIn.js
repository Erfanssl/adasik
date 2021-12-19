const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');

const signInRouter = express.Router();
const User = mongoose.model('User');
const WebsitePageviewSession = mongoose.model('WebsitePageviewSession');

// route for handling sending data for logging in
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

// route for validating the identifier for forgetting password
signInRouter.post('/forgot-validate', async (req, res) => {
    try {
        const { identifier } = req.body;
        const isEmail = identifier.toString().includes('@');
        const toSearch = isEmail ? 'email' : 'username';

        const user = await User.aggregate([
            {
                $match: {
                    [toSearch]: identifier.toString()
                }
            },
            {
                $project: {
                    _id: 0,
                    username: 1,
                    securityQuestions: 1
                }
            }
        ]);

        if (!user || !user[0]) throw new Error();
        if (user[0] && (!user[0].securityQuestions || !user[0].securityQuestions.one.answer || !user[0].securityQuestions.two.answer)) throw new Error();

        delete user[0].securityQuestions.one.answer;
        delete user[0].securityQuestions.two.answer;

        return res.send({ ForgotValidationSucceed: true, securityQuestions: user[0].securityQuestions });
    } catch (err) {
        return res.status(404).send({ ForgotValidationError: 'Sorry, either this account doesn\'t exist or You didn\'t complete your security questions.' });
    }
});

// route for checking if the answers to security questions are accurate
signInRouter.post('/forgot-questions', async (req, res) => {
    try {
        const { answerOne, answerTwo, identifier } = req.body;
        const isEmail = identifier.toString().includes('@');
        const toSearch = isEmail ? 'email' : 'username';

        // we check to see if the answers are true
        const user = await User.aggregate([
            {
                $match: {
                    [toSearch]: identifier.toString()
                }
            },
            {
                $project: {
                    _id: 0,
                    securityQuestions: 1
                }
            }
        ]);

        if (!user || !user[0] || !user[0].securityQuestions) throw new Error('');

        const isAnswerOneTrue = await bcrypt.compare(answerOne.toString().trim().toLowerCase(), user[0].securityQuestions.one.answer);
        const isAnswerTwoTrue = await bcrypt.compare(answerTwo.toString().trim().toLowerCase(), user[0].securityQuestions.two.answer);

        if (!isAnswerOneTrue || !isAnswerTwoTrue) throw new Error('');

        return res.send({ AnswersCorrect: true });
    } catch (err) {
        return res.status(401).send({ AnswersError: 'Incorrect Answers' });
    }
});

// route for resetting the password
signInRouter.patch('/forgot-reset', async (req, res) => {
    try {
        const { password, identifier } = req.body;
        const isEmail = identifier.toString().includes('@');
        const toSearch = isEmail ? 'email' : 'username';

        function validatePassword(password) {
            let passwordValidity = false;
            let hasWord = false;
            let hasNumber = false;

            if (password.trim().length < 16) passwordValidity = false;
            else {
                for (let i = 0; i < password.trim().length; i++) {
                    if (password[i].charCodeAt(0) >= 48 && password[i].charCodeAt(0) <= 57) hasNumber = true;
                    if (
                        (password[i].charCodeAt(0) >= 65 && password[i].charCodeAt(0) <= 90) ||
                        (password[i].charCodeAt(0) >= 97 && password[i].charCodeAt(0) <= 122)
                    ) hasWord = true;

                    if (hasWord && hasNumber) {
                        passwordValidity = true;
                        break;
                    }
                }
            }

            return passwordValidity;
        }

        const isPasswordValid = validatePassword(password);
        if (!isPasswordValid) return res.status(401).send({ ResetValidationError: true });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password.toString(), salt);


        await User.updateOne({
            [toSearch]: identifier.toString()
        }, {
            $set: {
                password: hashedPassword
            }
        });

        return res.send({ ResetSucceed: true });
    } catch (err) {
        return res.status(500).send({ ResetError: 'Could not reset the password' });
    }
});

module.exports = signInRouter;
