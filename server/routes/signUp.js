const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');
const messageEncryption = require('../utils/messageEncryption');

const signUpRouter = express.Router();

const User = mongoose.model('User');
const WebsitePageviewSession = mongoose.model('WebsitePageviewSession');
const Challenge = mongoose.model('Challenge');
const Friend = mongoose.model('Friend');
const Game = mongoose.model('Game');
const History = mongoose.model('History');
const Messenger = mongoose.model('Messenger');
const Ranking = mongoose.model('Ranking');
const Setting = mongoose.model('Setting');
const Like = mongoose.model('Like');
const Block = mongoose.model('Block');
const Test = mongoose.model('Test');


// TODO: 2-FACTOR AUTH

signUpRouter.post('/', async (req, res) => {
    try {
        // TODO: use CSRF tokens
        const { username:preUsername, email, password } = req.body;
        const username = preUsername.toLowerCase();

        // we should validate the data, we did it in the client but we should do that here too
        // email
        if (!email.match(/^.+@.+\.[a-z]+$/i)) throw new Error();

        // username
        function validateUsername(username) {
            let allowChar = false;

            if (username.trim().toLowerCase() === 'anonymous') return false;
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
        if (!isUsernameValid) throw new Error();
        
        // password
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
        if (!isPasswordValid) throw new Error();

        // check to see if the email and the user is unique or not
        // username
        const usernameExistQuery = await User.findOne({ username }, { _id: 0, username: 1 });
        if (usernameExistQuery) throw new Error();

        // email
        const emailExistQuery = await User.findOne({ email }, { _id: 0, email: 1 });
        if (emailExistQuery) throw new Error();

        // we need to get the rank of the user
        let chosenRank;
        // we first check to see if there is a user
        const isUserRank = await Ranking.findOne();
        if (!isUserRank) {
            chosenRank = [{ rank: 0 }];
        }

        if (isUserRank) {
            const userPreRank = await Ranking.find({ totalScore: 10 }).sort({ rank: -1 }).limit(1);
            if (userPreRank) chosenRank = userPreRank;
            if (!userPreRank.length) {
                const userSecondPreRank = await Ranking.find({ totalScore: { $lt: 10 } }).sort({ rank: 1 }).limit(1);
                // if there is, means we have worse rank compare to the user so, we should rank it up
                if (userSecondPreRank.length) chosenRank = [{ rank: userSecondPreRank[0].rank - 1 }];
            }
            if (!chosenRank.length) {
                const userThirdPreRank = await Ranking.find({}).sort({ rank: -1 }).limit(1);
                chosenRank = userThirdPreRank;
            }
        }

        const userNewRank = chosenRank[0].rank + 1;

        const user = await User.create({
            email,
            password,
            username,
            phoneNumber: '',
            prePhoneNumber: '',
            status: {
                text: 'online',
                date: new Date()
            },
            info: {
                general: {
                    name: '',
                    job: '',
                    age: 0,
                    birthday: {
                        day: 0,
                        month: 0,
                        year: 0
                    },
                    memberSince: new Date(),
                    lastSeen: new Date(),
                    gender: null,
                    education: '',
                    social: [],
                    bio: '',
                    avatar: '/images/user.4a895b672114f74207a1dd182ad35838.svg',
                    location: {
                        country: '',
                        city: '',
                        coords: []
                    },
                    philosophy: '',
                    howHeardUs: '',
                    likes: 1
                },
                specific: {
                    whole: {
                        totalScore: 10,
                        trainingScore: 10,
                        rank: userNewRank,
                        level: {
                            level: 1,
                            progress: 30,
                            destination: 100
                        },
                        group: {
                            name: '',
                            link: ''
                        },
                        friends: 0,
                        games: {
                            total: 0,
                            win: 0,
                            lose: 0,
                            draw: 0
                        },
                        trainings: 0
                    },
                    detailed: {
                        brain: {
                            calculation: 0,
                            judgement: 0,
                            speed: 0,
                            accuracy: 0,
                            flexibility: 0,
                            problemSolving: 0,
                            attention: 0,
                            memory: 0,
                            creativity: 0
                        },
                        personality: {
                            competence: 0,
                            curiosity: 0,
                            depressive: 0,
                            obsessive: 0,
                            confidence: 0,
                            social: 0,
                            stability: 0,
                            emotional: 0,
                            aggressive: 0,
                            extroversion: 0
                        }
                    },
                    abstract: {
                        personality: {
                            believeInGod: 0,
                            believeInAfterLife: 0,
                            thinkAboutMeaningOfLife: 0,
                            perfectionism: 0,
                            logic: 0,
                            insignificance: 0,
                            forgiveness: 0,
                            optimism: 0,
                            softy: 0,
                            empathy: 0,
                            ambitious: 0,
                            energy: 0,
                            concentration: 0,
                            riskTaker: 0,
                            abstract: 0,
                            workInParallel: 0,
                            simplifier: 0,
                            exercise: 0,
                            mentalClarity: 0,
                            moody: 0,
                            organized: 0,
                            management: 0
                        },
                        brain: {
                            responseInhibition: 0,
                            informationProcessing: 0,
                            selectiveAttention: 0,
                            dividedAttention: 0
                        }
                    }
                },
            }
        });

        // now we need to create some collections for the user
        // Ranking
        // we need to get the list of below ranks
        if (isUserRank) {
            const usersRankList = await Ranking.find({ rank: { $gte: userNewRank } }, { _id: 0, rank: 1 });

            if (usersRankList.length) {
                // we increment the below ranks by one
                await Ranking.updateMany({
                    rank: { $in: usersRankList.map(userRank => userRank.rank) }
                }, {
                    $inc: {
                        rank: 1
                    }
                });
            }
        }

        // now can add the user with his/her rank
        await Ranking.create({
            userId: user._id,
            totalScore: 10,
            rank: userNewRank
        });

        // challenges
        await Challenge.create({
            userId: user._id,
            challenges: {
                active: [],
                inactive: []
            },
            requests: [],
            userRequestCounter: {
                pending: 0,
                accepted: 0,
                rejected: 0
            }
        });

        // friends
        await Friend.create({
            userId: user._id,
            pending: [],
            friends: [],
            userReceivedRequestCounter: {
                accepted: 0,
                rejected: 0
            },
            userSentRequestCounter: {
                pending: 0,
                accepted: 0,
                rejected: 0
            }
        });

        // games
        await Game.create({
            userId: user._id,
            games: []
        });

        // tests
        await Test.create({
            userId: user._id,
            tests: []
        });

        // histories
        await History.create({
            userId: user._id,
            totalScore: [],
            trainingScore: [],
            rank: [],
            assignment: []
        });

        // messenger
        const adasikMessageId = new mongoose.Types.ObjectId();
        const userMessageId = new mongoose.Types.ObjectId();
        const createdAt = Date.now();

        // await Messenger.create({
        //         userId: user._id,
        //         persons: [{
        //             userId: '601679d33a1230395ce4ee51',
        //             messages: [{
        //                 _id: userMessageId,
        //                 message: messageEncryption('Welcome to Adasik!'),
        //                 type: 'regular',
        //                 from: '601679d33a1230395ce4ee51',
        //                 to: user._id,
        //                 status: 'sent',
        //                 isBuff: false,
        //                 toMessageId: adasikMessageId,
        //                 createdAt,
        //                 updatedAt: createdAt
        //             }],
        //             unseen: 1
        //         }]
        //     });

        await Messenger.create({
            userId: user._id,
            persons: []
        });

        // we should add it to the other user messages
        await Messenger.updateOne({
            userId: '601679d33a1230395ce4ee51'
        }, {
            $push: {
                'persons': {
                    userId: user._id,
                    username: username,
                    messages: [{
                        _id: adasikMessageId,
                        message: 'Welcome to Adasik!',
                        type: 'regular',
                        from: '601679d33a1230395ce4ee51',
                        to: user._id,
                        status: 'sent',
                        isBuff: false,
                        toMessageId: userMessageId,
                        createdAt: createdAt,
                        updatedAt: createdAt
                    }],
                    unseen: 0
                }
            }
        });

        // settings
        await Setting.create({
            userId: user._id,
            messenger : [
                "Allow other users to send you message",
                "Allow your friends to send you message"
            ],
            privacy : [
                "Allow other users to see your brain information (diagram)",
                "Allow other users to see your friends",
                "Allow other users to see your personal information (Age, Job, Education, Philosophy and Country)",
                "Allow other users to see your personality information (diagram)",
                "Enable notification"
            ],
            changedTimes : 0,
        });

        // Like
        await Like.create({
            userId: user._id,
            likes: [user._id],
            dislikes: [],
            userLikes: [],
            userDislikes: []
        });

        // Block
        await Block.create({
            userId: user._id,
            blocks: [],
            currentlyBlocking: 0,
            userGotBlockedCounter: 0,
            userDidBlockCounter: 0
        });

        // we generate the jwt base on the session to store in the browser
        const cookieJwt = await User.handleJwt(user._id, email);

        // handling websiteSession related to website views
        if (req.session?.pageViewSession) {
            const websiteSessionId = jwt.verify(req.session.pageViewSession, keys.JWT_PAGEVIEW_SESSION_SECRET).id;

            // we update the userId property of that pageViewSession
            await WebsitePageviewSession.updateOne({ _id: websiteSessionId }, {
                $set: {
                    userId: user._id
                }
            });
        }

        req.session.jwt = cookieJwt;

        res.status(201).send({ 'Message': 'Successfully created the user' });
    } catch (err) {
        res.status(400).send({ 'Error': 'Could not add sign up new user. reason: ' + err.message });
    }
});

// route for validating if the email or username is already taken
signUpRouter.get('/validator/:data', async (req, res) => {
    try {
        let [type, value] = req.params.data.split('+');
        if (type !== 'username' && type !== 'email') throw new Error();
        if (type === 'username') value = value.toLowerCase();

        // query for that value
        if (type === 'username' && value.toLowerCase() === 'anonymous') throw new Error();
        const user = await User.findOne({ [type]: value });

        if (user) throw new Error();

        return res.send({ 'Message': 'Available to use' });
    } catch (err) {
        return res.status(400).send({ 'Error': 'is already taken' });
    }
});

module.exports = signUpRouter;