const crypto = require('crypto');
const keys = require('../config/keys');
const algorithm = 'aes-256-cbc';

function messageEncryption(data) {
    const cipher = crypto.createCipheriv(
        algorithm,
        Buffer.from(keys.MESSAGE_ENCRYPT_KEY_SECRET, 'hex'),
        Buffer.from(keys.MESSAGE_IV_KEY_SECRET, 'hex'),
    );

    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return encrypted.toString('hex');
}

module.exports = messageEncryption;