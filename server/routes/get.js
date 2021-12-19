const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middlewares/auth');
const currentUser = require('../middlewares/currentUser');
const noError = require('../middlewares/noError');
const dataEncryption = require('../utils/dataEncryption');

const User = mongoose.model('User');

// route for sending encrypted data to the client
const getRouter = express.Router();

getRouter.get('/', currentUser, noError, auth, async (req, res) => {
    try {
        const text = req.user.username;

        const data = dataEncryption(text);

        // we check to see if user's profile is complete or not
        const nameOfTheUser = await User.aggregate([
            {
                $match: { _id: mongoose.Types.ObjectId(req.user.id)}
            },
            {
                $project: {
                    _id: 0,
                    name: '$info.general.name'
                }
            }
        ]);

        return res.send({
            text: data,
            name: nameOfTheUser[0].name
        });
    } catch (err) {
        return res.status(500).send({ Error: 'Unable to get name data' });
    }
});

module.exports = getRouter;
