const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middlewares/auth');
const currentUser = require('../middlewares/currentUser');
const dataEncryption = require('../utils/dataEncryption');

const dashboardRouter = express.Router();

const User = mongoose.model('User');
const DailyAssignment = mongoose.model('DailyAssignment');
const History = mongoose.model('History');
const Messenger = mongoose.model('Messenger');
const Friend = mongoose.model('Friend');
const Challenge = mongoose.model('Challenge');
const AllGame = mongoose.model('AllGame');
const AllTest = mongoose.model('AllTest');
const Test = mongoose.model('Test');

const ONE_DAY = 1000 * 60 * 60 * 24;

dashboardRouter.get('/', currentUser, auth, async (req, res) => {
    try {
        const userInfo = await User.aggregate([
            {
                $match: {
                    _id: mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $project: {
                    _id: 1,
                    username: 1,
                    fullName: '$info.general.name',
                    whole: '$info.specific.whole',
                    install: '$info.general.install',
                    notification: '$info.general.notification'
                }
            }
        ]);

        // we need to produce data about new message, challenges that are user's turn, new friend requests, new challenge requests
        // messages
        const messengerQuery = await Messenger.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $unwind: '$persons'
            },
            {
                $match: {
                    'persons.unseen': { $ne: 0 }
                }
            },
            {
                $count: 'count'
            }
        ]);

        const newMessengerConversations = messengerQuery.length ? messengerQuery[0].count : 0;

        // friends
        const friendQuery = await Friend.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $project: {
                    _id: 0,
                    requests: {
                        $size: '$pending'
                    }
                }
            }
        ]);

        const newFriendRequests = friendQuery[0].requests;

        // challenges user should play
        const challengesShouldQuery = await Challenge.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $unwind: '$challenges.active'
            },
            {
                $project: {
                    side: {
                        $cond: { if: { $eq: [ "$challenges.active.turn", 'home' ] }, then: '$challenges.active.home', else: '$challenges.active.away' }
                    }
                }
            },
            {
                $match: {
                    'side.userId': mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $count: 'count'
            }
        ]);

        const challengesShouldPlay = challengesShouldQuery.length ? challengesShouldQuery[0].count : 0;

        // challenges requests
        const challengeRequestsQuery = await Challenge.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $unwind: '$requests'
            },
            {
                $count: 'count'
            }
        ]);

        const challengeRequests = challengeRequestsQuery.length ? challengeRequestsQuery[0].count : 0;

        // constructing data to send
        const whatsNewData = {
            newMessengerConversations,
            newFriendRequests,
            challengesShouldPlay,
            challengeRequests
        };

        const prevAssignmentQuery = await DailyAssignment.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(req.user.id)
                }
            }
        ]);

        const prevAssignment = prevAssignmentQuery[0];

        let assignmentDataUpdated = false;

        if (!prevAssignment || Date.now() > (new Date(prevAssignment?.createdAt).getTime() + ONE_DAY)) {
            if (prevAssignment) {
                // we check how much of his assignment the user has done
                let total = 0;
                let completed = 0;
                Object.keys(prevAssignment).forEach(assignment => {
                    if (prevAssignment[assignment] && Array.isArray(prevAssignment[assignment])) {
                        total += prevAssignment[assignment].length;
                        prevAssignment[assignment].forEach(individualAssignment => {
                            if (individualAssignment.completed) completed++;
                        });
                    }
                });

                let completionRate;
                if (total === 0) completionRate = 0;
                else completionRate = parseFloat((completed / total).toFixed(2));

                // now we push it to the history
                await History.updateOne({
                    userId: req.user.id
                }, {
                    $push: {
                        'assignment': completionRate
                    }
                });

                // we delete the prev one
                await DailyAssignment.deleteOne({ userId: req.user.id });
            }

            // then we create the new assignments
            // we want to generate random games to play as training
            const allGameQuery = await AllGame.aggregate([
                {
                    $match: {}
                }
            ]);

            const trainingArr = [];

            for (let i = 0; i < 3; i++) {
                const randomNum = Math.floor(Math.random() * allGameQuery.length);
                const game = allGameQuery.splice(randomNum, 1);

                trainingArr.push({
                    link: `/${ game[0].name.toLowerCase().split(' ').join('-') }`,
                    icon: game[0].icon,
                    completed: false
                });
            }

            // for test we go through tests and check to bring the allowed test base on the last time the user has taken
            const allTestQuery = await AllTest.aggregate([
                {
                    $match: {}
                }
            ]);

            // now we check the tests that user has had so far
            const testQuery = await Test.aggregate([
                {
                    $match: {
                        userId: mongoose.Types.ObjectId(req.user.id)
                    }
                },
                {
                    $unwind: '$tests'
                },
                {
                    $group: {
                        _id: '$tests.testId' ,
                        createdAt: { $max: '$tests.createdAt' }
                    }
                }
            ]);

            const availableTests = [];
            const testsArr = [];

            allTestQuery.forEach(test => {
                const chosenTest = testQuery.find(t => t._id.toString() === test._id.toString());

                if (!chosenTest) {
                    // means this is the first time user wants to take the test
                    availableTests.push({ name: test.name, icon: test.icon });
                }

                else if (new Date() - new Date(chosenTest.createdAt) >= ONE_DAY * 29) {
                    // means it's ready to retake
                    availableTests.push({ name: test.name, icon: test.icon });
                }
            });

            for (let i = 0; i < Math.min(availableTests.length, 3); i++) {
                const randomNum = Math.floor(Math.random() * availableTests.length);
                const test = availableTests.splice(randomNum, 1);

                testsArr.push({
                    link: `/${ test[0].name.split(' ').join('-') }`,
                    icon: test[0].icon,
                    completed: false
                });
            }

            await DailyAssignment.create({
                userId: req.user.id,
                training: trainingArr,
                challenge: [
                    {
                        started: false,
                        completed: false
                    },
                    {
                        started: false,
                        completed: false
                    },
                    {
                        started: false,
                        completed: false
                    }
                ],
                group: [],
                test:testsArr
            });

            assignmentDataUpdated = true;
        }

        const assignments = assignmentDataUpdated ? await DailyAssignment.find({ userId: req.user.id }) : prevAssignment;

        userInfo[0]._id = dataEncryption(userInfo[0]._id.toString());
        const data = {
            userInfo: userInfo[0],
            whatsNewData,
            assignments
        }

        return res.send(data);
    } catch (err) {
        return res.status(500).send({ Error: 'Could not construct the data' });
    }
});

// route for handling when user installs the app or accepts the notification
dashboardRouter.post('/tools', currentUser, auth, async (req, res) => {
    try {
        const { type } = req.body;

        if (type === 'install') {
            // we update install to be true
            await User.updateOne({
                _id: req.user.id
            }, {
                $set: {
                    'info.general.install': true
                }
            });
        }

        else if (type === 'notification') {
            // we update install to be true
            await User.updateOne({
                _id: req.user.id
            }, {
                $set: {
                    'info.general.notification': true
                }
            });
        }

        return res.send({ Message: 'Successful' });
    } catch (err) {
        return res.status(500).send({ Message: 'Could not save the data' });
    }
});

module.exports = dashboardRouter;