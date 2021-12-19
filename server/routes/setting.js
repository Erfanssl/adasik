const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const sharp = require('sharp');
const currentUser = require('../middlewares/currentUser');
const auth = require('../middlewares/auth');
const dataEncryption = require('../utils/dataEncryption');
const bcrypt = require('bcryptjs');

const User = mongoose.model('User');
const Setting = mongoose.model('Setting');
const DeletedUser = mongoose.model('DeletedUser');
const Challenge = mongoose.model('Challenge');
const Friend = mongoose.model('Friend');
const AllGame = mongoose.model('AllGame');
const Ranking = mongoose.model('Ranking');

const settingRouter = express.Router();

settingRouter.post('/profile/avatar/:cropMetadata', currentUser, auth, async (req, res) => {
    try {
        const cropMetadata = req.params.cropMetadata.toString();
        const [left, top, imageWidth, imageHeight, squareWidth, squareHeight] = cropMetadata.toString().split('.');

        const manipulatedImage = sharp()
            .resize(Number(imageWidth), Number(imageHeight))
            .extract({
                left: Number(left) <= 0 ? 0 : Number(left),
                top: Number(top) <= 0 ? 0 : Number(top),
                width: Number(squareWidth),
                height: Number(squareHeight)
            })
            .jpeg();

        const write = fs.createWriteStream(`storage/images/${ req.user.username }.jpg`);
        const url = `/api/receive/avatar/${ dataEncryption(req.user.username.toString() + '.' + cropMetadata) }`;

        req.pipe(manipulatedImage).pipe(write);

        req.on('end', () => {
            res.send({ url });
        });
    } catch (err) {
        res.status(400).send({ 'Error': 'Could not set the avatar' });
    }
});

settingRouter.get('/profile', currentUser, auth, async (req, res) => {
    try {
        const userQuery = await User.aggregate([
            {
                $match: {
                    _id: mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $project: {
                    _id: 0,
                    phoneNumber: 1,
                    prePhoneNumber: 1,
                    securityQuestions: 1,
                    information: '$info.general'
                }
            }
        ]);

        const isSecurityQuestionsValid = !!userQuery[0].securityQuestions && !!userQuery[0].securityQuestions.one && !!userQuery[0].securityQuestions.two && !!userQuery[0].securityQuestions.one.answer &&  !!userQuery[0].securityQuestions.two.answer;

        res.send({ ...userQuery[0].information, phoneNumber: userQuery[0].phoneNumber, prePhoneNumber: userQuery[0].prePhoneNumber, securityQuestions: isSecurityQuestionsValid });
    } catch (err) {

    }
});

// route for handling the new data tha should be set
settingRouter.post('/profile', currentUser, auth, async (req, res) => {
    try {
        // we need to get and validate the data
        const {
            type,
            fullName,
            gender,
            birthday,
            phoneNumber,
            prePhoneNumber,
            job,
            location,
            philosophy,
            bio,
            education,
            howHeardUs,
            social,
            avatar,
            securityQuestions
        } = req.body;

        if (!fullName || fullName.trim().length <= 0) throw new Error();
        if (!birthday || !birthday.day || !birthday.month || !birthday.year) throw new Error();

        if (phoneNumber && prePhoneNumber) {
            // we check to see if they're unique
            const userQuery = await User.aggregate([
                {
                    $match: {
                        phoneNumber
                    }
                },
                {
                    $project: {
                        prePhoneNumber: 1
                    }
                }
            ]);

            if (userQuery && userQuery[0]) {
                // means the number is already exists but we should check if it's from the same country
                // we should check that the person is not the same person as user
                if (userQuery[0].prePhoneNumber === prePhoneNumber  && userQuery[0]._id.toString() !== req.user.id.toString()) return res.status(400).send({ PhoneError: 'Phone already exists' });
            }
        }

        // constructing data to change
        const dataToSet = {};
        dataToSet['info.general.name'] = fullName;
        if (gender) dataToSet['info.general.gender'] = gender;
        if (phoneNumber) dataToSet.phoneNumber = phoneNumber.startsWith('0') ? phoneNumber.substring(1) : phoneNumber;
        // if (type === 'submit' && prePhoneNumber) dataToSet.prePhoneNumber = prePhoneNumber;
        if (prePhoneNumber) dataToSet.prePhoneNumber = prePhoneNumber;
        if (job) dataToSet['info.general.job'] = job;
        if (location) {
            if (location.city) dataToSet['info.general.location.city'] = location.city;
            if (location.country) dataToSet['info.general.location.country'] = location.country;
            if (location.coords) dataToSet['info.general.location.coords'] = location.coords;
        }
        if (philosophy) dataToSet['info.general.philosophy'] = philosophy;
        if (bio) dataToSet['info.general.bio'] = bio;
        if (education) dataToSet['info.general.education'] = education;
        if (howHeardUs) dataToSet['info.general.howHeardUs'] = howHeardUs;
        if (social) {
            if (social.twitter) dataToSet['info.general.social.twitter'] = social.twitter;
            if (social.instagram) dataToSet['info.general.social.instagram'] = social.instagram;
            if (social.facebook) dataToSet['info.general.social.facebook'] = social.facebook;
            if (social.youtube) dataToSet['info.general.social.youtube'] = social.youtube;
        }
        if (birthday) {
            if (birthday.day) dataToSet['info.general.birthday.day'] = birthday.day;
            if (birthday.month) dataToSet['info.general.birthday.month'] = birthday.month;
            if (birthday.year) dataToSet['info.general.birthday.year'] = birthday.year;
        }
        if (avatar) dataToSet['info.general.avatar'] = avatar;
        if (
            securityQuestions && securityQuestions.one && securityQuestions.one.question && securityQuestions.one.answer
            && securityQuestions.two && securityQuestions.two.question && securityQuestions.two.answer
        ) {
            const saltOne = await bcrypt.genSalt(10);
            const saltTwo = await bcrypt.genSalt(10);
            const hashedAnswerOne = await bcrypt.hash(securityQuestions.one.answer.trim().toLowerCase(), saltOne);
            const hashedAnswerTwo = await bcrypt.hash(securityQuestions.two.answer.trim().toLowerCase(), saltTwo);

            dataToSet['securityQuestions'] = {
                one: {
                    question: securityQuestions.one.question,
                    answer: hashedAnswerOne
                },
                two: {
                    question: securityQuestions.two.question,
                    answer: hashedAnswerTwo
                }
            }
        }

        // now we update the values
        await User.updateOne({
            _id: req.user.id
        }, {
            $set: dataToSet
        });

        res.send({ Message: 'Successfully set the data' });
    } catch (err) {
        res.status(400).send({ Error: 'Invalid Data' });
    }
});

// route for sending data about messenger setting
settingRouter.get('/messenger', currentUser, auth, async (req, res) => {
    try {
        const messengerSettingQuery = await Setting.findOne({ userId: req.user.id }, { _id: 0, messenger: 1 });
        const privacySettingData = messengerSettingQuery === null ? [] : messengerSettingQuery.messenger;

        res.send(privacySettingData);
    } catch (err) {
        res.status(404).send({ 'Error': 'Could not fetch the messenger settings data' });
    }
});

// route for receiving data about messenger setting
settingRouter.post('/messenger', currentUser, auth, async (req, res) => {
    try {
        const messengerSettingsArr  = req.body;

        const pushArr = [];
        const pullArr = [];

        messengerSettingsArr.forEach(messengerSettingObj => {
            if (messengerSettingObj.bool) pushArr.push(messengerSettingObj.value);
            else pullArr.push(messengerSettingObj.value);
        });

        // now we do the action and update
        await Setting.updateOne({
            userId: req.user.id
        }, {
            $addToSet: {
                messenger: {
                    $each: pushArr
                }
            }
        });

        await Setting.updateOne({
            userId: req.user.id
        }, {
            $pullAll: {
                messenger: pullArr
            }
        });

        // we increment the changedTimes by 1
        await Setting.updateOne({
            userId: req.user.id
        }, {
            $inc: {
                changedTimes: 1
            }
        });

        return res.send({ 'Message': 'Successfully update the messenger settings' });
    } catch (err) {
        res.status(400).send({ 'Error': 'Could not update the messenger settings' });
    }
});

// route for sending data about privacy setting
settingRouter.get('/privacy', currentUser, auth, async (req, res) => {
    try {
        const privacySettingQuery = await Setting.findOne({ userId: req.user.id }, { _id: 0, privacy: 1 });
        const privacySettingData = privacySettingQuery === null ? [] : privacySettingQuery.privacy;

        res.send(privacySettingData);
    } catch (err) {
        res.status(404).send({ 'Error': 'Could not fetch the privacy settings data' });
    }
});

// route for receiving data about privacy setting
settingRouter.post('/privacy', currentUser, auth, async (req, res) => {
    try {
        const privacySettingsArr  = req.body;

        const pushArr = [];
        const pullArr = [];

        privacySettingsArr.forEach(privacySettingObj => {
            if (privacySettingObj.bool) pushArr.push(privacySettingObj.value);
            else pullArr.push(privacySettingObj.value);
        });

        // now we do the action and update
        await Setting.updateOne({
            userId: req.user.id
        }, {
            $addToSet: {
                privacy: {
                    $each: pushArr
                }
            }
        });

        await Setting.updateOne({
            userId: req.user.id
        }, {
            $pullAll: {
                privacy: pullArr
            }
        });

        // we increment the changedTimes by 1
        await Setting.updateOne({
            userId: req.user.id
        }, {
            $inc: {
                changedTimes: 1
            }
        });

        return res.send({ 'Message': 'Successfully update the privacy settings' });
    } catch (err) {
        res.status(400).send({ 'Error': 'Could not update the privacy settings' });
    }
});

// route for sending data about account for settings/other/account
settingRouter.get('/account', currentUser, auth, async (req, res) => {
    try {
        const userQuery = await User.aggregate([
            {
                $match: {
                    _id: mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $project: {
                    _id: 0,
                    username: 1,
                    email: 1
                }
            }
        ]);

        res.send(userQuery[0]);
    } catch (err) {
        res.status(500).send({ Error: 'Could not construct the data' });
    }
});

// route for handling change email
settingRouter.post('/account/email', currentUser, auth, async (req, res) => {
    try {
        const { email } = req.body;
        // we first should validate the email
        if (!email.match(/^.+@.+\.[a-z]+$/i)) return res.status(401).send({ ValidationError: 'Bad Input' });

        // we check to see if the password is free to use
        const user = await User.findOne({ email });

        if (user) return res.status(401).send({ ValidationError: 'Email already exists' });

        // now we can set the new email
        await User.updateOne({
            _id: req.user.id
        }, {
            $set: {
                email
            }
        });

        res.send({ Message: 'Successful' });
    } catch (err) {
        res.status(500).send({ Error: 'Could not change the email' });
    }
});

// route for handling change username
settingRouter.post('/account/username', currentUser, auth, async (req, res) => {
    try {
        const { username } = req.body;

        // we first should validate the username
        function validateUsername(username) {
            let allowChar = false;

            if (username.trim().length < 4 || username.trim().length > 16) return false;

            let finalAllowChar = true;
            for (let i = 0; i < username.trim().length; i++) {
                allowChar = false;
                if (
                    (username[i].charCodeAt(0) >= 65 && username[i].charCodeAt(0) <= 90) ||
                    (username[i].charCodeAt(0) >= 97 && username[i].charCodeAt(0) <= 122)
                ) allowChar = true;
                if (username[i].charCodeAt(0) >= 48 && username[i].charCodeAt(0) <= 57) allowChar = true;
                if (username[i] === '_') allowChar = true;
                if (username[i] === '.') allowChar = true;
                if (!allowChar) {
                    finalAllowChar = false;
                    break;
                }
                allowChar = false;
            }

            return finalAllowChar;
        }

        const isUsernameValid = validateUsername(username);

        if (!isUsernameValid) return res.status(401).send({ ValidationError: 'Bad Input' });

        // we check to see if the username is free to use
        const user = await User.findOne({ username });

        if (user) return res.status(401).send({ ValidationError: 'Username already exists' });

        // now we can set the new email
        await User.updateOne({
            _id: req.user.id
        }, {
            $set: {
                username
            }
        });

        res.send({ Message: 'Successful' });
    } catch (err) {
        res.status(500).send({ Error: 'Could not change the username' });
    }
});

settingRouter.post('/account/password', currentUser, auth, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        // we first should validate the password
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

        const isPasswordAvailable = validatePassword(newPassword);

        if (!isPasswordAvailable) return res.status(401).send({ ValidationError: 'Bad Input' });

        // we also need to see if the old password is the actual password of the user.
        const user = await User.aggregate([
            {
                $match: {
                    _id: mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $project: {
                    _id: 0,
                    password: 1
                }
            }
        ]);

        const passwordMatch = await bcrypt.compare(oldPassword, user[0].password);

        if (!passwordMatch) return res.status(401).send({ MatchError: 'Password is incorrect' });

        // hashing the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // now we can change the password to new one
        await User.updateOne({
            _id: req.user.id
        }, {
            $set: {
                password: hashedPassword
            }
        });

        return res.send({ Message: 'Successful' });
    } catch (err) {
        res.status(500).send({ Error: 'Could not change the password' });
    }
});

// route for handling deleting account
settingRouter.delete('/account', currentUser, auth, async (req, res) => {
    try {
        // we first make sure that the user doesn't have any active challenges
        const challengeQuery = await Challenge.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $project: {
                    _id: 0,
                    activeChallenges: {
                        $size: '$challenges.active'
                    }
                }
            }
        ]);

        if (challengeQuery[0].activeChallenges !== 0) return res.status(401).send({ ChallengeError: 'Challenge Error' });

        // we then move the user to DeleteUser collection for analysis (why he/she delete his/her account)
        const user = await User.aggregate([
            {
                $match: {
                    _id: mongoose.Types.ObjectId(req.user.id)
                }
            }
        ]);

        await DeletedUser.create(user[0]);

        // now we need to get user's friends and make the user disappear in their friends list
        const friendQuery = await Friend.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $project: {
                    _id: 0,
                    friends: 1
                }
            }
        ]);

        if (friendQuery[0].friends.length) {
            await Friend.updateMany({
                userId: {
                    $in: friendQuery[0].friends.map(userId => mongoose.Types.ObjectId(userId))
                }
            }, {
                $pull: {
                    friends: req.user.id
                }
            });
        }

        // we also need to delete the user in the best players of the games (if exists)
        await AllGame.updateMany({}, {
            $pull: {
                bestPlayers: { userId: req.user.id }
            }
        });

        // we need to change the rankings and delete the user from that
        const rankingQuery = await Ranking.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $project: {
                    _id: 0,
                    rank: 1
                }
            }
        ]);

        if (rankingQuery && rankingQuery[0]) {
            const userRank = rankingQuery[0].rank;

            // we update the users whose ranks are worse that the user
            await Ranking.updateMany({
                rank: {
                    $gt: userRank
                }
            }, {
                $inc: {
                    rank: -1
                }
            });

            // now we delete the user from the list
            await Ranking.deleteOne({ userId: req.user.id });
        }

        // now we delete the user from the main User collection
        await User.deleteOne({
            _id: req.user.id
        });

        res.send({ Message: 'Successful' });
    } catch (err) {
        res.status(500).send({ Error: 'Could not delete the user' });
    }
});


module.exports = settingRouter;
