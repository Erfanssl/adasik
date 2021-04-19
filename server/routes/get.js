const express = require('express');
const auth = require('../middlewares/auth');
const currentUser = require('../middlewares/currentUser');
const dataEncryption = require('../utils/dataEncryption');

// route for sending encrypted data to the client
const getRouter = express.Router();

getRouter.get('/', currentUser, auth, async (req, res) => {
    const text = req.user.username;

    const data = dataEncryption(text);

    return res.send({
        text: data
    });
});

module.exports = getRouter;