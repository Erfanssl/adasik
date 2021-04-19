const express = require('express');
const dataDecryption = require('../utils/dataDecryption');
const fs = require('fs');
const path = require('path');

const receiveRouter = express.Router();

receiveRouter.get('/avatar/:encryptedUsername', async (req, res) => {
    try {
        const username = dataDecryption(req.params.encryptedUsername.toString()).split('.')[0];

        const imagePath = path.resolve(__dirname, '..', 'storage', 'images', username + '.jpg');

        let avatar;

        if (fs.existsSync(imagePath)) avatar = fs.createReadStream(imagePath);
        else throw new Error();

        res.writeHead(200, { 'Content-Type': 'image/jpeg' });

        avatar.pipe(res);
    } catch (err) {
        res.status(404).send({ 'Error': 'Not Found' });
    }
});

module.exports = receiveRouter;