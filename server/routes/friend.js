const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middlewares/auth');
const currentUser = require('../middlewares/currentUser');
const dataEncryption = require('../utils/dataEncryption');
const dataDecryption = require('../utils/dataDecryption');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');
const makeRequest = require('../utils/makeRequest');

const friendRouter = express.Router();
const Friend = mongoose.model('Friend');
const User = mongoose.model('User');
const Block = mongoose.model('Block');
const Setting = mongoose.model('Setting');

const REQUEST_LIMIT = 50;
const CHALLENGE_LIMIT = 20;

// route for getting general information about friends
friendRouter.get('/data/:type', currentUser, currentUser, auth, async (req, res) => {
    try {
        let type = 'complete';
        if (req.params.type.toString() === 'friends') type = 'friends';
        // constructing data to send to the client
        let data = {};

        if (type === 'friends') {
            const { friends } = await Friend.findOne({ userId: req.user.id });

            const friendPersons = await User.aggregate([
                {
                    $match: {
                        _id: { $in: friends.map(f => mongoose.Types.ObjectId(f)) }
                    }
                },
                {
                    $project: {
                        username: 1,
                        status: 1,
                        fullName: '$info.general.name',
                        avatar: '$info.general.avatar'
                    }
                }
            ]);

            if (!friends.length) data = [];
            else data = friendPersons.map(f => ({ ...f, _id: dataEncryption(f._id.toString()) }));
        }

        else if (type === 'complete') {
            const { pending, friends } = await Friend.findOne({ userId: req.user.id });

            const pendingPersons = await User.aggregate([
                {
                    $match: {
                        _id: { $in: pending.map(f => mongoose.Types.ObjectId(f)) }
                    }
                },
                {
                    $project: {
                        username: 1,
                        status: 1,
                        fullName: '$info.general.name',
                        whole: '$info.specific.whole',
                        avatar: '$info.general.avatar'
                    }
                }
            ]);

            const friendPersons = await User.aggregate([
                {
                    $match: {
                        _id: { $in: friends.map(f => mongoose.Types.ObjectId(f)) }
                    }
                },
                {
                    $project: {
                        username: 1,
                        status: 1,
                        fullName: '$info.general.name',
                        avatar: '$info.general.avatar'
                    }
                }
            ]);

            if (!friends.length) data.friends = [];
            if (!pending.length) data.pending = [];

            if (pending.length) data.pending = pendingPersons.map(f => ({ ...f, _id: dataEncryption(f._id.toString()) }));
            if (friends.length) data.friends = friendPersons.map(f => ({ ...f, _id: dataEncryption(f._id.toString()) }));
        }

        res.send(data);
    } catch (err) {
        res.status(500).send({ 'Error': 'Could not send the data' });
    }
});

// route for when a person's request gets accepted
friendRouter.get('/request/:userIdToAccept', currentUser, auth, async (req, res) => {
    try {
        const userIdToAccept = dataDecryption(req.params.userIdToAccept.toString());

        if (!userIdToAccept) throw new Error('');

        if (userIdToAccept.toString() === req.user.id.toString()) throw new Error('');

        // we also need to increment the number of friends inside user's data but we need to make sure that this user is new
        const hasUserThisFriend = await Friend.findOne({
            userId: req.user.id, friends: { $in: [userIdToAccept] }
        }, {
            _id: 0,
            'friends.$': 1
        });

        if (!hasUserThisFriend) {
            // now we can increment
            await User.updateOne({
                _id: req.user.id
            }, {
                $inc: {
                    'info.specific.whole.friends': 1
                }
            });
        }

        const hasOtherUserThisFriend = await Friend.findOne({
            userId: userIdToAccept, friends: { $in: [req.user.id] }
        }, {
            _id: 0,
            'friends.$': 1
        });

        if (!hasOtherUserThisFriend) {
            // now we can increment
            await User.updateOne({
                _id: userIdToAccept
            }, {
                $inc: {
                    'info.specific.whole.friends': 1
                }
            });
        }

        // delete it from pending
        await Friend.updateOne({
            userId: req.user.id
        }, {
            $pull: {
                pending: userIdToAccept
            }
        });

        // we also delete other user's id from user pending array, in-case if both users had sent each other request
        await Friend.updateOne({
            userId: userIdToAccept
        }, {
            $pull: {
                pending: req.user.id
            }
        });

        // we increment the accepted property of userSentRequestCounter of the other user by 1 since the request was accepted
        // and decrement the pending requests
        await Friend.updateOne({
            userId: userIdToAccept
        }, {
            $inc: {
                'userSentRequestCounter.pending': -1,
                'userSentRequestCounter.accepted': 1
            }
        })

        // add it to the friends array
        await Friend.updateOne({
            userId: req.user.id
        }, {
            $addToSet: {
                friends: userIdToAccept
            }
        });

        // we increment accepted property of userReceivedRequestCounter by one
        await Friend.updateOne({
            userId: req.user.id
        }, {
            $inc: {
                'userReceivedRequestCounter.accepted': 1
            }
        });

        // we should add the user to other user friends collection
        await Friend.updateOne({
            userId: userIdToAccept
        }, {
            $addToSet: {
                friends: req.user.id
            }
        });

        res.send({ 'Message': 'Successfully Added to friends' });
    } catch (err) {
        res.status(400).send({ 'Error': 'Could not add to the friends' });
    }
});

// route for delete a person's request --> when request gets rejected
friendRouter.delete('/request/:userIdToDelete', currentUser, auth, async (req, res) => {
    try {
        const userIdToDelete = dataDecryption(req.params.userIdToDelete.toString());

        if (!userIdToDelete) throw new Error('');

        if (userIdToDelete.toString() === req.user.id.toString()) throw new Error('');

        await Friend.updateOne({
            userId: req.user.id
        }, {
            $pull: {
                pending: userIdToDelete
            }
        });

        // we increment the rejected property of userSentRequestCounter of the other user by 1 since the request was rejected
        // and decrement the pending requests
        await Friend.updateOne({
            userId: userIdToDelete
        }, {
            $inc: {
                'userSentRequestCounter.pending': -1,
                'userSentRequestCounter.rejected': 1
            }
        })

        // we also increment the rejected property of the userReceivedRequestCounter of the user
        await Friend.updateOne({
            userId: req.user.id
        }, {
            $inc: {
                'userReceivedRequestCounter.rejected': 1
            }
        });

        res.send({ 'Message': 'Successfully deleted the request' });
    } catch (err) {
        res.status(500).send({ 'Error': 'Could not delete the request' });
    }
});

// route for delete a person from the friends list
friendRouter.delete('/delete/:userIdToDelete', currentUser, auth, async (req, res) => {
    try {
        const userIdToDelete = dataDecryption(req.params.userIdToDelete.toString());

        if (!userIdToDelete) throw new Error('');

        if (userIdToDelete.toString() === req.user.id.toString()) throw new Error('');

        // we should remove id of the users for each one of them
        // for the user
        await Friend.updateOne({
            userId: req.user.id
        }, {
            $pull: {
                friends: userIdToDelete
            }
        });

        // for user's ex-friend
        await Friend.updateOne({
            userId: userIdToDelete
        }, {
            $pull: {
                friends: req.user.id
            }
        });

        // we need to update their friends number in their profile
        await User.updateMany({
            _id: { $in: [req.user.id, userIdToDelete] }
        }, {
            $inc: {
                'info.specific.whole.friends': -1
            }
        })

        res.send({ 'Message': 'Successfully deleted from the friends list' });
    } catch (err) {
        res.status(500).send({ 'Error': 'Could not delete the person from the friends list' });
    }
});

// route for when a request gets created
friendRouter.get('/request/create/:userIdToRequest', currentUser, auth, async (req, res) => {
    try {
        const userIdToRequest = dataDecryption(req.params.userIdToRequest.toString());

        if (!userIdToRequest) throw new Error('');

        if (userIdToRequest.toString() === req.user.id.toString()) throw new Error('');

        // we also check if the that user has blocked the user
        const blockQuery = await Block.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $unwind: '$blocks'
            },
            {
                $match: {
                    blocks: mongoose.Types.ObjectId(userIdToRequest)
                }
            },
            {
                $project: {
                    isBlocked: '$blocks'
                }
            }
        ]);

        const isBlocked = blockQuery.length;

        // we now want to send a notification to other user (we write it here to send the username even if is blocked)
        const user = await User.aggregate([
            {
                $match: {
                    _id: mongoose.Types.ObjectId(userIdToRequest)
                }
            },
            {
                $project: {
                    _id: 0,
                    status: 1,
                    username: 1
                }
            }
        ]);

        if (isBlocked) return res.send({ Message: 'Successfully sent the request to ' + user[0].username + ' .' });

        // we add the user id to the other user's pending array
        await Friend.updateOne({
            userId: userIdToRequest
        }, {
            $addToSet: {
                pending: req.user.id
            }
        });

        // we increment the pending property of userSentRequestCounter of the user
        await Friend.updateOne({
            userId: req.user.id
        }, {
            $inc: {
                'userSentRequestCounter.pending': 1
            }
        });


        // we need to make sure that the user's notification is on
        const settingQuery = await Setting.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $unwind: '$privacy'
            },
            {
                $match: {
                    privacy: 'Enable notification'
                }
            },
            {
                $count: 'count'
            }
        ]);

        if (user[0] && settingQuery[0] && user[0].status.text === 'offline') {
            const authorization = jwt.sign({ text: 'Adasik-Platform' }, keys.JWT_NOTIFICATION_SECRET);
            makeRequest('http://127.0.0.1:4000/send-notification', 'POST',{
                headers: {
                    'Authorization': `Bearer ${ authorization }`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: dataEncryption(userIdToRequest.toString()),
                    username: req.user.username,
                    type: 'friend'
                })
            }).catch();
        }

        return res.send({ Message: 'Successfully sent the request to ' + user[0].username + ' ..' });
    } catch (err) {
        return res.status(400).send({ 'Error': 'Could not send the request' });
    }
});

module.exports = friendRouter;