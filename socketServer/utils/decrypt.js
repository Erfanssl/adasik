const crypto = require('crypto');
const keys = require('../config/keys');
const algorithm = 'aes-256-cbc';

function decrypt(text) {
    const decipher = crypto.createDecipheriv(
        algorithm,
        Buffer.from(keys.PAYLOAD_ENCRYPT_KEY_SECRET, 'hex'),
        Buffer.from(keys.PAYLOAD_IV_KEY_SECRET, 'hex')
    );

    const textBuffer = Buffer.from(text, 'hex');
    let decrypted = decipher.update(textBuffer);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
}

module.exports = decrypt;