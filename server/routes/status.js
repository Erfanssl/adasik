// this api works with socket server
const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middlewares/auth');
const currentUser = require('../middlewares/currentUser');

const statusRouter = express.Router();

const User = mongoose.model('User');
// const Friend = mongoose.model('Friend');

statusRouter.post('/', currentUser, auth, async (req, res) => {
    try {
        const { status } = req.body;

        // first, we change the status of the user base on what we got from the socket
        await User.updateOne({
            _id: req.user.id
        }, {
            $set: {
                status: {
                    text: status,
                    date: new Date()
                }
            }
        });

        res.send({ Message: 'Successful' });
    } catch (err) {
        res.status(500).send({ Error: 'Could not update the status' });
    }
});

module.exports = statusRouter;