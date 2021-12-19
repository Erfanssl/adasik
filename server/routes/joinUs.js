const express = require('express');
const mongoose = require('mongoose');
const currentUser = require('../middlewares/currentUser');
const joinUsRouter = express.Router();

const JoinUs = mongoose.model('JoinUs');

// route for handling incoming messages from join us in about us
joinUsRouter.post('/', currentUser, async (req, res) => {
    try {
        const { name, message } = req.body;

        const data = {
            name: name.toString(),
            message: message.toString()
        };

        if (req.user.id) data.userId = req.user.id;

        // now we save the message
        await JoinUs.create(data);

        return res.send({ Message: 'Successful' });
    } catch (err) {
        return res.status(500).send({ Error: 'Could not save the data' });
    }
})

module.exports = joinUsRouter;
