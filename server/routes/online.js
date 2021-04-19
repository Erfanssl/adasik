const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');

const onlineRouter = express.Router();

const Online = mongoose.model('Online');

onlineRouter.post('/', async (req, res) => {
    const { data } = req.body;

    const decryptedData = jwt.verify(data, keys.JWT_ONLINE_SECRET);

    await Online.create({
        visitors: decryptedData
    });

    res.send({ 'Message': 'Successful' });
});

module.exports = onlineRouter;