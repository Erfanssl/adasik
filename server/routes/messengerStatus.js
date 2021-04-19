const express = require('express');
const mongoose = require('mongoose');
const currentUser = require('../middlewares/currentUser');
const auth = require('../middlewares/auth');

const messengerStatusRouter = express.Router();

const User = mongoose.model('User');
const Messenger = mongoose.model('Messenger');

messengerStatusRouter.post('/', currentUser, auth, async (req, res) => {
    try {
        const { status } = req.body;

        // first, we change the status of the user base on what we got from the socket
        await User.updateOne({
            _id: req.user.id
        }, {
            $set: {
                messengerStatus: {
                    text: status,
                    date: new Date()
                }
            }
        });

        // now we should get the user's people that are in his/her messenger
        const conversationsPersonIdQuery = await Messenger.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $unwind: '$persons'
            },
            {
                $project: {
                    _id: 0,
                    personId: '$persons.userId'
                }
            }
        ]);

        // we get their username
        const UserQuery = await User.aggregate([
            {
                $match: {
                    _id: {
                        $in: conversationsPersonIdQuery.map(person => mongoose.Types.ObjectId(person.personId))
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    username: 1
                }
            }
        ]);

        const conversationsUsernameArr = UserQuery.map(conv => conv.username);

        res.send(conversationsUsernameArr);
    } catch (err) {
        res.status(500).send({ Error: 'Could not update the Messenger Status' });
    }
});

module.exports = messengerStatusRouter;