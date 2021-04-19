const crypto = require('crypto');
const keys = require('../config/keys');
const algorithm = 'aes-256-cbc';

function dataEncryption(data) {
    const cipher = crypto.createCipheriv(
        algorithm,
        Buffer.from(keys.PAYLOAD_ENCRYPT_KEY_SECRET, 'hex'),
        Buffer.from(keys.PAYLOAD_IV_KEY_SECRET, 'hex'),
    );

    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return encrypted.toString('hex');
}

module.exports = dataEncryption;