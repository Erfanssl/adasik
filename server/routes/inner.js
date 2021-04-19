const mongoose = require('mongoose');
const express = require('express');
const auth = require('../middlewares/auth');
const currentUser = require('../middlewares/currentUser');

const innerRouter = express.Router();

// models
const Messenger = mongoose.model('Messenger');
const Challenge = mongoose.model('Challenge');
const Friend = mongoose.model('Friend');


// route for handling inner notification
innerRouter.get('/inner-notification', currentUser, auth, async (req, res) => {
    try {
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
        const data = {
            newMessengerConversations,
            newFriendRequests,
            challengesShouldPlay,
            challengeRequests
        };

        return res.send(data);
    } catch (err) {
        return res.status(500).send({ Error: 'Could not construct the data' });
    }
});

module.exports = innerRouter;